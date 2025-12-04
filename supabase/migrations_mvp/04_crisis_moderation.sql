-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 04_crisis_moderation.sql
-- Descrição: Sistema de intervenção em crise e fila de moderação
-- Tabelas: crisis_interventions, moderation_queue
-- Ordem: Executar DEPOIS de 03_lgpd_flags_screenings.sql
-- =============================================================================

-- =============================================================================
-- TABELA: crisis_interventions
-- Descrição: Registro de intervenções em situações de crise detectadas pela IA
-- Prioridade: Crítica - dados sensíveis de saúde mental
-- =============================================================================

CREATE TABLE IF NOT EXISTS crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuária em crise
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Classificação da crise
  level crisis_level NOT NULL,                           -- low, moderate, severe, critical
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],
  status intervention_status NOT NULL DEFAULT 'detected',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1=baixa, 10=emergência

  -- Contexto da detecção
  trigger_message TEXT,                                  -- Mensagem que disparou o alerta
  matched_patterns TEXT[],                               -- Padrões que matcharam
  context_summary TEXT,                                  -- Resumo do contexto gerado por IA

  -- Ações tomadas
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],        -- Recursos de ajuda exibidos
  user_actions JSONB DEFAULT '[]'::jsonb,                -- Ações da usuária após intervenção

  -- Follow-up
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,

  -- Resolução
  outcome_notes TEXT,
  resolution_type TEXT CHECK (resolution_type IN (
    'user_stable', 'contacted_support', 'escalated_emergency',
    'referred_professional', 'ongoing_monitoring', 'false_positive', NULL
  )),

  -- Sessão relacionada
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,

  -- Metadados do dispositivo
  app_version TEXT,
  device_info JSONB,

  -- Timestamps de estado
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id)
);

-- Índices para crisis_interventions
-- Índice principal: usuária + data (para histórico pessoal)
CREATE INDEX IF NOT EXISTS idx_crisis_user_active ON crisis_interventions(user_id, detected_at DESC) WHERE deleted_at IS NULL;

-- Índice para follow-ups pendentes
CREATE INDEX IF NOT EXISTS idx_crisis_follow_up_pending ON crisis_interventions(follow_up_scheduled_at)
  WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL AND deleted_at IS NULL;

-- Índice por nível e data (para dashboard)
CREATE INDEX IF NOT EXISTS idx_crisis_level_date ON crisis_interventions(level, detected_at DESC) WHERE deleted_at IS NULL;

-- Índice para casos críticos (prioridade máxima)
CREATE INDEX IF NOT EXISTS idx_crisis_critical ON crisis_interventions(priority, detected_at DESC)
  WHERE level IN ('severe', 'critical') AND deleted_at IS NULL;

-- Índice por status
CREATE INDEX IF NOT EXISTS idx_crisis_status ON crisis_interventions(status) WHERE deleted_at IS NULL;

-- Índice GIN para busca em tipos
CREATE INDEX IF NOT EXISTS idx_crisis_types ON crisis_interventions USING GIN(types);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_crisis_interventions_updated_at ON crisis_interventions;
CREATE TRIGGER update_crisis_interventions_updated_at
  BEFORE UPDATE ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE crisis_interventions IS 'Registro de intervenções em situações de crise (dados sensíveis)';

-- =============================================================================
-- TABELA: moderation_queue
-- Descrição: Fila de conteúdos para moderação
-- Fluxo: Auto-filter → IA → Humano (se necessário)
-- =============================================================================

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conteúdo a moderar
  content_id UUID NOT NULL,                              -- ID do post/comentário/etc
  content_type content_type NOT NULL,                    -- Tipo de conteúdo
  content_text TEXT NOT NULL,                            -- Texto do conteúdo
  content_metadata JSONB DEFAULT '{}'::jsonb,            -- Metadados adicionais (imagem URL, etc)

  -- Autor do conteúdo
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_trust_score DECIMAL(3,2) DEFAULT 5.0,           -- Score de confiança (0-10)
  author_post_count INTEGER DEFAULT 0,                   -- Total de posts aprovados
  author_report_count INTEGER DEFAULT 0,                 -- Total de denúncias recebidas

  -- Origem e status
  source moderation_source NOT NULL,                     -- Como chegou na fila
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1=baixa, 10=urgente

  -- Análise automática
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],      -- Flags do filtro automático
  ai_safety_score DECIMAL(3,2),                          -- Score de segurança da IA (0-1)
  ai_analysis JSONB,                                     -- Análise detalhada da IA

  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assignment_expires_at TIMESTAMPTZ,                     -- Timeout de 30min

  -- Decisão
  decision moderation_status,
  decision_reason rejection_reason,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),

  -- Escalação
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,

  -- Apelação
  appeal_text TEXT,
  appealed_at TIMESTAMPTZ,
  appeal_decision moderation_status,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES auth.users(id),

  -- Métricas
  time_in_queue_ms INTEGER,                              -- Tempo até decisão
  total_review_time_ms INTEGER,                          -- Tempo de revisão ativa

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para moderation_queue
-- Índice principal: itens pendentes ordenados por prioridade
CREATE INDEX IF NOT EXISTS idx_mod_queue_pending ON moderation_queue(priority ASC, created_at ASC)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Índice para itens atribuídos (timeout de moderador)
CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned ON moderation_queue(assigned_to, assignment_expires_at)
  WHERE status = 'assigned' AND deleted_at IS NULL;

-- Índice por autor (para histórico)
CREATE INDEX IF NOT EXISTS idx_mod_queue_author ON moderation_queue(author_id) WHERE deleted_at IS NULL;

