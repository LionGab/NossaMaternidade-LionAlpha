-- =============================================================================
-- COMBINED MIGRATION: Crisis Dashboard Complete
-- Execute este arquivo no SQL Editor do Supabase
-- Combina: crisis_interventions + moderation_queue + dashboard_functions
-- =============================================================================

-- =============================================================================
-- PARTE 1: CRISIS INTERVENTIONS TABLE
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level crisis_level NOT NULL,
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],
  status intervention_status NOT NULL DEFAULT 'detected',
  trigger_message TEXT,
  matched_patterns TEXT[],
  context_summary TEXT,
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_actions JSONB DEFAULT '[]'::jsonb,
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,
  outcome_notes TEXT,
  resolution_type TEXT,
  session_id UUID,
  app_version TEXT,
  device_info JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  CONSTRAINT valid_follow_up CHECK (
    (follow_up_completed_at IS NULL) OR
    (follow_up_scheduled_at IS NOT NULL AND follow_up_completed_at >= follow_up_scheduled_at)
  )
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_crisis_user_active
  ON crisis_interventions(user_id, detected_at DESC)
  WHERE deleted_at IS NULL AND resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crisis_follow_up_pending
  ON crisis_interventions(follow_up_scheduled_at)
  WHERE follow_up_needed = TRUE
    AND follow_up_completed_at IS NULL
    AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crisis_level_date
  ON crisis_interventions(level, detected_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crisis_critical
  ON crisis_interventions(priority, detected_at DESC)
  WHERE level IN ('severe', 'critical')
    AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crisis_status
  ON crisis_interventions(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crisis_types
  ON crisis_interventions USING GIN(types);

CREATE INDEX IF NOT EXISTS idx_crisis_lgpd
  ON crisis_interventions(created_at)
  WHERE anonymized_at IS NULL AND deleted_at IS NULL;

-- 4. RLS
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own crisis interventions"
    ON crisis_interventions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert crisis interventions"
    ON crisis_interventions FOR INSERT
    WITH CHECK (
      auth.uid() = user_id OR
      auth.jwt()->>'role' = 'service_role'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own crisis status"
    ON crisis_interventions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access"
    ON crisis_interventions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. TRIGGERS
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

DROP TRIGGER IF EXISTS trg_crisis_updated_at ON crisis_interventions;
CREATE TRIGGER trg_crisis_updated_at
  BEFORE UPDATE ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_crisis_timestamp();

CREATE OR REPLACE FUNCTION set_crisis_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.priority := CASE NEW.level
    WHEN 'critical' THEN 1
    WHEN 'severe' THEN 2
    WHEN 'moderate' THEN 5
    WHEN 'low' THEN 8
    ELSE 5
  END;

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

DROP TRIGGER IF EXISTS trg_crisis_priority ON crisis_interventions;
CREATE TRIGGER trg_crisis_priority
  BEFORE INSERT OR UPDATE OF level, types ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION set_crisis_priority();

CREATE OR REPLACE FUNCTION schedule_crisis_follow_up()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trg_crisis_follow_up ON crisis_interventions;
CREATE TRIGGER trg_crisis_follow_up
  BEFORE INSERT ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION schedule_crisis_follow_up();

-- 6. FUNCTIONS para crisis_interventions
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
    user_id, level, types, trigger_message, matched_patterns, session_id, created_by
  )
  VALUES (
    p_user_id, p_level, p_types, p_trigger_message, p_matched_patterns, p_session_id, auth.uid()
  )
  RETURNING id INTO v_intervention_id;
  RETURN v_intervention_id;
END;
$$;

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
  SELECT user_actions INTO v_current_actions
  FROM crisis_interventions
  WHERE id = p_intervention_id;

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
    ci.id, ci.level, ci.types, ci.status, ci.detected_at, ci.resolved_at
  FROM crisis_interventions ci
  WHERE ci.user_id = p_user_id
    AND ci.detected_at >= NOW() - (p_hours || ' hours')::interval
    AND ci.deleted_at IS NULL
  ORDER BY ci.detected_at DESC;
END;
$$;

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
    ci.id, ci.user_id, ci.level, ci.types, ci.detected_at,
    ci.follow_up_scheduled_at, ci.priority,
    EXTRACT(EPOCH FROM (NOW() - ci.follow_up_scheduled_at)) / 3600 as hours_overdue
  FROM crisis_interventions ci
  WHERE ci.follow_up_needed = TRUE
    AND ci.follow_up_completed_at IS NULL
    AND ci.deleted_at IS NULL
    AND ci.follow_up_scheduled_at <= NOW()
  ORDER BY ci.priority ASC, ci.follow_up_scheduled_at ASC;
END;
$$;

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

COMMENT ON TABLE crisis_interventions IS 'SENSÍVEL: Registros de intervenções de crise. LGPD/HIPAA compliant.';

-- =============================================================================
-- PARTE 2: MODERATION QUEUE TABLE
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM (
    'pending', 'assigned', 'in_review', 'approved', 'rejected',
    'escalated', 'appealed', 'appeal_approved', 'appeal_rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'post', 'comment', 'reply', 'profile_bio', 'profile_photo', 'message'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_source AS ENUM (
    'auto_filter', 'ai_review', 'user_report', 'manual', 'appeal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'spam', 'hate_speech', 'harassment', 'nsfw', 'violence', 'self_harm',
    'medical_misinformation', 'personal_info', 'advertising', 'off_topic', 'duplicate', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  content_text TEXT NOT NULL,
  content_metadata JSONB DEFAULT '{}'::jsonb,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_trust_score DECIMAL(3,2) DEFAULT 5.0,
  author_post_count INTEGER DEFAULT 0,
  author_report_count INTEGER DEFAULT 0,
  source moderation_source NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_safety_score DECIMAL(3,2),
  ai_analysis JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assignment_expires_at TIMESTAMPTZ,
  decision moderation_status,
  decision_reason rejection_reason,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  appeal_text TEXT,
  appealed_at TIMESTAMPTZ,
  appeal_decision moderation_status,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  time_in_queue_ms INTEGER,
  total_review_time_ms INTEGER,
  CONSTRAINT valid_decision CHECK (
    (decision IS NULL AND decided_at IS NULL) OR
    (decision IS NOT NULL AND decided_at IS NOT NULL)
  ),
  CONSTRAINT valid_escalation CHECK (
    (escalated_to IS NULL AND escalated_at IS NULL) OR
    (escalated_to IS NOT NULL AND escalated_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'base' CHECK (tier IN ('base', 'senior', 'lead', 'founder')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  compensation_brl DECIMAL(10,2) DEFAULT 300.00,
  payment_info JSONB,
  hours_per_week INTEGER DEFAULT 4,
  available_hours JSONB,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  stats JSONB DEFAULT '{"total_reviewed": 0, "approved": 0, "rejected": 0, "escalated": 0, "avg_review_time_seconds": 0, "accuracy_rate": 0, "appeals_overturned": 0}'::jsonb,
  training_completed_at TIMESTAMPTZ,
  last_training_at TIMESTAMPTZ,
  certifications TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_posts INTEGER DEFAULT 0,
  total_queued INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  auto_blocked INTEGER DEFAULT 0,
  ai_approved INTEGER DEFAULT 0,
  ai_blocked INTEGER DEFAULT 0,
  ai_queued INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,
  human_rejected INTEGER DEFAULT 0,
  escalated INTEGER DEFAULT 0,
  avg_queue_latency_ms INTEGER,
  p50_queue_latency_ms INTEGER,
  p95_queue_latency_ms INTEGER,
  p99_queue_latency_ms INTEGER,
  false_positive_count INTEGER DEFAULT 0,
  false_negative_count INTEGER DEFAULT 0,
  appeal_count INTEGER DEFAULT 0,
  appeal_success_count INTEGER DEFAULT 0,
  active_moderators INTEGER DEFAULT 0,
  moderator_hours_worked DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mod_queue_pending
  ON moderation_queue(priority ASC, created_at ASC)
  WHERE status = 'pending' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned
  ON moderation_queue(assigned_to, assignment_expires_at)
  WHERE status = 'assigned' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_author
  ON moderation_queue(author_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_content
  ON moderation_queue(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_mod_queue_status_date
  ON moderation_queue(status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_escalated
  ON moderation_queue(escalated_at DESC)
  WHERE status = 'escalated' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_ai_score
  ON moderation_queue(ai_safety_score)
  WHERE ai_safety_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_flags
  ON moderation_queue USING GIN(auto_filter_flags);

CREATE INDEX IF NOT EXISTS idx_moderators_active
  ON moderators(tier, last_active_at DESC)
  WHERE active = TRUE AND deleted_at IS NULL;

-- RLS moderation_queue
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Moderators can view queue"
    ON moderation_queue FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM moderators
        WHERE user_id = auth.uid() AND active = TRUE
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Moderators can update assigned items"
    ON moderation_queue FOR UPDATE
    USING (
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM moderators
        WHERE user_id = auth.uid() AND tier IN ('lead', 'founder')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert to queue"
    ON moderation_queue FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authors can view own items"
    ON moderation_queue FOR SELECT
    USING (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access queue"
    ON moderation_queue FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS moderators
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Moderators can view self"
    ON moderators FOR SELECT
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Leads can view all moderators"
    ON moderators FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM moderators
        WHERE user_id = auth.uid() AND tier IN ('lead', 'founder')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access moderators"
    ON moderators FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS moderation_metrics
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Moderators can view metrics"
    ON moderation_metrics FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM moderators
        WHERE user_id = auth.uid() AND active = TRUE
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access metrics"
    ON moderation_metrics FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Triggers
CREATE OR REPLACE FUNCTION update_moderation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mod_queue_updated ON moderation_queue;
CREATE TRIGGER trg_mod_queue_updated
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

DROP TRIGGER IF EXISTS trg_moderators_updated ON moderators;
CREATE TRIGGER trg_moderators_updated
  BEFORE UPDATE ON moderators
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

DROP TRIGGER IF EXISTS trg_mod_metrics_updated ON moderation_metrics;
CREATE TRIGGER trg_mod_metrics_updated
  BEFORE UPDATE ON moderation_metrics
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

CREATE OR REPLACE FUNCTION calculate_queue_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.time_in_queue_ms IS NULL THEN
    NEW.time_in_queue_ms := EXTRACT(EPOCH FROM (NOW() - OLD.created_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mod_queue_time ON moderation_queue;
CREATE TRIGGER trg_mod_queue_time
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION calculate_queue_time();

CREATE OR REPLACE FUNCTION set_moderation_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.auto_filter_flags && ARRAY['violence', 'self_harm', 'hate_speech'] THEN
    NEW.priority := 1;
  ELSIF NEW.auto_filter_flags && ARRAY['nsfw', 'harassment', 'medical_misinformation'] THEN
    NEW.priority := 3;
  ELSIF NEW.author_trust_score < 3.0 THEN
    NEW.priority := 4;
  ELSIF NEW.ai_safety_score IS NOT NULL AND NEW.ai_safety_score BETWEEN 0.4 AND 0.75 THEN
    NEW.priority := 5;
  ELSE
    NEW.priority := 7;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mod_priority ON moderation_queue;
CREATE TRIGGER trg_mod_priority
  BEFORE INSERT ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION set_moderation_priority();

-- Functions
CREATE OR REPLACE FUNCTION queue_for_moderation(
  p_content_id UUID,
  p_content_type content_type,
  p_content_text TEXT,
  p_author_id UUID,
  p_source moderation_source,
  p_auto_flags TEXT[] DEFAULT NULL,
  p_ai_score DECIMAL DEFAULT NULL,
  p_ai_analysis JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO moderation_queue (
    content_id, content_type, content_text, author_id,
    author_trust_score, author_post_count, author_report_count,
    source, auto_filter_flags, ai_safety_score, ai_analysis
  )
  VALUES (
    p_content_id, p_content_type, p_content_text, p_author_id,
    5.0, 0, 0,
    p_source, COALESCE(p_auto_flags, ARRAY[]::TEXT[]), p_ai_score, p_ai_analysis
  )
  RETURNING id INTO v_queue_id;
  RETURN v_queue_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_moderation_item(
  p_item_id UUID DEFAULT NULL,
  p_moderator_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id UUID;
  v_moderator_id UUID;
BEGIN
  v_moderator_id := COALESCE(p_moderator_id, auth.uid());

  IF NOT EXISTS (
    SELECT 1 FROM moderators
    WHERE user_id = v_moderator_id AND active = TRUE
  ) THEN
    RAISE EXCEPTION 'User is not an active moderator';
  END IF;

  IF p_item_id IS NULL THEN
    SELECT id INTO v_item_id
    FROM moderation_queue
    WHERE status = 'pending'
      AND deleted_at IS NULL
    ORDER BY priority ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  ELSE
    v_item_id := p_item_id;
  END IF;

  IF v_item_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE moderation_queue
  SET
    status = 'assigned',
    assigned_to = v_moderator_id,
    assigned_at = NOW(),
    assignment_expires_at = NOW() + INTERVAL '15 minutes'
  WHERE id = v_item_id
    AND status = 'pending';

  RETURN v_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_moderation_dashboard()
RETURNS TABLE (
  pending_count BIGINT,
  assigned_count BIGINT,
  escalated_count BIGINT,
  avg_wait_minutes NUMERIC,
  oldest_item_minutes NUMERIC,
  by_priority JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'assigned'),
    COUNT(*) FILTER (WHERE status = 'escalated'),
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60)
      FILTER (WHERE status = 'pending')::numeric, 2),
    ROUND(MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60)
      FILTER (WHERE status = 'pending')::numeric, 2),
    jsonb_object_agg(
      priority::text,
      cnt
    )
  FROM (
    SELECT
      priority,
      status,
      created_at,
      COUNT(*) OVER (PARTITION BY priority) as cnt
    FROM moderation_queue
    WHERE status = 'pending' AND deleted_at IS NULL
  ) sub;
END;
$$;

-- Seed initial metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM moderation_metrics WHERE date = CURRENT_DATE) THEN
    INSERT INTO moderation_metrics (date) VALUES (CURRENT_DATE);
  END IF;
END $$;

COMMENT ON TABLE moderation_queue IS 'Fila de conteúdo para revisão por Super Mamas moderadoras';
COMMENT ON TABLE moderators IS 'Super Mamas moderadoras pagas';
COMMENT ON TABLE moderation_metrics IS 'Métricas diárias agregadas de moderação';

-- =============================================================================
-- PARTE 3: DASHBOARD FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_crisis_daily_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  critical_count BIGINT,
  severe_count BIGINT,
  moderate_count BIGINT,
  low_count BIGINT,
  cvv_contacts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(ci.detected_at) as date,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE ci.level = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE ci.level = 'severe') as severe_count,
    COUNT(*) FILTER (WHERE ci.level = 'moderate') as moderate_count,
    COUNT(*) FILTER (WHERE ci.level = 'low') as low_count,
    COUNT(*) FILTER (WHERE ci.status = 'contacted_cvv') as cvv_contacts
  FROM crisis_interventions ci
  WHERE ci.detected_at >= NOW() - (p_days || ' days')::INTERVAL
    AND ci.deleted_at IS NULL
    AND ci.anonymized_at IS NULL
  GROUP BY DATE(ci.detected_at)
  ORDER BY date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_crisis_type_distribution(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  crisis_type TEXT,
  count BIGINT,
  percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM crisis_interventions
  WHERE detected_at BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  RETURN QUERY
  SELECT
    unnest(ci.types)::TEXT as crisis_type,
    COUNT(*) as count,
    CASE
      WHEN v_total > 0
      THEN ROUND((COUNT(*)::decimal / v_total) * 100, 2)
      ELSE 0
    END as percentage
  FROM crisis_interventions ci
  WHERE ci.detected_at BETWEEN p_start_date AND p_end_date
    AND ci.deleted_at IS NULL
    AND ci.anonymized_at IS NULL
  GROUP BY unnest(ci.types)
  ORDER BY count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_cvv_click_stats()
RETURNS TABLE (
  today_count BIGINT,
  yesterday_count BIGINT,
  variation_percent DECIMAL(5,2),
  alert_threshold_exceeded BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today BIGINT;
  v_yesterday BIGINT;
  v_variation DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO v_today
  FROM crisis_interventions
  WHERE status = 'contacted_cvv'
    AND DATE(detected_at) = CURRENT_DATE
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  SELECT COUNT(*) INTO v_yesterday
  FROM crisis_interventions
  WHERE status = 'contacted_cvv'
    AND DATE(detected_at) = CURRENT_DATE - 1
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  IF v_yesterday > 0 THEN
    v_variation := ROUND(((v_today - v_yesterday)::decimal / v_yesterday) * 100, 2);
  ELSE
    v_variation := CASE WHEN v_today > 0 THEN 100.00 ELSE 0.00 END;
  END IF;

  RETURN QUERY
  SELECT
    v_today,
    v_yesterday,
    v_variation,
    (v_variation > 20);
END;
$$;

CREATE OR REPLACE FUNCTION get_moderation_queue_stats()
RETURNS TABLE (
  pending_count BIGINT,
  high_priority_count BIGINT,
  avg_queue_latency_ms DECIMAL(10,2),
  oldest_pending_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE mq.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE mq.status = 'pending' AND mq.priority <= 3) as high_priority_count,
    COALESCE(AVG(mq.time_in_queue_ms) FILTER (WHERE mq.status != 'pending' AND mq.time_in_queue_ms IS NOT NULL), 0) as avg_queue_latency_ms,
    COALESCE(
      EXTRACT(EPOCH FROM (NOW() - MIN(mq.created_at) FILTER (WHERE mq.status = 'pending'))) / 60,
      0
    )::INTEGER as oldest_pending_minutes
  FROM moderation_queue mq
  WHERE mq.deleted_at IS NULL;
END;
$$;

-- Materialized View para cache
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_crisis_summary;
CREATE MATERIALIZED VIEW mv_dashboard_crisis_summary AS
SELECT
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE) as crises_today,
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE AND level IN ('critical', 'severe')) as critical_today,
  COUNT(*) FILTER (WHERE detected_at >= NOW() - INTERVAL '7 days') as crises_7d,
  COUNT(*) FILTER (WHERE status = 'contacted_cvv' AND DATE(detected_at) = CURRENT_DATE) as cvv_contacts_today,
  COUNT(*) FILTER (WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL) as pending_followups,
  NOW() as refreshed_at
FROM crisis_interventions
WHERE deleted_at IS NULL
  AND anonymized_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_crisis_summary
  ON mv_dashboard_crisis_summary(refreshed_at);

CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_crisis_summary;
END;
$$;

-- Comments
COMMENT ON FUNCTION get_crisis_daily_stats IS 'Retorna estatísticas diárias de crises para gráficos de linha.';
COMMENT ON FUNCTION get_crisis_type_distribution IS 'Retorna distribuição de tipos de crise para pie chart.';
COMMENT ON FUNCTION get_cvv_click_stats IS 'Retorna cliques no CVV com variação percentual.';
COMMENT ON FUNCTION get_moderation_queue_stats IS 'Retorna estatísticas da fila de moderação.';
COMMENT ON MATERIALIZED VIEW mv_dashboard_crisis_summary IS 'Cache do dashboard de crises.';
COMMENT ON FUNCTION refresh_dashboard_cache IS 'Refresh automático da view materializada.';

-- =============================================================================
-- FIM DA MIGRATION COMBINADA
-- =============================================================================

SELECT 'Migration completed successfully!' as status;
