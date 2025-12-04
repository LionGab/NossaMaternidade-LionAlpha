-- =============================================================================
-- MODERATION QUEUE TABLE
-- Fila de posts/comentários para revisão manual por Super Mamas
-- Integra com sistema de 4 camadas descrito em MODERATION_ARCHITECTURE.md
-- =============================================================================

-- 1. CREATE TYPES para moderação
DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM (
    'pending',      -- Aguardando revisão
    'assigned',     -- Atribuído a moderadora
    'in_review',    -- Em análise
    'approved',     -- Aprovado
    'rejected',     -- Rejeitado
    'escalated',    -- Escalado para Lead/Founder
    'appealed',     -- Usuária contestou
    'appeal_approved', -- Appeal aceito
    'appeal_rejected'  -- Appeal negado
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'post',         -- Post na comunidade
    'comment',      -- Comentário
    'reply',        -- Resposta a comentário
    'profile_bio',  -- Bio do perfil
    'profile_photo', -- Foto de perfil
    'message'       -- Mensagem direta
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_source AS ENUM (
    'auto_filter',  -- Camada 1: Filtro automático
    'ai_review',    -- Camada 2: IA pre-moderação
    'user_report',  -- Report de usuária
    'manual',       -- Adicionado manualmente
    'appeal'        -- Apelação de rejeição
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'spam',
    'hate_speech',
    'harassment',
    'nsfw',
    'violence',
    'self_harm',
    'medical_misinformation',
    'personal_info',
    'advertising',
    'off_topic',
    'duplicate',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLE: moderation_queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content Reference
  content_id UUID NOT NULL, -- ID do post/comentário original
  content_type content_type NOT NULL,
  content_text TEXT NOT NULL, -- Snapshot do texto (para audit)
  content_metadata JSONB DEFAULT '{}'::jsonb,
  -- Ex: { "has_image": true, "link_count": 2, "mention_count": 1 }

  -- Author info
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_trust_score DECIMAL(3,2) DEFAULT 5.0, -- 0-10
  author_post_count INTEGER DEFAULT 0,
  author_report_count INTEGER DEFAULT 0,

  -- Moderation metadata
  source moderation_source NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  -- 1 = urgente (conteúdo potencialmente perigoso)
  -- 5 = normal
  -- 10 = baixa prioridade

  -- Auto-filter results (Camada 1)
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Ex: ['spam', 'external_link', 'medical_keyword']

  -- AI analysis (Camada 2)
  ai_safety_score DECIMAL(3,2), -- 0.00-1.00 (1 = mais seguro)
  ai_analysis JSONB,
  -- Ex: { "categories": ["medical"], "sentiment": "negative", "confidence": 0.85 }

  -- Assignment (Camada 3)
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assignment_expires_at TIMESTAMPTZ, -- Auto-reassign se expirar

  -- Decision
  decision moderation_status,
  decision_reason rejection_reason,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),

  -- Escalation (Camada 4)
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,

  -- Appeal
  appeal_text TEXT,
  appealed_at TIMESTAMPTZ,
  appeal_decision moderation_status,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Metrics
  time_in_queue_ms INTEGER, -- Tempo até primeira ação
  total_review_time_ms INTEGER, -- Tempo total de revisão

  -- Constraints
  CONSTRAINT valid_decision CHECK (
    (decision IS NULL AND decided_at IS NULL) OR
    (decision IS NOT NULL AND decided_at IS NOT NULL)
  ),
  CONSTRAINT valid_escalation CHECK (
    (escalated_to IS NULL AND escalated_at IS NULL) OR
    (escalated_to IS NOT NULL AND escalated_at IS NOT NULL)
  )
);

