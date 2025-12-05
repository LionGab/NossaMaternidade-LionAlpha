-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 05_rls_policies.sql
-- Descrição: Row Level Security (RLS) policies para todas as 16 tabelas
-- Ordem: Executar DEPOIS de 04_crisis_moderation.sql
-- =============================================================================

-- =============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE postpartum_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÃO HELPER: Verificar se é moderador
-- =============================================================================

CREATE OR REPLACE FUNCTION is_moderator(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_feature_flags
    WHERE user_id = p_user_id
      AND flag_name = 'moderator'
      AND enabled = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- =============================================================================
-- GRUPO A: TABELAS USER-OWNED (DADOS PESSOAIS)
-- Regra: Usuária só acessa/modifica próprios dados
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- Especial: id = auth.uid() (não user_id)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles for community" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;

-- Usuária pode ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Perfis públicos para comunidade (dados básicos: nome, avatar)
-- Permite ver perfis de outros usuários para exibir em posts/comentários
CREATE POLICY "Public profiles for community"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Usuária pode criar seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Usuária pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role tem acesso total
CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- chat_sessions
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Service role full access chat_sessions" ON chat_sessions;

CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access chat_sessions"
  ON chat_sessions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- chat_messages
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role full access chat_messages" ON chat_messages;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access chat_messages"
  ON chat_messages FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- habits
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
DROP POLICY IF EXISTS "Service role full access habits" ON habits;

CREATE POLICY "Users can manage own habits"
  ON habits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access habits"
  ON habits FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- habit_logs
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Service role full access habit_logs" ON habit_logs;

CREATE POLICY "Users can manage own habit logs"
  ON habit_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access habit_logs"
  ON habit_logs FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- content_favorites
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own favorites" ON content_favorites;
DROP POLICY IF EXISTS "Service role full access content_favorites" ON content_favorites;

CREATE POLICY "Users can manage own favorites"
  ON content_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access content_favorites"
  ON content_favorites FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- user_consents (LGPD - append-only para usuária)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can insert own consents" ON user_consents;
DROP POLICY IF EXISTS "Service role full access user_consents" ON user_consents;

-- Usuária pode ler seus próprios consentimentos
CREATE POLICY "Users can read own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuária pode inserir novos consentimentos (append-only)
CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- NOTA: UPDATE e DELETE não permitidos para authenticated (append-only)
-- Revogação é feita via INSERT de novo registro com status='revoked'

-- Service role pode gerenciar (para expirar termos automaticamente)
CREATE POLICY "Service role full access user_consents"
  ON user_consents FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- user_feature_flags
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own feature flags" ON user_feature_flags;
DROP POLICY IF EXISTS "Service role full access user_feature_flags" ON user_feature_flags;

-- Usuária pode ler suas próprias flags
CREATE POLICY "Users can read own feature flags"
  ON user_feature_flags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Apenas service_role pode criar/modificar flags
CREATE POLICY "Service role full access user_feature_flags"
  ON user_feature_flags FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- postpartum_screenings
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own screenings" ON postpartum_screenings;
DROP POLICY IF EXISTS "Service role full access postpartum_screenings" ON postpartum_screenings;

CREATE POLICY "Users can manage own screenings"
  ON postpartum_screenings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access postpartum_screenings"
  ON postpartum_screenings FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- crisis_interventions
-- Sensível: Usuária pode ver próprias, moderadores podem ver todas
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own crisis interventions" ON crisis_interventions;
DROP POLICY IF EXISTS "System can insert crisis interventions" ON crisis_interventions;
DROP POLICY IF EXISTS "Users can update own crisis interventions" ON crisis_interventions;
DROP POLICY IF EXISTS "Moderators can view all crisis interventions" ON crisis_interventions;
DROP POLICY IF EXISTS "Service role full access crisis_interventions" ON crisis_interventions;

-- Usuária pode ver suas próprias intervenções
CREATE POLICY "Users can view own crisis interventions"
  ON crisis_interventions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Sistema (NathIA) pode inserir intervenções
CREATE POLICY "System can insert crisis interventions"
  ON crisis_interventions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuária pode atualizar (ex: marcar como reconhecida)
CREATE POLICY "Users can update own crisis interventions"
  ON crisis_interventions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Moderadores podem ver todas as intervenções (para dashboard)
CREATE POLICY "Moderators can view all crisis interventions"
  ON crisis_interventions FOR SELECT
  TO authenticated
  USING (is_moderator());

-- Service role acesso total
CREATE POLICY "Service role full access crisis_interventions"
  ON crisis_interventions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- GRUPO B: CONTEÚDO PÚBLICO MODERADO
-- Regra: Leitura de aprovados, escrita do próprio
-- =============================================================================

-- -----------------------------------------------------------------------------
-- community_posts
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read approved posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can read own posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Moderators can manage all posts" ON community_posts;
DROP POLICY IF EXISTS "Service role full access community_posts" ON community_posts;

-- Qualquer autenticado pode ler posts aprovados
CREATE POLICY "Anyone can read approved posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (status = 'approved' AND deleted_at IS NULL);

-- Autor pode ler próprios posts (qualquer status)
CREATE POLICY "Authors can read own posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Usuárias autenticadas podem criar posts
CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Autor pode atualizar próprio post (se não rejeitado)
CREATE POLICY "Authors can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status != 'rejected')
  WITH CHECK (auth.uid() = author_id);

-- Autor pode deletar (soft delete) próprio post
CREATE POLICY "Authors can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Moderadores podem ver/gerenciar todos os posts
CREATE POLICY "Moderators can manage all posts"
  ON community_posts FOR ALL
  TO authenticated
  USING (is_moderator())
  WITH CHECK (is_moderator());

CREATE POLICY "Service role full access community_posts"
  ON community_posts FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- community_comments
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read approved comments" ON community_comments;
DROP POLICY IF EXISTS "Authors can read own comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_comments;
DROP POLICY IF EXISTS "Authors can update own comments" ON community_comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON community_comments;
DROP POLICY IF EXISTS "Moderators can manage all comments" ON community_comments;
DROP POLICY IF EXISTS "Service role full access community_comments" ON community_comments;

CREATE POLICY "Anyone can read approved comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Authors can read own comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create comments"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON community_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status != 'rejected')
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON community_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Moderators can manage all comments"
  ON community_comments FOR ALL
  TO authenticated
  USING (is_moderator())
  WITH CHECK (is_moderator());

