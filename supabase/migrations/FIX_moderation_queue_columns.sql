-- =============================================================================
-- FIX: Adicionar colunas faltantes na moderation_queue
-- Execute ANTES do PASSO3
-- =============================================================================

-- Primeiro, ver estrutura atual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'moderation_queue'
ORDER BY ordinal_position;

-- Adicionar colunas faltantes (ignora se já existir)
DO $$
BEGIN
  -- priority
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'priority') THEN
    ALTER TABLE moderation_queue ADD COLUMN priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10);
    RAISE NOTICE 'Coluna priority adicionada';
  END IF;

  -- status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'status') THEN
    -- Primeiro criar o type se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
      CREATE TYPE moderation_status AS ENUM ('pending', 'assigned', 'in_review', 'approved', 'rejected', 'escalated', 'appealed', 'appeal_approved', 'appeal_rejected');
    END IF;
    ALTER TABLE moderation_queue ADD COLUMN status moderation_status NOT NULL DEFAULT 'pending';
    RAISE NOTICE 'Coluna status adicionada';
  END IF;

  -- deleted_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'deleted_at') THEN
    ALTER TABLE moderation_queue ADD COLUMN deleted_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna deleted_at adicionada';
  END IF;

  -- created_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'created_at') THEN
    ALTER TABLE moderation_queue ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    RAISE NOTICE 'Coluna created_at adicionada';
  END IF;

  -- assigned_to
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'assigned_to') THEN
    ALTER TABLE moderation_queue ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Coluna assigned_to adicionada';
  END IF;

  -- assignment_expires_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'assignment_expires_at') THEN
    ALTER TABLE moderation_queue ADD COLUMN assignment_expires_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna assignment_expires_at adicionada';
  END IF;

  -- author_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'author_id') THEN
    ALTER TABLE moderation_queue ADD COLUMN author_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Coluna author_id adicionada';
  END IF;

  -- content_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'content_id') THEN
    ALTER TABLE moderation_queue ADD COLUMN content_id UUID;
    RAISE NOTICE 'Coluna content_id adicionada';
  END IF;

  -- content_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'content_type') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
      CREATE TYPE content_type AS ENUM ('post', 'comment', 'reply', 'profile_bio', 'profile_photo', 'message');
    END IF;
    ALTER TABLE moderation_queue ADD COLUMN content_type content_type;
    RAISE NOTICE 'Coluna content_type adicionada';
  END IF;

  -- auto_filter_flags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'auto_filter_flags') THEN
    ALTER TABLE moderation_queue ADD COLUMN auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Coluna auto_filter_flags adicionada';
  END IF;

  -- time_in_queue_ms
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_queue' AND column_name = 'time_in_queue_ms') THEN
    ALTER TABLE moderation_queue ADD COLUMN time_in_queue_ms INTEGER;
    RAISE NOTICE 'Coluna time_in_queue_ms adicionada';
  END IF;

END $$;

-- Verificar resultado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'moderation_queue'
ORDER BY ordinal_position;

SELECT 'FIX COMPLETE - Colunas adicionadas!' as status;
