-- =============================================================================
-- LIMPEZA DE TABELAS DUPLICADAS/LEGACY - Nossa Maternidade
-- ⚠️ EXECUTE COM CUIDADO - VALIDE O DIAGNÓSTICO PRIMEIRO
-- =============================================================================

-- =============================================================================
-- SEÇÃO 1: TABELAS CONFIRMADAS PARA REMOÇÃO
-- Descomente as linhas conforme validar que são seguras para remover
-- =============================================================================

-- ❌ EXPERIMENTOS DE IA/RAG (não utilizados no MVP)
-- DROP TABLE IF EXISTS ai_conversations CASCADE;
-- DROP TABLE IF EXISTS ai_memory_context CASCADE;
-- DROP TABLE IF EXISTS memory_embeddings CASCADE;
-- DROP TABLE IF EXISTS vector_embeddings CASCADE;
-- DROP TABLE IF EXISTS api_cache CASCADE;
-- DROP TABLE IF EXISTS memory_summaries CASCADE;

-- ❌ FUNCIONALIDADES NÃO IMPLEMENTADAS
-- DROP TABLE IF EXISTS baby_milestones CASCADE;
-- DROP TABLE IF EXISTS weekly_challenges CASCADE;
-- DROP TABLE IF EXISTS mood_checkins CASCADE; -- duplica emotion_logs

-- ❌ TABELAS DE TESTE/BACKUP
-- DROP TABLE IF EXISTS test_table CASCADE;
-- DROP TABLE IF EXISTS backup_profiles CASCADE;
-- DROP TABLE IF EXISTS profiles_old CASCADE;
-- DROP TABLE IF EXISTS profiles_backup CASCADE;

-- =============================================================================
-- SEÇÃO 2: TABELAS QUE PRECISAM ANÁLISE (rode o SELECT antes de dropar)
-- =============================================================================

-- Verificar se tem dados antes de dropar:
-- SELECT 'ai_conversations', COUNT(*) FROM ai_conversations
-- UNION ALL SELECT 'ai_memory_context', COUNT(*) FROM ai_memory_context
-- UNION ALL SELECT 'memory_embeddings', COUNT(*) FROM memory_embeddings
-- UNION ALL SELECT 'vector_embeddings', COUNT(*) FROM vector_embeddings;

-- =============================================================================
-- SEÇÃO 3: ENUMS DUPLICADOS/OBSOLETOS
-- =============================================================================

-- Listar enums que podem estar duplicados:
SELECT typname, COUNT(*)
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY typname
ORDER BY typname;

-- Para dropar enum obsoleto (cuidado - verificar se não está em uso):
-- DROP TYPE IF EXISTS nome_do_enum_obsoleto CASCADE;

-- =============================================================================
-- SEÇÃO 4: FUNCTIONS ÓRFÃS
-- =============================================================================

-- Listar functions que podem ser removidas:
SELECT
  routine_name,
  'DROP FUNCTION IF EXISTS ' || routine_name || ' CASCADE;' as comando_drop
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%_old'
  OR routine_name LIKE '%_backup'
  OR routine_name LIKE '%_test'
ORDER BY routine_name;

-- =============================================================================
-- SEÇÃO 5: TRIGGERS ÓRFÃOS
-- =============================================================================

-- Listar triggers que podem ser removidos:
SELECT
  trigger_name,
  event_object_table,
  'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON ' || event_object_table || ';' as comando_drop
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- =============================================================================
-- SEÇÃO 6: LIMPEZA AUTOMÁTICA (execute após validar manualmente)
-- =============================================================================

-- Esta função lista TODAS as tabelas que parecem ser duplicatas/legacy
-- e gera os comandos DROP para você revisar

DO $$
DECLARE
  r RECORD;
  drop_commands TEXT := '';
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== COMANDOS DROP SUGERIDOS (revisar antes de executar) ===';
  RAISE NOTICE '';

  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND (
        table_name LIKE '%_old'
        OR table_name LIKE '%_backup'
        OR table_name LIKE '%_v2'
        OR table_name LIKE '%_copy'
        OR table_name LIKE '%_temp'
        OR table_name LIKE '%_test'
        OR table_name LIKE 'test_%'
        OR table_name LIKE 'tmp_%'
        OR table_name LIKE 'temp_%'
      )
    ORDER BY table_name
  LOOP
    RAISE NOTICE 'DROP TABLE IF EXISTS % CASCADE;', r.table_name;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIM DOS COMANDOS SUGERIDOS ===';
END $$;

-- =============================================================================
-- SEÇÃO 7: VERIFICAÇÃO PÓS-LIMPEZA
-- =============================================================================

-- Após executar os DROPs, rode isto para verificar:
SELECT
  'Tabelas restantes:' as status,
  COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- =============================================================================
-- IMPORTANTE: BACKUP ANTES DE DROPAR
-- =============================================================================
-- Se quiser fazer backup de uma tabela antes de dropar:
--
-- CREATE TABLE nome_tabela_BACKUP_20251203 AS SELECT * FROM nome_tabela;
--
-- Depois de confirmar que não precisa:
-- DROP TABLE nome_tabela_BACKUP_20251203;
-- =============================================================================
