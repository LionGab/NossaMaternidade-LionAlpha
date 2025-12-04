-- =============================================================================
-- MVP_02_LIMPEZA_SEGURA.sql - Nossa Maternidade
-- Execute DEPOIS do MVP_01_DIAGNOSTICO.sql
-- =============================================================================
-- IMPORTANTE: Revise cada seção ANTES de descomentar e executar
-- Faça backup antes de executar comandos DROP
-- =============================================================================

-- =============================================================================
-- FASE 1: REMOÇÃO DE TABELAS DE TESTE/BACKUP (BAIXO RISCO)
-- =============================================================================
-- Estas tabelas são claramente temporárias/backup e podem ser removidas

-- Descomente após verificar que não contêm dados importantes:

-- DROP TABLE IF EXISTS test_table CASCADE;
-- DROP TABLE IF EXISTS test_users CASCADE;
-- DROP TABLE IF EXISTS test_profiles CASCADE;
-- DROP TABLE IF EXISTS tmp_migration CASCADE;
-- DROP TABLE IF EXISTS temp_data CASCADE;
-- DROP TABLE IF EXISTS profiles_old CASCADE;
-- DROP TABLE IF EXISTS profiles_backup CASCADE;
-- DROP TABLE IF EXISTS profiles_copy CASCADE;
-- DROP TABLE IF EXISTS users_backup CASCADE;
-- DROP TABLE IF EXISTS data_backup CASCADE;

-- =============================================================================
-- FASE 2: REMOÇÃO DE EXPERIMENTOS IA/RAG (MÉDIO RISCO)
-- =============================================================================
-- Tabelas de experimentos que não fazem parte do MVP

-- VERIFICAR PRIMEIRO se têm dados:
-- SELECT 'ai_conversations' as tabela, COUNT(*) as registros FROM ai_conversations
-- UNION ALL SELECT 'ai_memory_context', COUNT(*) FROM ai_memory_context
-- UNION ALL SELECT 'memory_embeddings', COUNT(*) FROM memory_embeddings
-- UNION ALL SELECT 'vector_embeddings', COUNT(*) FROM vector_embeddings
-- UNION ALL SELECT 'api_cache', COUNT(*) FROM api_cache
-- UNION ALL SELECT 'memory_summaries', COUNT(*) FROM memory_summaries;

-- Descomente após verificar:

-- DROP TABLE IF EXISTS ai_conversations CASCADE;
-- DROP TABLE IF EXISTS ai_memory_context CASCADE;
-- DROP TABLE IF EXISTS memory_embeddings CASCADE;
-- DROP TABLE IF EXISTS vector_embeddings CASCADE;
-- DROP TABLE IF EXISTS api_cache CASCADE;
-- DROP TABLE IF EXISTS memory_summaries CASCADE;
-- DROP TABLE IF EXISTS rag_documents CASCADE;
-- DROP TABLE IF EXISTS rag_chunks CASCADE;
-- DROP TABLE IF EXISTS embeddings CASCADE;

-- =============================================================================
-- FASE 3: REMOÇÃO DE FEATURES NÃO IMPLEMENTADAS (MÉDIO RISCO)
-- =============================================================================
-- Features planejadas mas não implementadas no MVP

-- VERIFICAR PRIMEIRO se têm dados:
-- SELECT 'weekly_challenges' as tabela, COUNT(*) as registros FROM weekly_challenges
-- UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
-- UNION ALL SELECT 'badges', COUNT(*) FROM badges
-- UNION ALL SELECT 'rewards', COUNT(*) FROM rewards;

-- Descomente após verificar:

-- DROP TABLE IF EXISTS weekly_challenges CASCADE;
-- DROP TABLE IF EXISTS achievements CASCADE;
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS rewards CASCADE;
-- DROP TABLE IF EXISTS user_rewards CASCADE;
-- DROP TABLE IF EXISTS gamification_events CASCADE;
-- DROP TABLE IF EXISTS points_history CASCADE;
-- DROP TABLE IF EXISTS leaderboard CASCADE;

-- Subscription/Payment (não implementado):
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS subscription_plans CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS payment_methods CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;