-- Índice por conteúdo original (para lookup)
CREATE INDEX IF NOT EXISTS idx_mod_queue_content ON moderation_queue(content_id, content_type);

-- Índice por status e data (para relatórios)
CREATE INDEX IF NOT EXISTS idx_mod_queue_status_date ON moderation_queue(status, created_at DESC) WHERE deleted_at IS NULL;

-- Índice GIN para flags
CREATE INDEX IF NOT EXISTS idx_mod_queue_flags ON moderation_queue USING GIN(auto_filter_flags);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_moderation_queue_updated_at ON moderation_queue;
CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE moderation_queue IS 'Fila de conteúdos aguardando moderação';

-- =============================================================================
-- FUNÇÕES AUXILIARES PARA MODERAÇÃO
-- =============================================================================

-- Função para obter próximo item da fila de moderação
CREATE OR REPLACE FUNCTION get_next_moderation_item(p_moderator_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id UUID;
BEGIN
  -- Selecionar item pendente com maior prioridade que não seja do próprio moderador
  -- e atribuí-lo ao moderador
  UPDATE moderation_queue
  SET
    status = 'assigned',
    assigned_to = p_moderator_id,
    assigned_at = NOW(),
    assignment_expires_at = NOW() + INTERVAL '30 minutes'
  WHERE id = (
    SELECT id
    FROM moderation_queue
    WHERE status = 'pending'
      AND deleted_at IS NULL
      AND author_id != p_moderator_id -- Não modera próprio conteúdo
    ORDER BY priority ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$$;

-- Função para liberar itens expirados de volta para a fila
CREATE OR REPLACE FUNCTION release_expired_assignments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE moderation_queue
  SET
    status = 'pending',
    assigned_to = NULL,
    assigned_at = NULL,
    assignment_expires_at = NULL,
    priority = GREATEST(1, priority - 1) -- Aumenta prioridade (menor número)
  WHERE status = 'assigned'
    AND assignment_expires_at < NOW()
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para registrar decisão de moderação
CREATE OR REPLACE FUNCTION record_moderation_decision(
  p_item_id UUID,
  p_moderator_id UUID,
  p_decision moderation_status,
  p_reason rejection_reason DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_content_id UUID;
  v_content_type content_type;
  v_time_in_queue INTEGER;
BEGIN
  -- Calcular tempo na fila
  SELECT
    content_id,
    content_type,
    EXTRACT(EPOCH FROM (NOW() - created_at)) * 1000
  INTO v_content_id, v_content_type, v_time_in_queue
  FROM moderation_queue
  WHERE id = p_item_id;

  -- Atualizar item na fila
  UPDATE moderation_queue
  SET
    status = p_decision,
    decision = p_decision,
    decision_reason = p_reason,
    decision_notes = p_notes,
    decided_at = NOW(),
    decided_by = p_moderator_id,
    time_in_queue_ms = v_time_in_queue
  WHERE id = p_item_id
    AND assigned_to = p_moderator_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Atualizar status do conteúdo original
  IF v_content_type = 'post' THEN
    UPDATE community_posts
    SET status = CASE
      WHEN p_decision IN ('approved', 'appeal_approved') THEN 'approved'
      WHEN p_decision IN ('rejected', 'appeal_rejected') THEN 'rejected'
      ELSE 'pending'
    END,
    published_at = CASE
      WHEN p_decision IN ('approved', 'appeal_approved') THEN NOW()
      ELSE published_at
    END
    WHERE id = v_content_id;
  ELSIF v_content_type = 'comment' THEN
    UPDATE community_comments
    SET status = CASE
      WHEN p_decision IN ('approved', 'appeal_approved') THEN 'approved'
      WHEN p_decision IN ('rejected', 'appeal_rejected') THEN 'rejected'
      ELSE 'pending'
    END
    WHERE id = v_content_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- =============================================================================
-- FUNÇÃO: Adicionar conteúdo à fila de moderação
-- =============================================================================

CREATE OR REPLACE FUNCTION add_to_moderation_queue(
  p_content_id UUID,
  p_content_type content_type,
  p_content_text TEXT,
  p_author_id UUID,
  p_source moderation_source,
  p_priority INTEGER DEFAULT 5,
  p_auto_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_ai_score DECIMAL DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_id UUID;
  v_author_trust DECIMAL;
  v_author_posts INTEGER;
  v_author_reports INTEGER;
BEGIN
  -- Obter métricas do autor
  SELECT
    COALESCE(
      (SELECT COUNT(*) FROM community_posts WHERE author_id = p_author_id AND status = 'approved'),
      0
    ),
    COALESCE(
      (SELECT COUNT(*) FROM moderation_queue WHERE author_id = p_author_id AND decision = 'rejected'),
      0
    )
  INTO v_author_posts, v_author_reports;

  -- Calcular trust score (simplificado)
  v_author_trust := GREATEST(0, LEAST(10,
    5.0 + (v_author_posts * 0.1) - (v_author_reports * 0.5)
  ));

  -- Inserir na fila
  INSERT INTO moderation_queue (
    content_id, content_type, content_text, content_metadata,
    author_id, author_trust_score, author_post_count, author_report_count,
    source, priority, auto_filter_flags, ai_safety_score
  ) VALUES (
    p_content_id, p_content_type, p_content_text, p_metadata,
    p_author_id, v_author_trust, v_author_posts, v_author_reports,
    p_source, p_priority, p_auto_flags, p_ai_score
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('crisis_interventions', 'moderation_queue');

  RAISE NOTICE '04_crisis_moderation.sql: % tabelas criadas/verificadas', table_count;
END $$;