-- 3. CREATE TABLE: moderators (Super Mamas)
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Tier
  tier TEXT NOT NULL DEFAULT 'base' CHECK (tier IN ('base', 'senior', 'lead', 'founder')),

  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Compensation (Brasil - BRL)
  compensation_brl DECIMAL(10,2) DEFAULT 300.00,
  payment_info JSONB, -- { "pix_key": "...", "bank": "..." }

  -- Availability
  hours_per_week INTEGER DEFAULT 4,
  available_hours JSONB, -- { "mon": ["09:00-12:00"], "tue": [...] }
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Stats
  stats JSONB DEFAULT '{
    "total_reviewed": 0,
    "approved": 0,
    "rejected": 0,
    "escalated": 0,
    "avg_review_time_seconds": 0,
    "accuracy_rate": 0,
    "appeals_overturned": 0
  }'::jsonb,

  -- Training
  training_completed_at TIMESTAMPTZ,
  last_training_at TIMESTAMPTZ,
  certifications TEXT[],

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- 4. CREATE TABLE: moderation_metrics (daily aggregates)
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,

  -- Volume
  total_posts INTEGER DEFAULT 0,
  total_queued INTEGER DEFAULT 0,

  -- By layer
  auto_approved INTEGER DEFAULT 0,      -- Camada 1
  auto_blocked INTEGER DEFAULT 0,
  ai_approved INTEGER DEFAULT 0,        -- Camada 2
  ai_blocked INTEGER DEFAULT 0,
  ai_queued INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,     -- Camada 3
  human_rejected INTEGER DEFAULT 0,
  escalated INTEGER DEFAULT 0,          -- Camada 4

  -- Performance
  avg_queue_latency_ms INTEGER,
  p50_queue_latency_ms INTEGER,
  p95_queue_latency_ms INTEGER,
  p99_queue_latency_ms INTEGER,

  -- Quality
  false_positive_count INTEGER DEFAULT 0,
  false_negative_count INTEGER DEFAULT 0,
  appeal_count INTEGER DEFAULT 0,
  appeal_success_count INTEGER DEFAULT 0,

  -- Moderator health
  active_moderators INTEGER DEFAULT 0,
  moderator_hours_worked DECIMAL(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES para performance

-- moderation_queue indexes
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

-- GIN index para flags
CREATE INDEX IF NOT EXISTS idx_mod_queue_flags
  ON moderation_queue USING GIN(auto_filter_flags);

-- moderators indexes
CREATE INDEX IF NOT EXISTS idx_moderators_active
  ON moderators(tier, last_active_at DESC)
  WHERE active = TRUE AND deleted_at IS NULL;

-- 6. ROW LEVEL SECURITY

-- moderation_queue RLS
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Moderadoras podem ver itens na fila
CREATE POLICY "Moderators can view queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND active = TRUE
    )
  );

-- Moderadoras podem atualizar itens atribuídos a elas
CREATE POLICY "Moderators can update assigned items"
  ON moderation_queue FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND tier IN ('lead', 'founder')
    )
  );

-- Sistema pode inserir
CREATE POLICY "System can insert to queue"
  ON moderation_queue FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Autores podem ver seus próprios itens
CREATE POLICY "Authors can view own items"
  ON moderation_queue FOR SELECT
  USING (author_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access queue"
  ON moderation_queue FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- moderators RLS
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view self"
  ON moderators FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Leads can view all moderators"
  ON moderators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND tier IN ('lead', 'founder')
    )
  );

CREATE POLICY "Service role full access moderators"
  ON moderators FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- moderation_metrics RLS
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view metrics"
  ON moderation_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND active = TRUE
    )
  );

CREATE POLICY "Service role full access metrics"
  ON moderation_metrics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 7. TRIGGERS

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_moderation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mod_queue_updated
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

CREATE TRIGGER trg_moderators_updated
  BEFORE UPDATE ON moderators
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

CREATE TRIGGER trg_mod_metrics_updated
  BEFORE UPDATE ON moderation_metrics
  FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

-- Auto-calculate time_in_queue when first action
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

CREATE TRIGGER trg_mod_queue_time
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION calculate_queue_time();

