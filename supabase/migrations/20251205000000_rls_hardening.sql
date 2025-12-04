-- =============================================================================
-- NOSSA MATERNIDADE - RLS HARDENING
-- Migration: 20251205000000_rls_hardening.sql
-- Data: 2025-12-05
-- Objetivo: LGPD compliance em RLS (ai_usage_logs, sessions, funnel_events, etc.)
--
-- RESUMO DAS CORREÇÕES:
-- 1. ai_usage_logs: Remover policy que permite acesso amplo para authenticated
-- 2. user_sessions: Adicionar DELETE para usuária + service_role
-- 3. legal_acceptances: Adicionar DELETE para usuária + service_role
-- 4. funnel_events: Remover leak via session_id para NULL users
-- 5. Adicionar service_role em tabelas operacionais:
--    - check_in_logs, sleep_logs, breastfeeding_sessions, user_sessions, legal_acceptances
--
-- TABELAS REAIS CONFIRMADAS NO SCHEMA:
-- - ai_usage_logs (20251204000000_create_ai_usage_logs.sql)
-- - user_sessions (20250128000000_user_sessions_retention.sql)
-- - legal_acceptances (20250127000000_create_legal_acceptances.sql)
-- - funnel_events (20251203000000_create_funnel_events.sql)
-- - check_in_logs (20250126_check_in_logs.sql)
-- - sleep_logs (20250127_sleep_logs.sql)
-- - breastfeeding_sessions (20250128000001_breastfeeding_sessions.sql)
-- =============================================================================

-- =============================================================================
-- PARTE 1: CORREÇÃO ai_usage_logs
-- PROBLEMA: Policy "Service role full access" permite qualquer authenticated ver tudo
-- SOLUÇÃO: Remover essa policy e criar uma correta apenas para service_role
-- =============================================================================

-- Remover a policy problemática que dá acesso amplo
DROP POLICY IF EXISTS "Service role full access" ON ai_usage_logs;

-- Criar policy correta: service_role com acesso total (para Edge Functions e admin)
CREATE POLICY "Service role full access ai_usage_logs"
  ON ai_usage_logs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- NOTA: As policies de usuário já estão corretas:
-- - "Users can view own AI usage" (SELECT com auth.uid() = user_id)
-- - "Users can insert own AI usage" (INSERT com auth.uid() = user_id)
-- Não precisamos recriá-las, apenas garantir que service_role funcione

-- =============================================================================
-- PARTE 2: service_role EM TABELAS OPERACIONAIS
-- OBJETIVO: Edge Functions precisam acessar essas tabelas
-- =============================================================================

-- -----------------------------------------------------------------------------
-- check_in_logs
-- Policies existentes: SELECT, INSERT, UPDATE, DELETE para usuária (OK)
-- Faltava: service_role
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access check_in_logs" ON check_in_logs;
CREATE POLICY "Service role full access check_in_logs"
  ON check_in_logs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- sleep_logs
-- Policies existentes: SELECT, INSERT, UPDATE, DELETE para usuária (OK)
-- Faltava: service_role
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access sleep_logs" ON sleep_logs;
CREATE POLICY "Service role full access sleep_logs"
  ON sleep_logs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- breastfeeding_sessions
-- Policies existentes: SELECT, INSERT, UPDATE, DELETE para usuária (OK)
-- Faltava: service_role
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access breastfeeding_sessions" ON breastfeeding_sessions;
CREATE POLICY "Service role full access breastfeeding_sessions"
  ON breastfeeding_sessions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- user_sessions
-- Policies existentes: SELECT, INSERT, UPDATE para usuária
-- Faltava: DELETE para usuária (LGPD Art. 18) e service_role
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access user_sessions" ON user_sessions;
CREATE POLICY "Service role full access user_sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- PARTE 3: DIREITO DE EXCLUSÃO LGPD (Art. 18 VI)
-- OBJETIVO: Usuárias podem deletar seus próprios dados
-- =============================================================================

-- -----------------------------------------------------------------------------
-- user_sessions: Adicionar DELETE
-- Policies existentes: "Usuárias podem ver/inserir/atualizar suas próprias sessões"
-- Faltava: DELETE
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Usuárias podem deletar suas próprias sessões" ON user_sessions;
CREATE POLICY "Usuárias podem deletar suas próprias sessões"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- legal_acceptances: Adicionar DELETE + service_role
--
-- DECISÃO: DELETE físico (não há coluna revoked_at nesta tabela)
-- A tabela legal_acceptances é para termos e privacidade. Para revogar,
-- a usuária pode deletar o registro (LGPD permite).
-- Se futuramente precisar de audit trail, use user_consents (que tem revoked_at).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access legal_acceptances" ON legal_acceptances;
CREATE POLICY "Service role full access legal_acceptances"
  ON legal_acceptances
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Usuárias podem deletar suas próprias aceitações" ON legal_acceptances;
CREATE POLICY "Usuárias podem deletar suas próprias aceitações"
  ON legal_acceptances
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 4: CORREÇÃO funnel_events
-- PROBLEMA: Policy "Users can view own funnel" permite ver eventos com user_id IS NULL
--           Isso pode vazar dados anônimos para qualquer usuária autenticada
-- SOLUÇÃO: Restringir SELECT apenas ao próprio user_id (não NULL)
--
-- NOTA: Existem 2 arquivos que criam policies para funnel_events:
--   - 20251203000000_create_funnel_events.sql: "Users can view own funnel events"
--   - CLEANUP_04_rls_indexes.sql: "Users can view own funnel"
-- Vamos dropar ambos os nomes para garantir
-- =============================================================================

