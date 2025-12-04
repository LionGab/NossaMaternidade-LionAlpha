-- =============================================================================
-- MVP_01_DIAGNOSTICO.sql - Nossa Maternidade
-- Execute PRIMEIRO para ver o estado atual do banco de dados
-- =============================================================================
-- Objetivo: Mapear todas as 96 tabelas e identificar o que pode ser removido
-- =============================================================================

-- 1. LISTAR TODAS AS TABELAS COM CONTAGEM DE ROWS
DO $$
DECLARE
  r RECORD;
  row_count BIGINT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'TABELAS NO SCHEMA PUBLIC (com contagem de registros)';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE '';

  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', r.table_name) INTO row_count;
      RAISE NOTICE '% - % registros', rpad(r.table_name, 40), row_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '% - ERRO: %', rpad(r.table_name, 40), SQLERRM;
    END;
  END LOOP;
END $$;

-- 2. RESUMO ESTATÍSTICO
SELECT
  '===== RESUMO =====' as info,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas;

-- 3. TABELAS VAZIAS (candidatas a remoção)
SELECT
  '===== TABELAS VAZIAS =====' as secao;

DO $$
DECLARE
  r RECORD;
  row_count BIGINT;
  empty_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'TABELAS VAZIAS (0 registros):';
  RAISE NOTICE '------------------------------';

  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', r.table_name) INTO row_count;
      IF row_count = 0 THEN
        RAISE NOTICE '  - %', r.table_name;
        empty_count := empty_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE 'Total de tabelas vazias: %', empty_count;
END $$;

-- 4. TABELAS LEGADAS/DUPLICADAS (padrão de nome)
SELECT
  '===== CANDIDATAS A REMOÇÃO (por padrão de nome) =====' as secao;

SELECT table_name,
  CASE
    WHEN table_name LIKE '%_old' THEN 'LEGADO (_old)'
    WHEN table_name LIKE '%_backup' THEN 'BACKUP'
    WHEN table_name LIKE '%_copy' THEN 'COPIA'
    WHEN table_name LIKE '%_v2' OR table_name LIKE '%_v3' THEN 'VERSAO'
    WHEN table_name LIKE 'test_%' OR table_name LIKE '%_test' THEN 'TESTE'
    WHEN table_name LIKE 'tmp_%' OR table_name LIKE 'temp_%' THEN 'TEMPORARIA'
    ELSE 'VERIFICAR'
  END as categoria
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name LIKE '%_old'
    OR table_name LIKE '%_backup'
    OR table_name LIKE '%_copy'
    OR table_name LIKE '%_v2'
    OR table_name LIKE '%_v3'
    OR table_name LIKE 'test_%'
    OR table_name LIKE '%_test'
    OR table_name LIKE 'tmp_%'
    OR table_name LIKE 'temp_%'
  )
ORDER BY categoria, table_name;

-- 5. TABELAS ESSENCIAIS PARA MVP (26 tabelas)
SELECT
  '===== TABELAS ESSENCIAIS MVP =====' as secao;

SELECT table_name,
  CASE
    WHEN table_name IN ('profiles', 'user_consents', 'consent_terms_versions', 'user_sessions', 'legal_acceptances') THEN 'CORE/AUTH'
    WHEN table_name IN ('chat_conversations', 'chat_messages', 'crisis_interventions') THEN 'CHAT/IA'
    WHEN table_name IN ('check_in_logs', 'habits', 'user_habits', 'habit_logs', 'sleep_logs') THEN 'EMOCIONAL'
    WHEN table_name IN ('content_items', 'user_content_interactions') THEN 'CONTEUDO'
    WHEN table_name IN ('community_posts', 'community_comments', 'community_likes') THEN 'COMUNIDADE'
    WHEN table_name IN ('baby_milestones', 'user_baby_milestones') THEN 'BEBE'
    WHEN table_name IN ('diary_entries') THEN 'DIARIO'
    WHEN table_name IN ('funnel_events', 'breastfeeding_sessions') THEN 'ANALYTICS'
    WHEN table_name IN ('moderation_queue', 'moderators', 'moderation_metrics') THEN 'MODERACAO'
    ELSE 'NAO ESSENCIAL'
  END as dominio,
  EXISTS (
    SELECT 1 FROM information_schema.tables t2
    WHERE t2.table_schema = 'public' AND t2.table_name = tables.table_name
  ) as existe
FROM (
  VALUES
    ('profiles'), ('user_consents'), ('consent_terms_versions'), ('user_sessions'), ('legal_acceptances'),
    ('chat_conversations'), ('chat_messages'), ('crisis_interventions'),
    ('check_in_logs'), ('habits'), ('user_habits'), ('habit_logs'), ('sleep_logs'),
    ('content_items'), ('user_content_interactions'),
    ('community_posts'), ('community_comments'), ('community_likes'),
    ('baby_milestones'), ('user_baby_milestones'),
    ('diary_entries'),
    ('funnel_events'), ('breastfeeding_sessions'),
    ('moderation_queue'), ('moderators'), ('moderation_metrics')
) AS tables(table_name)
ORDER BY dominio, table_name;

-- 6. TABELAS NAO ESSENCIAIS (candidatas a remoção)
SELECT
  '===== TABELAS NAO ESSENCIAIS (candidatas a remoção) =====' as secao;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN (
    -- Core/Auth
    'profiles', 'user_consents', 'consent_terms_versions', 'user_sessions', 'legal_acceptances',
    -- Chat/IA
    'chat_conversations', 'chat_messages', 'crisis_interventions',
    -- Emocional
    'check_in_logs', 'habits', 'user_habits', 'habit_logs', 'sleep_logs',
    -- Conteudo
    'content_items', 'user_content_interactions',
    -- Comunidade
    'community_posts', 'community_comments', 'community_likes',
    -- Bebe
    'baby_milestones', 'user_baby_milestones',
    -- Diario
    'diary_entries',
    -- Analytics
    'funnel_events', 'breastfeeding_sessions',
    -- Moderacao
    'moderation_queue', 'moderators', 'moderation_metrics'
  )
ORDER BY table_name;

-- 7. ENUMS EXISTENTES
SELECT
  '===== ENUMS EXISTENTES =====' as secao;

SELECT
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as valores
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- 8. TABELAS SEM RLS (problema de segurança)
SELECT
  '===== TABELAS SEM RLS (ALERTA SEGURANCA) =====' as secao;

SELECT tablename as tabela_sem_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- 9. VIEWS MATERIALIZADAS
SELECT
  '===== VIEWS MATERIALIZADAS =====' as secao;

SELECT matviewname as view_name
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- 10. FUNCTIONS
SELECT
  '===== FUNCTIONS =====' as secao;

SELECT routine_name, data_type as retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 11. TRIGGERS
SELECT
  '===== TRIGGERS =====' as secao;

SELECT
  trigger_name,
  event_object_table as tabela,
  action_timing || ' ' || event_manipulation as quando
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================================================
-- FIM DO DIAGNOSTICO
-- =============================================================================
-- Resultado esperado: Lista completa de tabelas organizadas por categoria
-- Próximo passo: Executar MVP_02_LIMPEZA_SEGURA.sql
-- =============================================================================
