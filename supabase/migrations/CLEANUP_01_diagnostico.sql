-- =============================================================================
-- DIAGNÓSTICO COMPLETO DO SCHEMA - Nossa Maternidade
-- Execute PRIMEIRO para ver o estado atual do banco
-- =============================================================================

-- 1. LISTAR TODAS AS TABELAS COM TAMANHO
SELECT
  'TABELA' as tipo,
  table_name as nome,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as tamanho
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- 2. LISTAR TODOS OS TYPES/ENUMS
SELECT
  'ENUM' as tipo,
  typname as nome,
  array_agg(enumlabel ORDER BY enumsortorder) as valores
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY typname
ORDER BY typname;

-- 3. IDENTIFICAR DUPLICAÇÕES (tabelas com nomes similares)
SELECT
  regexp_replace(table_name, '(_old|_backup|_v[0-9]+|_copy|_temp|_test|_new|[0-9]+)$', '') as base_name,
  array_agg(table_name ORDER BY table_name) as variacoes,
  COUNT(*) as qtd_duplicadas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
GROUP BY regexp_replace(table_name, '(_old|_backup|_v[0-9]+|_copy|_temp|_test|_new|[0-9]+)$', '')
HAVING COUNT(*) > 1
ORDER BY qtd_duplicadas DESC;

-- 4. TABELAS VAZIAS (0 rows)
DO $$
DECLARE
  r RECORD;
  row_count INTEGER;
  empty_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', r.table_name) INTO row_count;
      IF row_count = 0 THEN
        empty_tables := array_append(empty_tables, r.table_name);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao contar %: %', r.table_name, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== TABELAS VAZIAS (candidatas a remoção) ===';
  FOR i IN 1..array_length(empty_tables, 1) LOOP
    RAISE NOTICE '  - %', empty_tables[i];
  END LOOP;
  RAISE NOTICE 'Total: % tabelas vazias', array_length(empty_tables, 1);
END $$;

-- 5. TABELAS SEM RLS (problema de segurança)
SELECT
  tablename as tabela_sem_rls,
  'ALERTA: RLS desabilitado!' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true
  )
ORDER BY tablename;

-- 6. VIEWS MATERIALIZADAS
SELECT
  'MATERIALIZED VIEW' as tipo,
  matviewname as nome
FROM pg_matviews
WHERE schemaname = 'public';

-- 7. FUNCTIONS EXISTENTES
SELECT
  'FUNCTION' as tipo,
  routine_name as nome,
  data_type as retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 8. TRIGGERS EXISTENTES
SELECT
  'TRIGGER' as tipo,
  trigger_name as nome,
  event_object_table as tabela,
  action_timing || ' ' || event_manipulation as quando
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================================================
-- RESUMO FINAL
-- =============================================================================
SELECT
  'RESUMO' as categoria,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
  (SELECT COUNT(DISTINCT typname) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as total_enums,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers;
