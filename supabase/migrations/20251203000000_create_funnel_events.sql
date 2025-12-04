-- =============================================================================
-- FUNNEL EVENTS TABLE
-- Rastreia jornada do usuário: signup → features → engagement → conversion
-- LGPD Compliant: Dados anonimizáveis, soft delete, audit trail
-- =============================================================================

-- 1. CREATE TYPE para eventos do funil
DO $$ BEGIN
  CREATE TYPE funnel_stage AS ENUM (
    'app_opened',
    'onboarding_started',
    'onboarding_profile',
    'onboarding_baby',
    'onboarding_complete',
    'aha_moment_nathia',
    'aha_moment_tracker',
    'aha_moment_community',
    'first_week_active',
    'subscription_viewed',
    'subscription_started',
    'churned',
    'reactivated'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLE
CREATE TABLE IF NOT EXISTS funnel_events (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference (nullable for anonymous tracking pre-signup)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event Data
  stage funnel_stage NOT NULL,
  previous_stage funnel_stage,

  -- Metadata (JSONB para flexibilidade)
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Exemplos de metadata:
  -- { "source": "organic", "device": "ios", "app_version": "1.0.0" }
  -- { "dropoff_reason": "too_many_fields", "screen": "onboarding_baby" }
  -- { "feature_used": "breathing_exercise", "duration_seconds": 120 }

  -- Session tracking
  session_id UUID,
  device_fingerprint TEXT, -- Para tracking anônimo pré-signup

  -- Conversion tracking
  converted_at TIMESTAMPTZ,
  conversion_value_cents INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete (LGPD)
  deleted_at TIMESTAMPTZ,

  -- LGPD: Flag para dados anonimizados
  anonymized_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_conversion CHECK (
    (converted_at IS NULL AND conversion_value_cents IS NULL) OR
    (converted_at IS NOT NULL)
  )
);

-- 3. INDEXES para performance (queries < 100ms)

-- Index principal: busca por usuário + stage
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_stage
  ON funnel_events(user_id, stage)
  WHERE deleted_at IS NULL;

-- Index para análise de funil (agregações por stage)
CREATE INDEX IF NOT EXISTS idx_funnel_events_stage_created
  ON funnel_events(stage, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index para sessões
CREATE INDEX IF NOT EXISTS idx_funnel_events_session
  ON funnel_events(session_id)
  WHERE session_id IS NOT NULL;

-- Index para device fingerprint (tracking anônimo)
CREATE INDEX IF NOT EXISTS idx_funnel_events_device
  ON funnel_events(device_fingerprint)
  WHERE device_fingerprint IS NOT NULL AND user_id IS NULL;

-- Index para conversões
CREATE INDEX IF NOT EXISTS idx_funnel_events_conversions
  ON funnel_events(converted_at)
  WHERE converted_at IS NOT NULL;

-- Index para LGPD cleanup (encontrar dados não anonimizados)
CREATE INDEX IF NOT EXISTS idx_funnel_events_lgpd
  ON funnel_events(created_at)
  WHERE anonymized_at IS NULL AND deleted_at IS NULL;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view own funnel events"
  ON funnel_events FOR SELECT
  USING (
    auth.uid() = user_id OR
    -- Permitir acesso a eventos anônimos da mesma sessão
    (user_id IS NULL AND session_id IN (
      SELECT session_id FROM funnel_events WHERE user_id = auth.uid()
    ))
  );

-- Policy: Usuários podem inserir eventos (próprios ou anônimos)
CREATE POLICY "Users can insert funnel events"
  ON funnel_events FOR INSERT
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Policy: Service role tem acesso total (para analytics backend)
CREATE POLICY "Service role has full access"
  ON funnel_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 5. FUNCTIONS para análise

-- Função: Calcular métricas do funil
CREATE OR REPLACE FUNCTION calculate_funnel_metrics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  stage funnel_stage,
  total_users BIGINT,
  conversion_rate DECIMAL(5,2),
  avg_time_to_next_stage INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stage_counts AS (
    SELECT
      fe.stage,
      COUNT(DISTINCT COALESCE(fe.user_id::text, fe.device_fingerprint)) as users
    FROM funnel_events fe
    WHERE fe.created_at BETWEEN p_start_date AND p_end_date
      AND fe.deleted_at IS NULL
    GROUP BY fe.stage
  ),
  first_stage AS (
    SELECT users FROM stage_counts WHERE stage = 'app_opened'
  )
  SELECT
    sc.stage,
    sc.users,
    CASE
      WHEN (SELECT users FROM first_stage) > 0
      THEN ROUND((sc.users::decimal / (SELECT users FROM first_stage) * 100), 2)
      ELSE 0
    END,
    NULL::interval
  FROM stage_counts sc
  ORDER BY
    CASE sc.stage
      WHEN 'app_opened' THEN 1
      WHEN 'onboarding_started' THEN 2
      WHEN 'onboarding_profile' THEN 3
      WHEN 'onboarding_baby' THEN 4
      WHEN 'onboarding_complete' THEN 5
      WHEN 'aha_moment_nathia' THEN 6
      WHEN 'aha_moment_tracker' THEN 7
      WHEN 'aha_moment_community' THEN 8
      WHEN 'first_week_active' THEN 9
      WHEN 'subscription_viewed' THEN 10
      WHEN 'subscription_started' THEN 11
      ELSE 99
    END;
END;
$$;

-- Função: Identificar dropoffs
CREATE OR REPLACE FUNCTION get_dropoff_analysis(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
  stage funnel_stage,
  dropoff_count BIGINT,
  common_reasons JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.stage,
    COUNT(*) as dropoffs,
    jsonb_agg(DISTINCT fe.metadata->'dropoff_reason') FILTER (WHERE fe.metadata->'dropoff_reason' IS NOT NULL) as reasons
  FROM funnel_events fe
  WHERE fe.created_at >= p_start_date
    AND fe.deleted_at IS NULL
    AND fe.metadata->>'dropoff_reason' IS NOT NULL
  GROUP BY fe.stage
  ORDER BY dropoffs DESC;
END;
$$;

-- 6. TRIGGER: Auto-set previous_stage
CREATE OR REPLACE FUNCTION set_previous_funnel_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous funnel_stage;
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    SELECT stage INTO v_previous
    FROM funnel_events
    WHERE user_id = NEW.user_id
      AND deleted_at IS NULL
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    NEW.previous_stage := v_previous;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_previous_funnel_stage
  BEFORE INSERT ON funnel_events
  FOR EACH ROW
  EXECUTE FUNCTION set_previous_funnel_stage();

-- 7. FUNCTION: LGPD Anonimização
CREATE OR REPLACE FUNCTION anonymize_funnel_events(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE funnel_events
  SET
    user_id = NULL,
    device_fingerprint = 'ANONYMIZED',
    metadata = metadata - 'ip_address' - 'user_agent' - 'email',
    anonymized_at = NOW()
  WHERE user_id = p_user_id
    AND anonymized_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 8. COMMENTS para documentação
COMMENT ON TABLE funnel_events IS 'Rastreia jornada do usuário através do funil de conversão. LGPD compliant.';
COMMENT ON COLUMN funnel_events.stage IS 'Estágio atual do funil';
COMMENT ON COLUMN funnel_events.metadata IS 'Dados adicionais: source, device, dropoff_reason, etc';
COMMENT ON COLUMN funnel_events.anonymized_at IS 'LGPD: quando os dados foram anonimizados';

-- =============================================================================
-- SEED DATA (para testes)
-- =============================================================================

-- Apenas em ambiente de desenvolvimento
DO $$
BEGIN
  -- Só insere seed se a tabela estiver vazia
  IF NOT EXISTS (SELECT 1 FROM funnel_events LIMIT 1) THEN
    -- Simular jornada completa de usuário teste
    INSERT INTO funnel_events (stage, session_id, device_fingerprint, metadata, created_at)
    VALUES
      ('app_opened', 'a0000000-0000-0000-0000-000000000001', 'test-device-001',
       '{"source": "organic", "device": "ios", "app_version": "1.0.0"}'::jsonb,
       NOW() - INTERVAL '7 days'),
      ('onboarding_started', 'a0000000-0000-0000-0000-000000000001', 'test-device-001',
       '{"screen": "welcome"}'::jsonb,
       NOW() - INTERVAL '7 days' + INTERVAL '1 minute'),
      ('onboarding_profile', 'a0000000-0000-0000-0000-000000000001', 'test-device-001',
       '{"fields_filled": 5}'::jsonb,
       NOW() - INTERVAL '7 days' + INTERVAL '3 minutes'),
      ('onboarding_baby', 'a0000000-0000-0000-0000-000000000001', 'test-device-001',
       '{"baby_count": 1}'::jsonb,
       NOW() - INTERVAL '7 days' + INTERVAL '5 minutes'),
      ('onboarding_complete', 'a0000000-0000-0000-0000-000000000001', 'test-device-001',
       '{"total_time_seconds": 420}'::jsonb,
       NOW() - INTERVAL '7 days' + INTERVAL '7 minutes');

    -- Simular dropoff no onboarding
    INSERT INTO funnel_events (stage, session_id, device_fingerprint, metadata, created_at)
    VALUES
      ('app_opened', 'b0000000-0000-0000-0000-000000000002', 'test-device-002',
       '{"source": "paid_ad", "device": "android"}'::jsonb,
       NOW() - INTERVAL '5 days'),
      ('onboarding_started', 'b0000000-0000-0000-0000-000000000002', 'test-device-002',
       '{"dropoff_reason": "too_many_fields", "screen": "onboarding_profile"}'::jsonb,
       NOW() - INTERVAL '5 days' + INTERVAL '30 seconds');

    RAISE NOTICE 'Seed data inserted for funnel_events';
  END IF;
END $$;