-- Auto-set priority based on flags
CREATE OR REPLACE FUNCTION set_moderation_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Critical flags = priority 1
  IF NEW.auto_filter_flags && ARRAY['violence', 'self_harm', 'hate_speech'] THEN
    NEW.priority := 1;
  -- High priority flags = priority 3
  ELSIF NEW.auto_filter_flags && ARRAY['nsfw', 'harassment', 'medical_misinformation'] THEN
    NEW.priority := 3;
  -- Low trust author = priority 4
  ELSIF NEW.author_trust_score < 3.0 THEN
    NEW.priority := 4;
  -- AI uncertain = priority 5
  ELSIF NEW.ai_safety_score IS NOT NULL AND NEW.ai_safety_score BETWEEN 0.4 AND 0.75 THEN
    NEW.priority := 5;
  -- Normal = priority 7
  ELSE
    NEW.priority := 7;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mod_priority
  BEFORE INSERT ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION set_moderation_priority();

-- 8. FUNCTIONS

-- Function: Adicionar item à fila
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
  v_trust_score DECIMAL;
  v_post_count INTEGER;
  v_report_count INTEGER;
BEGIN
  -- Buscar info do autor (se existir tabela de trust)
  -- Por enquanto, usar defaults
  v_trust_score := 5.0;
  v_post_count := 0;
  v_report_count := 0;

  INSERT INTO moderation_queue (
    content_id,
    content_type,
    content_text,
    author_id,
    author_trust_score,
    author_post_count,
    author_report_count,
    source,
    auto_filter_flags,
    ai_safety_score,
    ai_analysis
  )
  VALUES (
    p_content_id,
    p_content_type,
    p_content_text,
    p_author_id,
    v_trust_score,
    v_post_count,
    v_report_count,
    p_source,
    COALESCE(p_auto_flags, ARRAY[]::TEXT[]),
    p_ai_score,
    p_ai_analysis
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- Function: Atribuir item a moderadora
CREATE OR REPLACE FUNCTION assign_moderation_item(
  p_item_id UUID DEFAULT NULL, -- NULL = próximo da fila
  p_moderator_id UUID DEFAULT NULL -- NULL = auth.uid()
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

  -- Verificar se é moderadora ativa
  IF NOT EXISTS (
    SELECT 1 FROM moderators
    WHERE user_id = v_moderator_id AND active = TRUE
  ) THEN
    RAISE EXCEPTION 'User is not an active moderator';
  END IF;

  -- Se não especificou item, pegar próximo da fila
  IF p_item_id IS NULL THEN
    SELECT id INTO v_item_id
    FROM moderation_queue
    WHERE status = 'pending'
      AND deleted_at IS NULL
    ORDER BY priority ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED; -- Evitar race conditions
  ELSE
    v_item_id := p_item_id;
  END IF;

  IF v_item_id IS NULL THEN
    RETURN NULL; -- Fila vazia
  END IF;

  -- Atribuir
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

-- Function: Tomar decisão
CREATE OR REPLACE FUNCTION decide_moderation(
  p_item_id UUID,
  p_decision moderation_status,
  p_reason rejection_reason DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Buscar item
  SELECT * INTO v_item
  FROM moderation_queue
  WHERE id = p_item_id;

  -- Verificar se moderadora tem permissão
  IF v_item.assigned_to != auth.uid() THEN
    -- Verificar se é lead/founder
    IF NOT EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND tier IN ('lead', 'founder')
    ) THEN
      RAISE EXCEPTION 'Not authorized to decide on this item';
    END IF;
  END IF;

  -- Atualizar decisão
  UPDATE moderation_queue
  SET
    status = p_decision,
    decision = p_decision,
    decision_reason = p_reason,
    decision_notes = p_notes,
    decided_at = NOW(),
    decided_by = auth.uid(),
    total_review_time_ms = COALESCE(time_in_queue_ms, 0) +
      (EXTRACT(EPOCH FROM (NOW() - assigned_at)) * 1000)::integer
  WHERE id = p_item_id;

  -- Atualizar stats da moderadora
  UPDATE moderators
  SET
    stats = jsonb_set(
      jsonb_set(
        stats,
        '{total_reviewed}',
        to_jsonb((stats->>'total_reviewed')::integer + 1)
      ),
      CASE p_decision
        WHEN 'approved' THEN '{approved}'
        WHEN 'rejected' THEN '{rejected}'
        WHEN 'escalated' THEN '{escalated}'
        ELSE '{total_reviewed}'
      END,
      to_jsonb(COALESCE((stats->>
        CASE p_decision
          WHEN 'approved' THEN 'approved'
          WHEN 'rejected' THEN 'rejected'
          WHEN 'escalated' THEN 'escalated'
          ELSE 'total_reviewed'
        END)::integer, 0) + 1)
    ),
    last_active_at = NOW()
  WHERE user_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Function: Escalar para lead/founder
CREATE OR REPLACE FUNCTION escalate_moderation(
  p_item_id UUID,
  p_reason TEXT,
  p_escalate_to UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id UUID;
BEGIN
  -- Encontrar lead disponível se não especificado
  IF p_escalate_to IS NULL THEN
    SELECT user_id INTO v_lead_id
    FROM moderators
    WHERE tier IN ('lead', 'founder')
      AND active = TRUE
    ORDER BY last_active_at DESC
    LIMIT 1;
  ELSE
    v_lead_id := p_escalate_to;
  END IF;

  UPDATE moderation_queue
  SET
    status = 'escalated',
    escalated_to = v_lead_id,
    escalated_at = NOW(),
    escalation_reason = p_reason
  WHERE id = p_item_id;

  RETURN TRUE;
END;
$$;

-- Function: Obter dashboard de fila
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

-- Function: Atualizar métricas diárias
CREATE OR REPLACE FUNCTION update_daily_moderation_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO moderation_metrics (date)
  VALUES (v_today)
  ON CONFLICT (date) DO NOTHING;

  UPDATE moderation_metrics
  SET
    total_queued = (
      SELECT COUNT(*) FROM moderation_queue
      WHERE DATE(created_at) = v_today
    ),
    human_approved = (
      SELECT COUNT(*) FROM moderation_queue
      WHERE DATE(decided_at) = v_today AND decision = 'approved'
    ),
    human_rejected = (
      SELECT COUNT(*) FROM moderation_queue
      WHERE DATE(decided_at) = v_today AND decision = 'rejected'
    ),
    escalated = (
      SELECT COUNT(*) FROM moderation_queue
      WHERE DATE(escalated_at) = v_today
    ),
    avg_queue_latency_ms = (
      SELECT AVG(time_in_queue_ms) FROM moderation_queue
      WHERE DATE(decided_at) = v_today AND time_in_queue_ms IS NOT NULL
    ),
    p95_queue_latency_ms = (
      SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY time_in_queue_ms)
      FROM moderation_queue
      WHERE DATE(decided_at) = v_today AND time_in_queue_ms IS NOT NULL
    ),
    active_moderators = (
      SELECT COUNT(*) FROM moderators
      WHERE active = TRUE AND DATE(last_active_at) = v_today
    ),
    updated_at = NOW()
  WHERE date = v_today;
END;
$$;

-- 9. COMMENTS
COMMENT ON TABLE moderation_queue IS 'Fila de conteúdo para revisão por Super Mamas moderadoras';
COMMENT ON TABLE moderators IS 'Super Mamas moderadoras pagas';
COMMENT ON TABLE moderation_metrics IS 'Métricas diárias agregadas de moderação';

-- =============================================================================
-- SEED DATA
-- =============================================================================

DO $$
BEGIN
  -- Criar primeiro registro de métricas se não existir
  IF NOT EXISTS (SELECT 1 FROM moderation_metrics WHERE date = CURRENT_DATE) THEN
    INSERT INTO moderation_metrics (date) VALUES (CURRENT_DATE);
    RAISE NOTICE 'Initial metrics record created';
  END IF;
END $$;
