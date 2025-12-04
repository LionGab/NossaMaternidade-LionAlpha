-- =============================================================================
-- Migration 2/6: Rename posts → community_posts
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 1
-- =============================================================================

-- 1. Renomear a tabela
ALTER TABLE IF EXISTS public.posts RENAME TO community_posts;

-- 2. Renomear constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_pkey'
  ) THEN
    ALTER TABLE community_posts RENAME CONSTRAINT posts_pkey TO community_posts_pkey;
  END IF;

  -- Foreign key para user_id
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE community_posts RENAME CONSTRAINT posts_user_id_fkey TO community_posts_user_id_fkey;
  END IF;
END $$;

-- 3. Renomear indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'posts_user_id_idx') THEN
    ALTER INDEX posts_user_id_idx RENAME TO community_posts_user_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'posts_created_at_idx') THEN
    ALTER INDEX posts_created_at_idx RENAME TO community_posts_created_at_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_id') THEN
    ALTER INDEX idx_posts_user_id RENAME TO idx_community_posts_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_created_at') THEN
    ALTER INDEX idx_posts_created_at RENAME TO idx_community_posts_created_at;
  END IF;
END $$;

-- 4. Atualizar triggers que referenciam a tabela antiga
-- Primeiro, dropar triggers com referência ao nome antigo
DROP TRIGGER IF EXISTS increment_post_likes ON public.post_reactions;
DROP TRIGGER IF EXISTS decrement_post_likes ON public.post_reactions;

-- 5. Recriar triggers com referência ao novo nome
CREATE OR REPLACE FUNCTION public.increment_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recriar triggers
CREATE TRIGGER increment_community_post_likes
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.increment_community_post_likes_count();

CREATE TRIGGER decrement_community_post_likes
  AFTER DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.decrement_community_post_likes_count();

-- 6. Atualizar foreign keys em outras tabelas que referenciam posts
-- community_comments.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_comments_post_id_fkey'
  ) THEN
    -- FK já existe com nome correto, não precisa fazer nada
    NULL;
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'post_comments_post_id_fkey'
  ) THEN
    -- Dropar e recriar com novo nome
    ALTER TABLE community_comments DROP CONSTRAINT post_comments_post_id_fkey;
    ALTER TABLE community_comments
      ADD CONSTRAINT community_comments_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- community_likes.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_likes_post_id_fkey'
  ) THEN
    -- FK já aponta para tabela correta (PostgreSQL atualiza automaticamente)
    NULL;
  END IF;
END $$;

-- post_reactions.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'post_reactions_post_id_fkey'
  ) THEN
    -- Dropar e recriar apontando para community_posts
    ALTER TABLE post_reactions DROP CONSTRAINT post_reactions_post_id_fkey;
    ALTER TABLE post_reactions
      ADD CONSTRAINT post_reactions_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Atualizar comentário da tabela
COMMENT ON TABLE public.community_posts IS 'Posts da comunidade MãesValentes (renomeado de posts)';

-- 8. Verificar se a renomeação foi bem sucedida
SELECT
  'community_posts' as expected_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'community_posts'
  ) as exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'posts'
  ) as old_removed;

-- =============================================================================
-- NOTA: As RLS policies serão atualizadas na migration 6
-- =============================================================================
