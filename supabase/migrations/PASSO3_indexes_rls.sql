-- =============================================================================
-- PASSO 3/3: INDEXES + RLS (execute DEPOIS do PASSO2)
-- =============================================================================

-- INDEXES para crisis_interventions
CREATE INDEX IF NOT EXISTS idx_crisis_user_active ON crisis_interventions(user_id, detected_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_follow_up_pending ON crisis_interventions(follow_up_scheduled_at) WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_level_date ON crisis_interventions(level, detected_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_critical ON crisis_interventions(priority, detected_at DESC) WHERE level IN ('severe', 'critical') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_status ON crisis_interventions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_types ON crisis_interventions USING GIN(types);

-- INDEXES para moderation_queue
-- Verificar se a tabela existe e adicionar colunas necessárias antes de criar índices
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'moderation_queue'
  ) THEN
    -- Verificar e adicionar coluna status se não existir
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'moderation_queue'
        AND column_name = 'status'
    ) THEN
      ALTER TABLE moderation_queue
      ADD COLUMN status moderation_status NOT NULL DEFAULT 'pending';
      RAISE NOTICE 'Coluna status adicionada à tabela moderation_queue';
    END IF;
    
    -- Verificar e adicionar coluna deleted_at se não existir
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'moderation_queue'
        AND column_name = 'deleted_at'
    ) THEN
      ALTER TABLE moderation_queue
      ADD COLUMN deleted_at TIMESTAMPTZ;
      RAISE NOTICE 'Coluna deleted_at adicionada à tabela moderation_queue';
    END IF;
    
    -- Agora criar os índices dentro do mesmo bloco, garantindo que as colunas existem
    -- Verificar novamente antes de criar cada índice
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'moderation_queue'
        AND column_name = 'status'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'moderation_queue'
        AND column_name = 'deleted_at'
    ) THEN
      -- Criar índices que dependem de status e deleted_at
      CREATE INDEX IF NOT EXISTS idx_mod_queue_pending ON moderation_queue(priority ASC, created_at ASC) WHERE status = 'pending' AND deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned ON moderation_queue(assigned_to, assignment_expires_at) WHERE status = 'assigned' AND deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_mod_queue_status_date ON moderation_queue(status, created_at DESC) WHERE deleted_at IS NULL;
      
      -- Índices que dependem apenas de deleted_at
      CREATE INDEX IF NOT EXISTS idx_mod_queue_author ON moderation_queue(author_id) WHERE deleted_at IS NULL;
      
      -- Índices que não dependem de status ou deleted_at
      CREATE INDEX IF NOT EXISTS idx_mod_queue_content ON moderation_queue(content_id, content_type);
      CREATE INDEX IF NOT EXISTS idx_mod_queue_flags ON moderation_queue USING GIN(auto_filter_flags);
      
      RAISE NOTICE 'Índices da tabela moderation_queue criados com sucesso';
    ELSE
      RAISE WARNING 'Colunas status ou deleted_at não foram criadas corretamente';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela moderation_queue não existe ainda. Execute PASSO2_tables.sql primeiro.';
  END IF;
END $$;

-- INDEX para moderators
CREATE INDEX IF NOT EXISTS idx_moderators_active ON moderators(tier, last_active_at DESC) WHERE active = TRUE AND deleted_at IS NULL;

-- RLS
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

-- Crisis RLS Policies
DROP POLICY IF EXISTS "Users can view own crisis" ON crisis_interventions;
CREATE POLICY "Users can view own crisis" ON crisis_interventions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert crisis" ON crisis_interventions;
CREATE POLICY "System can insert crisis" ON crisis_interventions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Users can update own crisis" ON crisis_interventions;
CREATE POLICY "Users can update own crisis" ON crisis_interventions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role crisis" ON crisis_interventions;
CREATE POLICY "Service role crisis" ON crisis_interventions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Moderation Queue RLS Policies
DROP POLICY IF EXISTS "Moderators can view queue" ON moderation_queue;
CREATE POLICY "Moderators can view queue" ON moderation_queue FOR SELECT USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

DROP POLICY IF EXISTS "Authors can view own" ON moderation_queue;
CREATE POLICY "Authors can view own" ON moderation_queue FOR SELECT USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Service role queue" ON moderation_queue;
CREATE POLICY "Service role queue" ON moderation_queue FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Moderators RLS Policies
DROP POLICY IF EXISTS "Moderators view self" ON moderators;
CREATE POLICY "Moderators view self" ON moderators FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role moderators" ON moderators;
CREATE POLICY "Service role moderators" ON moderators FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Metrics RLS Policies
DROP POLICY IF EXISTS "Moderators view metrics" ON moderation_metrics;
CREATE POLICY "Moderators view metrics" ON moderation_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

DROP POLICY IF EXISTS "Service role metrics" ON moderation_metrics;
CREATE POLICY "Service role metrics" ON moderation_metrics FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Seed initial metrics
INSERT INTO moderation_metrics (date) VALUES (CURRENT_DATE) ON CONFLICT (date) DO NOTHING;

SELECT 'PASSO 3 COMPLETE - Indexes e RLS criados!' as status;
