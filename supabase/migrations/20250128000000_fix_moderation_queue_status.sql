-- =============================================================================
-- FIX: Adicionar coluna status se não existir na tabela moderation_queue
-- =============================================================================

-- Verificar e adicionar colunas necessárias se não existirem
DO $$
BEGIN
  -- Verificar se a coluna status existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'moderation_queue'
      AND column_name = 'status'
  ) THEN
    -- Adicionar coluna status
    ALTER TABLE moderation_queue
    ADD COLUMN status moderation_status NOT NULL DEFAULT 'pending';
    
    RAISE NOTICE 'Coluna status adicionada à tabela moderation_queue';
  ELSE
    RAISE NOTICE 'Coluna status já existe na tabela moderation_queue';
  END IF;
  
  -- Verificar se a coluna deleted_at existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'moderation_queue'
      AND column_name = 'deleted_at'
  ) THEN
    -- Adicionar coluna deleted_at
    ALTER TABLE moderation_queue
    ADD COLUMN deleted_at TIMESTAMPTZ;
    
    RAISE NOTICE 'Coluna deleted_at adicionada à tabela moderation_queue';
  ELSE
    RAISE NOTICE 'Coluna deleted_at já existe na tabela moderation_queue';
  END IF;
END $$;

-- Recriar índices que dependem da coluna status (caso não existam)
CREATE INDEX IF NOT EXISTS idx_mod_queue_pending
  ON moderation_queue(priority ASC, created_at ASC)
  WHERE status = 'pending' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned
  ON moderation_queue(assigned_to, assignment_expires_at)
  WHERE status = 'assigned' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mod_queue_status_date
  ON moderation_queue(status, created_at DESC)
  WHERE deleted_at IS NULL;