-- =============================================================================
-- FASE 4: CONSOLIDAÇÃO DE DUPLICATAS (ALTO RISCO)
-- =============================================================================
-- Tabelas que duplicam funcionalidade de outras

-- VERIFICAR se mood_checkins tem dados únicos:
-- SELECT * FROM mood_checkins LIMIT 10;
-- Se tiver dados, migrar para check_in_logs primeiro:
-- INSERT INTO check_in_logs (user_id, emotion, notes, created_at)
-- SELECT user_id, mood, notes, created_at FROM mood_checkins;

-- DROP TABLE IF EXISTS mood_checkins CASCADE;

-- VERIFICAR se emotion_logs tem dados únicos:
-- SELECT * FROM emotion_logs LIMIT 10;
-- Se tiver dados diferentes de check_in_logs, avaliar migração

-- DROP TABLE IF EXISTS emotion_logs CASCADE;

-- chat_sessions vs chat_conversations (código usa chat_conversations):
-- VERIFICAR: SELECT * FROM chat_sessions LIMIT 10;
-- DROP TABLE IF EXISTS chat_sessions CASCADE;

-- community_reactions vs community_likes (código usa community_likes):
-- VERIFICAR: SELECT * FROM community_reactions LIMIT 10;
-- DROP TABLE IF EXISTS community_reactions CASCADE;

-- =============================================================================
-- FASE 5: LIMPEZA DE ENUMS ÓRFÃOS
-- =============================================================================
-- Enums que não são mais usados

-- Listar enums:
SELECT typname FROM pg_type t
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.typtype = 'e'
ORDER BY typname;

-- Enums necessários para MVP:
-- crisis_level, crisis_type, intervention_status
-- moderation_status, content_type, moderation_source, rejection_reason
-- funnel_stage

-- Descomente para remover enums órfãos (após verificar que não são usados):
-- DROP TYPE IF EXISTS old_status_type CASCADE;
-- DROP TYPE IF EXISTS legacy_enum CASCADE;

-- =============================================================================
-- FASE 6: LIMPEZA DE FUNCTIONS ÓRFÃS
-- =============================================================================
-- Functions que não são mais necessárias

-- Listar functions órfãs:
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%_old'
    OR routine_name LIKE '%_backup'
    OR routine_name LIKE '%_test'
    OR routine_name LIKE 'tmp_%'
  )
ORDER BY routine_name;

-- Descomente para remover (após verificar):
-- DROP FUNCTION IF EXISTS function_name_old() CASCADE;

-- =============================================================================
-- FASE 7: LIMPEZA DE TRIGGERS ÓRFÃOS
-- =============================================================================
-- Triggers em tabelas que não existem mais

-- Listar triggers:
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- =============================================================================
-- FASE 8: LIMPEZA DE POLICIES ÓRFÃS
-- =============================================================================
-- Policies em tabelas que não existem mais são automaticamente removidas
-- pelo CASCADE nos DROP TABLE

-- =============================================================================
-- VERIFICAÇÃO PÓS-LIMPEZA
-- =============================================================================

SELECT
  '===== VERIFICAÇÃO PÓS-LIMPEZA =====' as secao,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as tabelas_restantes;

-- Listar tabelas restantes:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- RESULTADO ESPERADO APÓS LIMPEZA COMPLETA
-- =============================================================================
-- Total: 26 tabelas essenciais para MVP
--
-- CORE/AUTH (5):
--   profiles, user_consents, consent_terms_versions, user_sessions, legal_acceptances
--
-- CHAT/IA (3):
--   chat_conversations, chat_messages, crisis_interventions
--
-- EMOCIONAL (5):
--   check_in_logs, habits, user_habits, habit_logs, sleep_logs
--
-- CONTEUDO (2):
--   content_items, user_content_interactions
--
-- COMUNIDADE (3):
--   community_posts, community_comments, community_likes
--
-- BEBE (2):
--   baby_milestones, user_baby_milestones
--
-- DIARIO (1):
--   diary_entries
--
-- ANALYTICS (2):
--   funnel_events, breastfeeding_sessions
--
-- MODERACAO (3):
--   moderation_queue, moderators, moderation_metrics
-- =============================================================================
