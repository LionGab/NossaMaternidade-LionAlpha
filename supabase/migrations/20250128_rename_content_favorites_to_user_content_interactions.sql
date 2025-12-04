-- =============================================================================
-- Migration: Renomear content_favorites → user_content_interactions
-- Data: 2025-01-28
-- Descrição: Alinha nome da tabela com o código do app (FeedService usa 'user_content_interactions')
--             e padroniza com prefixo 'user_' para dados pessoais
-- =============================================================================

-- Verificar se a tabela content_favorites existe antes de renomear
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'content_favorites'
  ) THEN
    -- Renomear tabela
    ALTER TABLE public.content_favorites RENAME TO user_content_interactions;
    
    RAISE NOTICE 'Tabela content_favorites renomeada para user_content_interactions';
  ELSE
    RAISE NOTICE 'Tabela content_favorites não existe. Pulando rename.';
  END IF;
END $$;

-- Renomear índices que referenciam content_favorites
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND (indexname LIKE '%content_favorites%' OR indexname LIKE '%content_favorite%')
  LOOP
    EXECUTE format('ALTER INDEX IF EXISTS %I RENAME TO %I',
      idx_record.indexname,
      replace(replace(idx_record.indexname, 'content_favorites', 'user_content_interactions'), 'content_favorite', 'user_content_interaction')
    );
  END LOOP;
END $$;

-- Verificar estrutura da tabela e garantir que tem as colunas esperadas pelo FeedService
-- FeedService espera: user_id, content_id, is_liked, is_saved, is_completed, progress_seconds, last_viewed_at
DO $$
BEGIN
  -- Verificar se coluna is_liked existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
      AND column_name = 'is_liked'
  ) THEN
    ALTER TABLE public.user_content_interactions
    ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_liked adicionada à tabela user_content_interactions';
  END IF;

  -- Verificar se coluna is_saved existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
      AND column_name = 'is_saved'
  ) THEN
    ALTER TABLE public.user_content_interactions
    ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_saved adicionada à tabela user_content_interactions';
  END IF;

  -- Verificar se coluna is_completed existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
      AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE public.user_content_interactions
    ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_completed adicionada à tabela user_content_interactions';
  END IF;

  -- Verificar se coluna progress_seconds existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
      AND column_name = 'progress_seconds'
  ) THEN
    ALTER TABLE public.user_content_interactions
    ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna progress_seconds adicionada à tabela user_content_interactions';
  END IF;

  -- Verificar se coluna last_viewed_at existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
      AND column_name = 'last_viewed_at'
  ) THEN
    ALTER TABLE public.user_content_interactions
    ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna last_viewed_at adicionada à tabela user_content_interactions';
  END IF;
END $$;

-- Comentário final
COMMENT ON TABLE public.user_content_interactions IS 'Interações da usuária com conteúdo (likes, saves, progresso). Renomeado de content_favorites em 2025-01-28';

SELECT 'Migration completa: content_favorites → user_content_interactions' as status;

