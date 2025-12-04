-- ============================================
-- SQL Manual para Reparar Histórico de Migrações
-- Nossa Maternidade - LGPD Compliance
-- Data: 2025-12-02
-- ============================================
--
-- INSTRUÇÕES:
-- 1. Acesse: https://app.supabase.com/project/[seu-project-ref]
-- 2. Vá em SQL Editor > New Query
-- 3. Cole este SQL completo
-- 4. Execute (Run ou Ctrl+Enter)
-- 5. Verifique os resultados de cada bloco
-- ============================================

-- ============================================
-- BLOCO 1: DIAGNÓSTICO INICIAL
-- ============================================

SELECT
    '=== ESTADO ATUAL DAS MIGRAÇÕES ===' as info;

SELECT
    version,
    name,
    statements_applied_at as applied_at
FROM supabase_migrations.schema_migrations
ORDER BY version;

-- ============================================
-- BLOCO 2: REMOVER MIGRAÇÕES ÓRFÃS
-- (Que existem no remoto mas não localmente)
-- ============================================

SELECT
    '=== REMOVENDO MIGRAÇÕES ÓRFÃS ===' as info;

-- Lista de versões que NÃO existem mais localmente
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN (
    '001',
    '002',
    '20250103',
    '20250104',
    '20250105',
    '20250106',
    '20251116211817',
    '20251117005207'
)
RETURNING version, name, 'REMOVED' as status;

-- ============================================
-- BLOCO 3: SINCRONIZAR MIGRAÇÕES LOCAIS
-- (Inserir ou atualizar para corresponder aos arquivos locais)
-- ============================================

SELECT
    '=== SINCRONIZANDO MIGRAÇÕES LOCAIS ===' as info;

-- Migrações que DEVEM existir (correspondem aos arquivos em supabase/migrations/)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements_applied_at)
VALUES
    ('20250101000000', 'create_profiles_table', now()),
    ('20250126', 'check_in_logs', now()),
    ('20250126000000', 'add_onboarding_fields', now()),
    ('20250127', 'sleep_logs', now()),
    ('20250127000000', 'create_legal_acceptances', now()),
    ('20251202000000', 'lgpd_user_consents_audit_logs', now())
ON CONFLICT (version) DO UPDATE
SET
    name = EXCLUDED.name,
    statements_applied_at = COALESCE(
        supabase_migrations.schema_migrations.statements_applied_at,
        now()
    );

-- ============================================
-- BLOCO 4: VERIFICAÇÃO FINAL
-- ============================================

SELECT
    '=== ESTADO FINAL DAS MIGRAÇÕES ===' as info;

SELECT
    version,
    name,
    statements_applied_at as applied_at,
    CASE
        WHEN version IN (
            '20250101000000',
            '20250126',
            '20250126000000',
            '20250127',
            '20250127000000',
            '20251202000000'
        ) THEN 'OK - Sincronizado'
        ELSE 'ALERTA - Não reconhecido'
    END as status
FROM supabase_migrations.schema_migrations
ORDER BY version;

-- ============================================
-- BLOCO 5: VALIDAR OBJETOS LGPD
-- (Verificar se tabelas e funções foram criadas)
-- ============================================

SELECT
    '=== VALIDAÇÃO DE OBJETOS LGPD ===' as info;

-- Verificar tabelas LGPD
SELECT
    table_name,
    CASE
        WHEN table_name IS NOT NULL THEN 'OK - Existe'
        ELSE 'ERRO - Não existe'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'consent_terms_versions',
    'user_consents',
    'audit_logs',
    'audit_archive'
)
ORDER BY table_name;

-- Verificar funções LGPD
SELECT
    routine_name,
    CASE
        WHEN routine_name IS NOT NULL THEN 'OK - Existe'
        ELSE 'ERRO - Não existe'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'calculate_audit_hash',
    'insert_audit_log',
    'grant_consent',
    'revoke_consent',
    'get_user_consents'
)
ORDER BY routine_name;

-- Verificar ENUMs LGPD
SELECT
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('consent_type', 'consent_status', 'audit_event_category')
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================
-- BLOCO 6: VERIFICAR RLS
-- ============================================

SELECT
    '=== VERIFICAÇÃO DE RLS ===' as info;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity THEN 'OK - RLS Ativo'
        ELSE 'ALERTA - RLS Desativado'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'consent_terms_versions',
    'user_consents',
    'audit_logs',
    'audit_archive'
)
ORDER BY tablename;

-- ============================================
-- BLOCO 7: VERIFICAR POLICIES
-- ============================================

SELECT
    '=== VERIFICAÇÃO DE POLICIES ===' as info;

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'consent_terms_versions',
    'user_consents',
    'audit_logs',
    'audit_archive'
)
ORDER BY tablename, policyname;

-- ============================================
-- BLOCO 8: VERIFICAR TRIGGERS DE IMUTABILIDADE
-- ============================================

SELECT
    '=== VERIFICAÇÃO DE TRIGGERS ===' as info;

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'audit_logs'
ORDER BY trigger_name;

-- ============================================
-- BLOCO 9: CONTAGEM DE DADOS INICIAIS
-- ============================================

SELECT
    '=== DADOS INICIAIS ===' as info;

SELECT
    'consent_terms_versions' as table_name,
    count(*) as row_count
FROM public.consent_terms_versions
UNION ALL
SELECT
    'user_consents' as table_name,
    count(*) as row_count
FROM public.user_consents
UNION ALL
SELECT
    'audit_logs' as table_name,
    count(*) as row_count
FROM public.audit_logs
UNION ALL
SELECT
    'audit_archive' as table_name,
    count(*) as row_count
FROM public.audit_archive;

-- ============================================
-- FIM DO SCRIPT
--
-- PRÓXIMOS PASSOS:
-- 1. Verifique se todos os blocos retornaram "OK"
-- 2. Se houver erros, execute a migração LGPD manualmente:
--    - Copie o conteúdo de: supabase/migrations/20251202000000_lgpd_user_consents_audit_logs.sql
--    - Execute no SQL Editor
-- 3. No terminal, execute: supabase db pull
-- ============================================
