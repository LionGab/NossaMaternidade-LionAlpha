-- =============================================================================
-- CRISIS INTERVENTIONS TABLE
-- Registra intervenções de crise para usuárias que precisam de ajuda urgente
-- CRÍTICO: Dados sensíveis de saúde mental - LGPD/HIPAA compliant
-- =============================================================================

-- 1. CREATE TYPES para crises
DO $$ BEGIN
  CREATE TYPE crisis_level AS ENUM (
    'low',        -- Preocupação leve, monitorar
    'moderate',   -- Precisa atenção, sugerir recursos
    'severe',     -- Intervenção necessária, mostrar recursos urgentes
    'critical'    -- Emergência, CVV/SAMU/CAPS imediatamente
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE crisis_type AS ENUM (
    'suicidal_ideation',    -- Ideação suicida
    'self_harm',            -- Automutilação
    'postpartum_depression', -- Depressão pós-parto
    'anxiety_attack',       -- Crise de ansiedade
    'overwhelm',            -- Sobrecarga emocional
    'domestic_violence',    -- Violência doméstica
    'baby_safety',          -- Preocupação com segurança do bebê
    'other'                 -- Outros
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intervention_status AS ENUM (
    'detected',           -- Crise detectada pelo sistema
    'resources_shown',    -- Recursos de ajuda exibidos
    'user_acknowledged',  -- Usuária viu os recursos
    'contacted_cvv',      -- Usuária clicou para ligar CVV
    'contacted_samu',     -- Usuária clicou para ligar SAMU
    'contacted_caps',     -- Usuária clicou para buscar CAPS
    'continued_chat',     -- Usuária continuou no chat
    'left_app',           -- Usuária saiu do app
    'resolved',           -- Crise resolvida (follow-up positivo)
    'escalated',          -- Escalado para equipe humana
    'follow_up_pending',  -- Aguardando follow-up
    'follow_up_completed' -- Follow-up realizado
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLE
CREATE TABLE IF NOT EXISTS crisis_interventions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference (REQUIRED para crises)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Crisis Classification
  level crisis_level NOT NULL,
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],

  -- Status tracking
  status intervention_status NOT NULL DEFAULT 'detected',

  -- Contexto da crise (SENSÍVEL - considerar criptografia)
  trigger_message TEXT, -- Mensagem que disparou a detecção
  matched_patterns TEXT[], -- Padrões que foram detectados
  context_summary TEXT, -- Resumo do contexto (IA gerado)

  -- Recursos oferecidos
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Ex: ['cvv_188', 'samu_192', 'caps_locator', 'breathing_exercise']

  -- Actions taken
  user_actions JSONB DEFAULT '[]'::jsonb,
  -- Ex: [{"action": "clicked_cvv", "timestamp": "...", "duration_seconds": 5}]

  -- Follow-up
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,

  -- Outcome
  outcome_notes TEXT,
  resolution_type TEXT, -- 'self_resolved', 'professional_help', 'ongoing_support'

  -- Session data
  session_id UUID,
  app_version TEXT,
  device_info JSONB,

  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete (LGPD)
  deleted_at TIMESTAMPTZ,

  -- LGPD: Anonimização
  anonymized_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),

  -- Priority for human review
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  -- 1 = máxima urgência, 10 = baixa

  -- Constraints
  CONSTRAINT valid_follow_up CHECK (
    (follow_up_completed_at IS NULL) OR
    (follow_up_scheduled_at IS NOT NULL AND follow_up_completed_at >= follow_up_scheduled_at)
  )
);

-- 3. INDEXES para performance

-- Index principal: buscar crises ativas por usuário
CREATE INDEX IF NOT EXISTS idx_crisis_user_active
  ON crisis_interventions(user_id, detected_at DESC)
  WHERE deleted_at IS NULL AND resolved_at IS NULL;

-- Index para follow-ups pendentes
CREATE INDEX IF NOT EXISTS idx_crisis_follow_up_pending
  ON crisis_interventions(follow_up_scheduled_at)
  WHERE follow_up_needed = TRUE
    AND follow_up_completed_at IS NULL
    AND deleted_at IS NULL;

-- Index para análise por nível de crise
CREATE INDEX IF NOT EXISTS idx_crisis_level_date
  ON crisis_interventions(level, detected_at DESC)
  WHERE deleted_at IS NULL;

-- Index para crises críticas (prioridade máxima)
CREATE INDEX IF NOT EXISTS idx_crisis_critical
  ON crisis_interventions(priority, detected_at DESC)
  WHERE level IN ('severe', 'critical')
    AND deleted_at IS NULL;

-- Index para status
CREATE INDEX IF NOT EXISTS idx_crisis_status
  ON crisis_interventions(status)
  WHERE deleted_at IS NULL;