-- Remover TODAS as variantes de policies de SELECT problemáticas
DROP POLICY IF EXISTS "Users can view own funnel" ON funnel_events;
DROP POLICY IF EXISTS "Users can view own funnel events" ON funnel_events;

-- Nova policy: Usuária só vê próprios eventos (não mais eventos anônimos)
CREATE POLICY "Users can view own funnel events"
  ON funnel_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT existente está OK: permite user_id NULL (anônimo) ou próprio
-- Nomes possíveis: "Anyone can insert funnel" ou "Users can insert funnel events"
-- Não precisamos alterar

-- Remover TODAS as variantes de service_role e criar uma padronizada
DROP POLICY IF EXISTS "Service role full access funnel_events" ON funnel_events;
DROP POLICY IF EXISTS "Service role has full access" ON funnel_events;
CREATE POLICY "Service role full access funnel_events"
  ON funnel_events
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- Lista tabelas sensíveis e conta policies
-- =============================================================================

DO $$
DECLARE
  table_record RECORD;
  policy_count INTEGER;
  tables_checked INTEGER := 0;
  tables_with_policies INTEGER := 0;
  sensitive_tables TEXT[] := ARRAY[
    -- Grupo A: Dados pessoais diretos
    'profiles',
    'chat_sessions',
    'chat_conversations',  -- nome alternativo em schema.sql
    'chat_messages',
    'habits',
    'user_habits',
    'habit_logs',
    'check_in_logs',
    'sleep_logs',
    'breastfeeding_sessions',
    'user_sessions',
    'user_content_interactions',
    'user_baby_milestones',
    'user_consents',
    'user_feature_flags',
    'legal_acceptances',
    'postpartum_screenings',
    'crisis_interventions',
    'ai_usage_logs',
    -- Grupo B: Conteúdo público moderado
    'community_posts',
    'community_comments',
    'community_likes',
    'post_reactions',
    'content_favorites',
    -- Grupo C: Catálogo
    'content_items',
    'baby_milestones',
    'consent_terms_versions',
    -- Grupo D: Admin/Auditoria
    'moderation_queue',
    'audit_logs',
    'audit_archive',
    'funnel_events',
    'moderators',
    'moderation_metrics'
  ];
  t TEXT;
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'RLS HARDENING - VERIFICAÇÃO DE POLICIES';
  RAISE NOTICE '===========================================';

  FOREACH t IN ARRAY sensitive_tables
  LOOP
    -- Verificar se a tabela existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      tables_checked := tables_checked + 1;

      -- Contar policies
      SELECT COUNT(*) INTO policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t;

      IF policy_count = 0 THEN
        RAISE WARNING '⚠️  Tabela % SEM POLICIES!', t;
      ELSE
        tables_with_policies := tables_with_policies + 1;
        RAISE NOTICE '✅ Tabela %: % policies', t, policy_count;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE '-------------------------------------------';
  RAISE NOTICE 'RESUMO: %/% tabelas com policies', tables_with_policies, tables_checked;
  RAISE NOTICE '===========================================';
END $$;

-- =============================================================================
-- NOTAS DE IMPLEMENTAÇÃO
-- =============================================================================
--
-- ADAPTAÇÕES FEITAS AO PLANO ORIGINAL:
--
-- 1. ai_usage_logs:
--    - Policy original "Service role full access" tinha condição errada
--    - Nova policy usa `TO service_role` que é a forma correta no Supabase
--
-- 2. funnel_events:
--    - Removida policy "Users can view own funnel" do CLEANUP_04_rls_indexes.sql
--    - Criada nova "Users can view own funnel events" sem leak de user_id IS NULL
--    - Service role adicionado para analytics
--
-- 3. legal_acceptances:
--    - Não tem coluna revoked_at, então DELETE é apropriado
--    - Para revogação com audit trail, usar tabela user_consents (tem revoked_at)
--
-- 4. Nomes de policies:
--    - Mantido padrão português das policies existentes
--    - service_role usa inglês por convenção Supabase
--
-- TESTE RECOMENDADO:
--
-- Como Usuária A:
--   INSERT INTO ai_usage_logs (user_id, profile, provider, model_name)
--   VALUES (auth.uid(), 'chat', 'gemini', 'gemini-pro');
--
-- Como Usuária B:
--   SELECT COUNT(*) FROM ai_usage_logs;
--   -- Deve retornar 0 (antes do fix retornava todos)
--
-- =============================================================================
