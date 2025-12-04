-- =============================================================================
-- Migration 3/6: Rename content_favorites → user_content_interactions
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 2
-- =============================================================================

-- 1. Renomear a tabela
ALTER TABLE IF EXISTS public.content_favorites RENAME TO user_content_interactions;

-- 2. Adicionar colunas que o código espera (que content_favorites não tinha)
ALTER TABLE public.user_content_interactions
  ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT true, -- favoritos existentes = saved
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Renomear constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_pkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_pkey TO user_content_interactions_pkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_user_id_fkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_user_id_fkey TO user_content_interactions_user_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_content_id_fkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_content_id_fkey TO user_content_interactions_content_id_fkey;
  END IF;

  -- Unique constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_user_id_content_id_key'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_user_id_content_id_key TO user_content_interactions_user_id_content_id_key;
  END IF;
END $$;

-- 4. Renomear indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'content_favorites_user_id_idx') THEN
    ALTER INDEX content_favorites_user_id_idx RENAME TO user_content_interactions_user_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'content_favorites_content_id_idx') THEN
    ALTER INDEX content_favorites_content_id_idx RENAME TO user_content_interactions_content_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_favorites_user_id') THEN
    ALTER INDEX idx_content_favorites_user_id RENAME TO idx_user_content_interactions_user_id;
  END IF;
END $$;

-- 5. Criar novos indexes úteis
CREATE INDEX IF NOT EXISTS idx_user_content_interactions_user_content
  ON public.user_content_interactions(user_id, content_id);

CREATE INDEX IF NOT EXISTS idx_user_content_interactions_liked
  ON public.user_content_interactions(user_id) WHERE is_liked = true;

CREATE INDEX IF NOT EXISTS idx_user_content_interactions_saved
  ON public.user_content_interactions(user_id) WHERE is_saved = true;

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_content_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_content_interactions_updated_at ON public.user_content_interactions;
CREATE TRIGGER update_user_content_interactions_updated_at
  BEFORE UPDATE ON public.user_content_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_content_interactions_updated_at();

-- 7. Atualizar comentário da tabela
COMMENT ON TABLE public.user_content_interactions IS 'Interações de usuárias com conteúdos - likes, saves, progresso (renomeado de content_favorites)';

-- 8. Verificar se a renomeação foi bem sucedida
SELECT
  'user_content_interactions' as expected_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_content_interactions'
  ) as exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'content_favorites'
  ) as old_removed;

-- =============================================================================
-- NOTA: As RLS policies serão atualizadas na migration 6
-- =============================================================================
