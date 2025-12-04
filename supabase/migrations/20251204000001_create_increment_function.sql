-- =============================================================================
-- Migration: 20251204000001_create_increment_function.sql
-- Funcao generica para incrementar contadores de forma segura
-- Nossa Maternidade
-- =============================================================================

-- Drop se existir para recriar
DROP FUNCTION IF EXISTS increment(UUID, TEXT, TEXT);

-- =============================================================================
-- Funcao increment
-- Incrementa contadores (views_count, likes_count, comments_count) de forma segura
-- =============================================================================

CREATE OR REPLACE FUNCTION increment(
  row_id UUID,
  table_name TEXT,
  column_name TEXT
)
RETURNS void AS $$
DECLARE
  allowed_tables TEXT[] := ARRAY['content_items', 'community_posts', 'community_comments'];
  allowed_columns TEXT[] := ARRAY['views_count', 'likes_count', 'comments_count'];
BEGIN
  -- Validar table_name para evitar SQL injection
  IF NOT (table_name = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Table "%" is not allowed for increment. Allowed: %', table_name, allowed_tables;
  END IF;

  -- Validar column_name para evitar SQL injection
  IF NOT (column_name = ANY(allowed_columns)) THEN
    RAISE EXCEPTION 'Column "%" is not allowed for increment. Allowed: %', column_name, allowed_columns;
  END IF;

  -- Executar update de forma segura usando format
  EXECUTE format(
    'UPDATE %I SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    table_name,
    column_name,
    column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION increment IS 'Incrementa contador de forma segura. Tabelas permitidas: content_items, community_posts, community_comments. Colunas permitidas: views_count, likes_count, comments_count';

-- Grant para usuarios autenticados
GRANT EXECUTE ON FUNCTION increment TO authenticated;
GRANT EXECUTE ON FUNCTION increment TO anon;

-- =============================================================================
-- Funcao decrement (util para likes/unlikes)
-- =============================================================================

CREATE OR REPLACE FUNCTION decrement(
  row_id UUID,
  table_name TEXT,
  column_name TEXT
)
RETURNS void AS $$
DECLARE
  allowed_tables TEXT[] := ARRAY['content_items', 'community_posts', 'community_comments'];
  allowed_columns TEXT[] := ARRAY['views_count', 'likes_count', 'comments_count'];
BEGIN
  -- Validar table_name
  IF NOT (table_name = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Table "%" is not allowed for decrement. Allowed: %', table_name, allowed_tables;
  END IF;

  -- Validar column_name
  IF NOT (column_name = ANY(allowed_columns)) THEN
    RAISE EXCEPTION 'Column "%" is not allowed for decrement. Allowed: %', column_name, allowed_columns;
  END IF;

  -- Executar update de forma segura (com minimo de 0)
  EXECUTE format(
    'UPDATE %I SET %I = GREATEST(COALESCE(%I, 0) - 1, 0) WHERE id = $1',
    table_name,
    column_name,
    column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION decrement IS 'Decrementa contador de forma segura (minimo 0). Tabelas permitidas: content_items, community_posts, community_comments. Colunas permitidas: views_count, likes_count, comments_count';

-- Grant para usuarios autenticados
GRANT EXECUTE ON FUNCTION decrement TO authenticated;
GRANT EXECUTE ON FUNCTION decrement TO anon;

-- =============================================================================
-- Verificacao
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'increment') THEN
    RAISE NOTICE 'Funcao increment criada com sucesso!';
  ELSE
    RAISE EXCEPTION 'Falha ao criar funcao increment';
  END IF;

  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'decrement') THEN
    RAISE NOTICE 'Funcao decrement criada com sucesso!';
  ELSE
    RAISE EXCEPTION 'Falha ao criar funcao decrement';
  END IF;
END $$;