CREATE POLICY "Service role full access community_comments"
  ON community_comments FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- community_likes
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read likes" ON community_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON community_likes;
DROP POLICY IF EXISTS "Service role full access community_likes" ON community_likes;

-- Qualquer autenticado pode ver likes
CREATE POLICY "Anyone can read likes"
  ON community_likes FOR SELECT
  TO authenticated
  USING (TRUE);

-- Usuária pode dar/remover próprios likes
CREATE POLICY "Users can manage own likes"
  ON community_likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access community_likes"
  ON community_likes FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- post_reactions
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can manage own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Service role full access post_reactions" ON post_reactions;

CREATE POLICY "Anyone can read reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can manage own reactions"
  ON post_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access post_reactions"
  ON post_reactions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- GRUPO C: TABELAS SENSÍVEIS/ADMINISTRATIVAS
-- Regra: Apenas service_role ou moderadores
-- =============================================================================

-- -----------------------------------------------------------------------------
-- consent_terms_versions
-- Leitura pública, escrita apenas admin
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read terms" ON consent_terms_versions;
DROP POLICY IF EXISTS "Service role can manage terms" ON consent_terms_versions;

-- Qualquer autenticado pode ler termos
CREATE POLICY "Anyone can read terms"
  ON consent_terms_versions FOR SELECT
  TO authenticated
  USING (TRUE);

-- Apenas service_role pode criar/modificar termos
CREATE POLICY "Service role can manage terms"
  ON consent_terms_versions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- moderation_queue
-- Apenas moderadores e service_role
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Moderators can view moderation queue" ON moderation_queue;
DROP POLICY IF EXISTS "Moderators can manage moderation queue" ON moderation_queue;
DROP POLICY IF EXISTS "Authors can view own content in queue" ON moderation_queue;
DROP POLICY IF EXISTS "Service role full access moderation_queue" ON moderation_queue;

-- Moderadores podem ver a fila
CREATE POLICY "Moderators can view moderation queue"
  ON moderation_queue FOR SELECT
  TO authenticated
  USING (is_moderator());

-- Moderadores podem gerenciar a fila
CREATE POLICY "Moderators can manage moderation queue"
  ON moderation_queue FOR ALL
  TO authenticated
  USING (is_moderator())
  WITH CHECK (is_moderator());

-- Autores podem ver status do próprio conteúdo na fila
CREATE POLICY "Authors can view own content in queue"
  ON moderation_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Service role acesso total
CREATE POLICY "Service role full access moderation_queue"
  ON moderation_queue FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'community_posts', 'chat_sessions', 'chat_messages',
      'habits', 'habit_logs', 'community_comments', 'community_likes',
      'post_reactions', 'content_favorites', 'consent_terms_versions',
      'user_consents', 'user_feature_flags', 'postpartum_screenings',
      'crisis_interventions', 'moderation_queue'
    );

  RAISE NOTICE '05_rls_policies.sql: % policies criadas/verificadas', rls_count;
END $$;