-- Index GIN para tipos de crise (array)
CREATE INDEX IF NOT EXISTS idx_crisis_types
  ON crisis_interventions USING GIN(types);

-- Index para LGPD cleanup
CREATE INDEX IF NOT EXISTS idx_crisis_lgpd
  ON crisis_interventions(created_at)
  WHERE anonymized_at IS NULL AND deleted_at IS NULL;

-- 4. ROW LEVEL SECURITY (RLS) - CRÍTICO para dados sensíveis
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver APENAS suas próprias intervenções
CREATE POLICY "Users can view own crisis interventions"
  ON crisis_interventions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Sistema pode inserir (via service role ou functions)
CREATE POLICY "System can insert crisis interventions"
  ON crisis_interventions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Usuários podem atualizar status de suas próprias crises
CREATE POLICY "Users can update own crisis status"
  ON crisis_interventions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role tem acesso total (para equipe de crise)
CREATE POLICY "Service role full access"
  ON crisis_interventions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 5. TRIGGERS

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_crisis_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_crisis_updated_at
  BEFORE UPDATE ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_crisis_timestamp();

-- Trigger: Auto-set priority baseado no nível
CREATE OR REPLACE FUNCTION set_crisis_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Priority automático baseado no nível
  NEW.priority := CASE NEW.level
    WHEN 'critical' THEN 1
    WHEN 'severe' THEN 2
    WHEN 'moderate' THEN 5
    WHEN 'low' THEN 8
    ELSE 5
  END;

  -- Ajustar para tipos específicos
  IF 'suicidal_ideation' = ANY(NEW.types) THEN
    NEW.priority := LEAST(NEW.priority, 1);
  ELSIF 'self_harm' = ANY(NEW.types) THEN
    NEW.priority := LEAST(NEW.priority, 2);
  ELSIF 'domestic_violence' = ANY(NEW.types) THEN
    NEW.priority := LEAST(NEW.priority, 2);
  ELSIF 'baby_safety' = ANY(NEW.types) THEN
    NEW.priority := LEAST(NEW.priority, 2);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_crisis_priority
  BEFORE INSERT OR UPDATE OF level, types ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION set_crisis_priority();

-- Trigger: Schedule follow-up automaticamente
CREATE OR REPLACE FUNCTION schedule_crisis_follow_up()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só schedule se follow_up_needed e não tem data
  IF NEW.follow_up_needed = TRUE AND NEW.follow_up_scheduled_at IS NULL THEN
    NEW.follow_up_scheduled_at := CASE NEW.level
      WHEN 'critical' THEN NOW() + INTERVAL '2 hours'
      WHEN 'severe' THEN NOW() + INTERVAL '6 hours'
      WHEN 'moderate' THEN NOW() + INTERVAL '24 hours'
      WHEN 'low' THEN NOW() + INTERVAL '72 hours'
      ELSE NOW() + INTERVAL '24 hours'
    END;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_crisis_follow_up
  BEFORE INSERT ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION schedule_crisis_follow_up();

-- 6. FUNCTIONS

