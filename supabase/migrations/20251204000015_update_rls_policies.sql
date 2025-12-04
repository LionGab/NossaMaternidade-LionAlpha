-- =============================================================================
-- Migration 6/6: Update RLS Policies After Renames
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 5 (última migration!)
-- =============================================================================

-- =============================================================================
-- PARTE 1: RLS POLICIES PARA PROFILES (ex-user_profiles)
-- =============================================================================

-- Dropar policies antigas (se existirem com nome antigo)
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar novas policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- PARTE 2: RLS POLICIES PARA COMMUNITY_POSTS (ex-posts)
-- =============================================================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "posts_select_all" ON public.community_posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can view approved posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;

-- Criar novas policies
CREATE POLICY "community_posts_select_approved"
  ON public.community_posts FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "community_posts_insert_own"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts_update_own"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "community_posts_delete_own"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 3: RLS POLICIES PARA USER_CONTENT_INTERACTIONS (ex-content_favorites)
-- =============================================================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "content_favorites_select_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "content_favorites_insert_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "content_favorites_delete_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_content_interactions;
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_content_interactions;

-- Criar novas policies
CREATE POLICY "user_content_interactions_select_own"
  ON public.user_content_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_insert_own"
  ON public.user_content_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_update_own"
  ON public.user_content_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_delete_own"
  ON public.user_content_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 4: RLS POLICIES PARA COMMUNITY_COMMENTS
-- =============================================================================

-- Verificar e recriar policies
DROP POLICY IF EXISTS "community_comments_select_all" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_insert_own" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_update_own" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_delete_own" ON public.community_comments;

CREATE POLICY "community_comments_select_all"
  ON public.community_comments FOR SELECT
  USING (true);

CREATE POLICY "community_comments_insert_own"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_update_own"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "community_comments_delete_own"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 5: RLS POLICIES PARA COMMUNITY_LIKES
-- =============================================================================

DROP POLICY IF EXISTS "community_likes_select_own" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_insert_own" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_delete_own" ON public.community_likes;

CREATE POLICY "community_likes_select_own"
  ON public.community_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "community_likes_insert_own"
  ON public.community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_likes_delete_own"
  ON public.community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 6: RLS POLICIES PARA CHAT_CONVERSATIONS E CHAT_MESSAGES
-- =============================================================================

-- chat_conversations
DROP POLICY IF EXISTS "chat_conversations_select_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_insert_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_update_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_delete_own" ON public.chat_conversations;

CREATE POLICY "chat_conversations_select_own"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_insert_own"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_conversations_update_own"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_delete_own"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- chat_messages (via conversation ownership)
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;

CREATE POLICY "chat_messages_select_own"
  ON public.chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert_own"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PARTE 7: RLS POLICIES PARA HABITS E HABIT_LOGS
-- =============================================================================

-- habits (leitura pública, escrita restrita)
DROP POLICY IF EXISTS "habits_select_all" ON public.habits;

CREATE POLICY "habits_select_all"
  ON public.habits FOR SELECT
  USING (true);

-- habit_logs
DROP POLICY IF EXISTS "habit_logs_select_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_insert_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_delete_own" ON public.habit_logs;

CREATE POLICY "habit_logs_select_own"
  ON public.habit_logs FOR SELECT
  USING (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "habit_logs_insert_own"
  ON public.habit_logs FOR INSERT
  WITH CHECK (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "habit_logs_delete_own"
  ON public.habit_logs FOR DELETE
  USING (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- =============================================================================

-- Listar todas as tabelas com status de RLS
SELECT
  t.tablename as tabela,
  t.rowsecurity as rls_habilitado,
  COUNT(p.policyname) as qtd_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles',
    'community_posts',
    'user_content_interactions',
    'community_comments',
    'community_likes',
    'chat_conversations',
    'chat_messages',
    'habits',
    'habit_logs',
    'user_habits',
    'content_items',
    'user_consents',
    'consent_terms_versions',
    'crisis_interventions',
    'moderation_queue',
    'moderators',
    'moderation_metrics'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =============================================================================
-- RESUMO DAS MIGRAÇÕES EXECUTADAS
-- =============================================================================
SELECT '=== CONSOLIDAÇÃO DE SCHEMA CONCLUÍDA ===' as status;
SELECT '1. user_profiles → profiles ✓' as migration_1;
SELECT '2. posts → community_posts ✓' as migration_2;
SELECT '3. content_favorites → user_content_interactions ✓' as migration_3;
SELECT '4. Criada tabela user_habits ✓' as migration_4;
SELECT '5. Criada tabela content_items ✓' as migration_5;
SELECT '6. RLS policies atualizadas ✓' as migration_6;

-- Listar tabelas finais
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- FIM DA CONSOLIDAÇÃO DE SCHEMA
-- Total de tabelas esperado: ~20
-- =============================================================================
