-- =============================================================================
-- Migration: Renomear posts → community_posts
-- Data: 2025-01-28
-- Descrição: Alinha nome da tabela com o código do app (CommunityService usa 'community_posts')
-- =============================================================================

-- Verificar se a tabela posts existe antes de renomear
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'posts'
  ) THEN
    -- Renomear tabela
    ALTER TABLE public.posts RENAME TO community_posts;
    
    RAISE NOTICE 'Tabela posts renomeada para community_posts';
  ELSE
    RAISE NOTICE 'Tabela posts não existe. Pulando rename.';
  END IF;
END $$;

-- Renomear índices que referenciam posts
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND (indexname LIKE '%posts%' OR indexname LIKE '%post%')
      AND indexname NOT LIKE '%community_posts%'
  LOOP
    -- Verificar se o índice realmente pertence à tabela posts (agora community_posts)
    IF EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'community_posts'
        AND indexname = idx_record.indexname
    ) THEN
      EXECUTE format('ALTER INDEX IF EXISTS %I RENAME TO %I',
        idx_record.indexname,
        replace(replace(idx_record.indexname, 'posts', 'community_posts'), 'post_', 'community_post_')
      );
    END IF;
  END LOOP;
END $$;

-- Atualizar foreign keys de outras tabelas que referenciam posts
-- Exemplo: community_comments.post_id → community_posts.id
-- PostgreSQL renomeia automaticamente, mas vamos verificar

-- Atualizar views materializadas se existirem
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT matviewname
    FROM pg_matviews
    WHERE schemaname = 'public'
  LOOP
    -- Views materializadas precisam ser recriadas manualmente
    RAISE NOTICE 'View materializada encontrada: %. Verifique se precisa atualizar referências a tabela posts.', view_record.matviewname;
  END LOOP;
END $$;

-- Comentário final
COMMENT ON TABLE public.community_posts IS 'Posts da comunidade (renomeado de posts em 2025-01-28)';

SELECT 'Migration completa: posts → community_posts' as status;