-- Function: Registrar nova intervenção de crise
CREATE OR REPLACE FUNCTION register_crisis_intervention(
  p_user_id UUID,
  p_level crisis_level,
  p_types crisis_type[],
  p_trigger_message TEXT DEFAULT NULL,
  p_matched_patterns TEXT[] DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_intervention_id UUID;
BEGIN
  INSERT INTO crisis_interventions (
    user_id,
    level,
    types,
    trigger_message,
    matched_patterns,
    session_id,
    created_by
  )
  VALUES (
    p_user_id,
    p_level,
    p_types,
    p_trigger_message,
    p_matched_patterns,
    p_session_id,
    auth.uid()
  )
  RETURNING id INTO v_intervention_id;

  RETURN v_intervention_id;
END;
$$;

-- Function: Atualizar status da intervenção
CREATE OR REPLACE FUNCTION update_crisis_status(
  p_intervention_id UUID,
  p_status intervention_status,
  p_resources_shown TEXT[] DEFAULT NULL,
  p_action JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_actions JSONB;
BEGIN
  -- Buscar ações atuais
  SELECT user_actions INTO v_current_actions
  FROM crisis_interventions
  WHERE id = p_intervention_id;

  -- Adicionar nova ação se fornecida
  IF p_action IS NOT NULL THEN
    v_current_actions := COALESCE(v_current_actions, '[]'::jsonb) || p_action;
  END IF;

  UPDATE crisis_interventions
  SET
    status = p_status,
    resources_shown = COALESCE(p_resources_shown, resources_shown),
    user_actions = v_current_actions,
    acknowledged_at = CASE
      WHEN p_status = 'user_acknowledged' AND acknowledged_at IS NULL THEN NOW()
      ELSE acknowledged_at
    END,
    resolved_at = CASE
      WHEN p_status IN ('resolved', 'follow_up_completed') AND resolved_at IS NULL THEN NOW()
      ELSE resolved_at
    END
  WHERE id = p_intervention_id;

  RETURN FOUND;
END;
$$;

-- Function: Buscar crises recentes do usuário
CREATE OR REPLACE FUNCTION get_recent_crises(
  p_user_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  level crisis_level,
  types crisis_type[],
  status intervention_status,
  detected_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.level,
    ci.types,
    ci.status,
    ci.detected_at,
    ci.resolved_at
  FROM crisis_interventions ci
  WHERE ci.user_id = p_user_id
    AND ci.detected_at >= NOW() - (p_hours || ' hours')::interval
    AND ci.deleted_at IS NULL
  ORDER BY ci.detected_at DESC;
END;
$$;

-- Function: Obter follow-ups pendentes (para equipe de crise)
CREATE OR REPLACE FUNCTION get_pending_follow_ups()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  level crisis_level,
  types crisis_type[],
  detected_at TIMESTAMPTZ,
  follow_up_scheduled_at TIMESTAMPTZ,
  priority INTEGER,
  hours_overdue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.user_id,
    ci.level,
    ci.types,
    ci.detected_at,
    ci.follow_up_scheduled_at,
    ci.priority,
    EXTRACT(EPOCH FROM (NOW() - ci.follow_up_scheduled_at)) / 3600 as hours_overdue
  FROM crisis_interventions ci
  WHERE ci.follow_up_needed = TRUE
    AND ci.follow_up_completed_at IS NULL
    AND ci.deleted_at IS NULL
    AND ci.follow_up_scheduled_at <= NOW()
  ORDER BY ci.priority ASC, ci.follow_up_scheduled_at ASC;
END;
$$;

-- Function: LGPD Anonimização
CREATE OR REPLACE FUNCTION anonymize_crisis_interventions(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE crisis_interventions
  SET
    trigger_message = '[ANONYMIZED]',
    matched_patterns = ARRAY['[ANONYMIZED]'],
    context_summary = '[ANONYMIZED]',
    follow_up_notes = '[ANONYMIZED]',
    outcome_notes = '[ANONYMIZED]',
    user_actions = '[]'::jsonb,
    device_info = '{"anonymized": true}'::jsonb,
    anonymized_at = NOW()
  WHERE user_id = p_user_id
    AND anonymized_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function: Dashboard de métricas de crise
CREATE OR REPLACE FUNCTION get_crisis_metrics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_crises BIGINT,
  critical_count BIGINT,
  severe_count BIGINT,
  resolved_count BIGINT,
  avg_resolution_hours NUMERIC,
  cvv_contacts BIGINT,
  follow_up_completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE level = 'critical'),
    COUNT(*) FILTER (WHERE level = 'severe'),
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL),
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at)) / 3600)::numeric, 2),
    COUNT(*) FILTER (WHERE status = 'contacted_cvv'),
    ROUND(
      (COUNT(*) FILTER (WHERE follow_up_completed_at IS NOT NULL)::numeric /
       NULLIF(COUNT(*) FILTER (WHERE follow_up_needed = TRUE), 0) * 100), 2
    )
  FROM crisis_interventions
  WHERE detected_at BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL;
END;
$$;

-- 7. COMMENTS
COMMENT ON TABLE crisis_interventions IS 'SENSÍVEL: Registros de intervenções de crise. LGPD/HIPAA compliant.';
COMMENT ON COLUMN crisis_interventions.trigger_message IS 'SENSÍVEL: Mensagem que disparou a detecção de crise';
COMMENT ON COLUMN crisis_interventions.follow_up_needed IS 'Se requer acompanhamento da equipe';

-- =============================================================================
-- SEED DATA (APENAS para testes - NUNCA em produção)
-- =============================================================================

-- Comentado por segurança - descomentar apenas em ambiente de dev
/*
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM crisis_interventions LIMIT 1) THEN
    -- AVISO: Dados de teste apenas
    INSERT INTO crisis_interventions (
      user_id,
      level,
      types,
      status,
      trigger_message,
      matched_patterns,
      resources_shown
    )
    SELECT
      (SELECT id FROM auth.users LIMIT 1),
      'moderate'::crisis_level,
      ARRAY['overwhelm']::crisis_type[],
      'resources_shown'::intervention_status,
      '[TEST] Mensagem de teste para desenvolvimento',
      ARRAY['cansada', 'exausta'],
      ARRAY['breathing_exercise', 'cvv_188'];

    RAISE NOTICE 'Seed data inserted for crisis_interventions (TEST ONLY)';
  END IF;
END $$;
*/
