-- =============================================================================
-- RLS + INDEXES - Nossa Maternidade
-- Execute APÓS criar as tabelas (CLEANUP_03)
-- =============================================================================

-- =============================================================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- =============================================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS moderation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS breastfeeding_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PARTE 2: RLS POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- USER_CONSENTS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own consents" ON user_consents;
CREATE POLICY "Users can view own consents" ON user_consents FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own consents" ON user_consents;
CREATE POLICY "Users can insert own consents" ON user_consents FOR INSERT WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- CHAT_SESSIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
CREATE POLICY "Users can view own sessions" ON chat_sessions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
CREATE POLICY "Users can create own sessions" ON chat_sessions FOR INSERT WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- CHAT_MESSAGES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- CRISIS_INTERVENTIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own crisis" ON crisis_interventions;
CREATE POLICY "Users can view own crisis" ON crisis_interventions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert crisis" ON crisis_interventions;
CREATE POLICY "System can insert crisis" ON crisis_interventions FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------------------------------------------
-- EMOTION_LOGS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own emotions" ON emotion_logs;
CREATE POLICY "Users can manage own emotions" ON emotion_logs FOR ALL USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- HABITS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- HABIT_LOGS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;
CREATE POLICY "Users can manage own habit logs" ON habit_logs FOR ALL USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- CONTENT_ITEMS (público para leitura)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published content" ON content_items;
CREATE POLICY "Anyone can view published content" ON content_items FOR SELECT USING (published = TRUE);

-- -----------------------------------------------------------------------------
-- CONTENT_CATEGORIES (público)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view categories" ON content_categories;
CREATE POLICY "Anyone can view categories" ON content_categories FOR SELECT USING (TRUE);

-- -----------------------------------------------------------------------------
-- USER_CONTENT_INTERACTIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own interactions" ON user_content_interactions;
CREATE POLICY "Users can manage own interactions" ON user_content_interactions FOR ALL USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- COMMUNITY_POSTS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view approved posts" ON community_posts;
CREATE POLICY "Anyone can view approved posts" ON community_posts FOR SELECT USING (status = 'approved' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (author_id = auth.uid());

-- -----------------------------------------------------------------------------
-- COMMUNITY_COMMENTS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view approved comments" ON community_comments;
CREATE POLICY "Anyone can view approved comments" ON community_comments FOR SELECT USING (status = 'approved' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can create comments" ON community_comments;
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (author_id = auth.uid());

-- -----------------------------------------------------------------------------
-- COMMUNITY_REACTIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view reactions" ON community_reactions;
CREATE POLICY "Anyone can view reactions" ON community_reactions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage own reactions" ON community_reactions;
CREATE POLICY "Users can manage own reactions" ON community_reactions FOR ALL USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- MODERATION_QUEUE
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Moderators can view queue" ON moderation_queue;
CREATE POLICY "Moderators can view queue" ON moderation_queue FOR SELECT
USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

DROP POLICY IF EXISTS "Moderators can update queue" ON moderation_queue;
CREATE POLICY "Moderators can update queue" ON moderation_queue FOR UPDATE
USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

-- -----------------------------------------------------------------------------
-- MODERATORS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Moderators can view self" ON moderators;
CREATE POLICY "Moderators can view self" ON moderators FOR SELECT USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- MODERATION_METRICS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Moderators can view metrics" ON moderation_metrics;
CREATE POLICY "Moderators can view metrics" ON moderation_metrics FOR SELECT
USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- FUNNEL_EVENTS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own funnel" ON funnel_events;
CREATE POLICY "Users can view own funnel" ON funnel_events FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can insert funnel" ON funnel_events;
CREATE POLICY "Anyone can insert funnel" ON funnel_events FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- BREASTFEEDING_SESSIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own feeding" ON breastfeeding_sessions;
CREATE POLICY "Users can manage own feeding" ON breastfeeding_sessions FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- PARTE 3: INDEXES PARA PERFORMANCE
-- =============================================================================

-- PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at DESC);

-- USER_SESSIONS
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, session_start DESC);

-- CHAT_SESSIONS
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id, started_at DESC);

-- CHAT_MESSAGES
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);

-- CRISIS_INTERVENTIONS
CREATE INDEX IF NOT EXISTS idx_crisis_user_active ON crisis_interventions(user_id, detected_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_follow_up ON crisis_interventions(follow_up_scheduled_at) WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_level ON crisis_interventions(level, detected_at DESC);

-- EMOTION_LOGS
CREATE INDEX IF NOT EXISTS idx_emotion_user_date ON emotion_logs(user_id, logged_at DESC);

-- HABITS
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id) WHERE active = TRUE;

-- HABIT_LOGS
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, completed_at DESC);

-- CONTENT_ITEMS
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published_at DESC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category) WHERE published = TRUE;

-- COMMUNITY_POSTS
CREATE INDEX IF NOT EXISTS idx_posts_approved ON community_posts(created_at DESC) WHERE status = 'approved' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_author ON community_posts(author_id, created_at DESC);

-- COMMUNITY_COMMENTS
CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id, created_at) WHERE deleted_at IS NULL;

-- MODERATION_QUEUE
CREATE INDEX IF NOT EXISTS idx_mod_queue_pending ON moderation_queue(priority ASC, created_at ASC) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned ON moderation_queue(assigned_to) WHERE status = 'assigned';

-- FUNNEL_EVENTS
CREATE INDEX IF NOT EXISTS idx_funnel_user ON funnel_events(user_id, stage, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_funnel_stage ON funnel_events(stage, created_at DESC) WHERE deleted_at IS NULL;

-- BREASTFEEDING_SESSIONS
CREATE INDEX IF NOT EXISTS idx_feeding_user ON breastfeeding_sessions(user_id, started_at DESC);

-- =============================================================================
-- PARTE 4: TRIGGERS BÁSICOS
-- =============================================================================

-- Função genérica para updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas com updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles', 'habits', 'content_items', 'community_posts',
    'community_comments', 'moderation_queue', 'moderators', 'moderation_metrics'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated ON %I;
      CREATE TRIGGER trg_%I_updated
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    ', t, t, t, t);
  END LOOP;
END $$;

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

SELECT
  'RLS + INDEXES aplicados!' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;
