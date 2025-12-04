-- =============================================================================
-- MVP_03_SCHEMA_CONSOLIDADO.sql - Nossa Maternidade
-- Schema final consolidado com 26 tabelas essenciais para MVP
-- =============================================================================
-- Execute DEPOIS de MVP_02_LIMPEZA_SEGURA.sql
-- Este script cria/atualiza as tabelas que faltam
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PARTE 1: ENUMS (8 tipos)
-- =============================================================================

DO $$ BEGIN CREATE TYPE crisis_level AS ENUM ('low', 'moderate', 'severe', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE crisis_type AS ENUM ('suicidal_ideation', 'self_harm', 'postpartum_depression', 'anxiety_attack', 'overwhelm', 'domestic_violence', 'baby_safety', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE intervention_status AS ENUM ('detected', 'resources_shown', 'user_acknowledged', 'contacted_cvv', 'contacted_samu', 'contacted_caps', 'continued_chat', 'left_app', 'resolved', 'escalated', 'follow_up_pending', 'follow_up_completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE moderation_status AS ENUM ('pending', 'assigned', 'in_review', 'approved', 'rejected', 'escalated', 'appealed', 'appeal_approved', 'appeal_rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_type AS ENUM ('post', 'comment', 'reply', 'profile_bio', 'profile_photo', 'message'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE moderation_source AS ENUM ('auto_filter', 'ai_review', 'user_report', 'manual', 'appeal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rejection_reason AS ENUM ('spam', 'hate_speech', 'harassment', 'nsfw', 'violence', 'self_harm', 'medical_misinformation', 'personal_info', 'advertising', 'off_topic', 'duplicate', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE funnel_stage AS ENUM ('app_opened', 'onboarding_started', 'onboarding_profile', 'onboarding_baby', 'onboarding_complete', 'aha_moment_nathia', 'aha_moment_tracker', 'aha_moment_community', 'first_week_active', 'subscription_viewed', 'subscription_started', 'churned', 'reactivated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- PARTE 2: TABELAS - DOMÍNIO CORE/AUTH (5 tabelas)
-- =============================================================================

-- 1. profiles (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  -- Dados do bebê
  baby_name TEXT,
  baby_birth_date DATE,
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'unknown', 'prefer_not_say')),
  gestational_week INTEGER,
  -- Dados do onboarding
  motherhood_stage TEXT CHECK (motherhood_stage IN ('trying_to_conceive', 'pregnant', 'postpartum', 'experienced_mother')),
  pregnancy_week INTEGER,
  emotions JSONB DEFAULT '[]'::jsonb,
  needs JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  -- Configurações
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT DEFAULT 'welcome',
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. user_consents (LGPD)
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing', 'data_processing', 'analytics')),
  version TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. consent_terms_versions (versões dos termos LGPD)
CREATE TABLE IF NOT EXISTS consent_terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing', 'data_processing', 'analytics')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consent_type, version)
);

-- 4. user_sessions (retenção)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  platform TEXT,
  app_version TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. legal_acceptances (aceites legais detalhados)
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_of_service', 'privacy_policy', 'data_processing_agreement')),
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, document_type, document_version)
);

-- =============================================================================
-- PARTE 3: TABELAS - DOMÍNIO CHAT/IA (3 tabelas)
-- =============================================================================

-- 6. chat_conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT DEFAULT 'gemini-pro',
  summary TEXT,
  emotion_detected TEXT,
  topics TEXT[],
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. crisis_interventions
CREATE TABLE IF NOT EXISTS crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level crisis_level NOT NULL,
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],
  status intervention_status NOT NULL DEFAULT 'detected',
  trigger_message TEXT,
  matched_patterns TEXT[],
  context_summary TEXT,
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_actions JSONB DEFAULT '[]'::jsonb,
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,
  outcome_notes TEXT,
  resolution_type TEXT,
  session_id UUID,
  app_version TEXT,
  device_info JSONB,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

-- =============================================================================
-- PARTE 4: TABELAS - DOMÍNIO EMOCIONAL/HÁBITOS (5 tabelas)
-- =============================================================================

-- 9. check_in_logs (check-ins diários)
CREATE TABLE IF NOT EXISTS check_in_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL CHECK (emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma')),
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  notes TEXT,
  factors TEXT[],
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. habits (definição de hábitos padrão)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. user_habits (hábitos da usuária)
CREATE TABLE IF NOT EXISTS user_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  custom_name TEXT,
  custom_target INTEGER DEFAULT 1,
  reminder_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id)
);

-- 12. habit_logs (registros de hábitos)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_habit_id UUID NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_habit_id, completed_at)
);

-- 13. sleep_logs (registro de sono)
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_start TIMESTAMPTZ NOT NULL,
  sleep_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  notes TEXT,
  baby_wakeups INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PARTE 5: TABELAS - DOMÍNIO CONTEÚDO (2 tabelas)
-- =============================================================================

-- 14. content_items
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'article', 'reels')),
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  duration INTEGER,
  author_name TEXT,
  author_avatar_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. user_content_interactions
CREATE TABLE IF NOT EXISTS user_content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  is_liked BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- =============================================================================
-- PARTE 6: TABELAS - DOMÍNIO COMUNIDADE (3 tabelas)
-- =============================================================================

-- 16. community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderation_score DECIMAL(3,2),
  moderation_flags TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 17. community_comments
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 18. community_likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- =============================================================================
-- PARTE 7: TABELAS - DOMÍNIO BEBÊ (2 tabelas)
-- =============================================================================

-- 19. baby_milestones
CREATE TABLE IF NOT EXISTS baby_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('motor', 'cognitivo', 'linguagem', 'social', 'sensorial')),
  age_months INTEGER NOT NULL,
  tips JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. user_baby_milestones
CREATE TABLE IF NOT EXISTS user_baby_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES baby_milestones(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- =============================================================================
-- PARTE 8: TABELAS - DOMÍNIO DIÁRIO (1 tabela)
-- =============================================================================

-- 21. diary_entries
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PARTE 9: TABELAS - DOMÍNIO ANALYTICS (2 tabelas)
-- =============================================================================

-- 22. funnel_events
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stage funnel_stage NOT NULL,
  previous_stage funnel_stage,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id UUID,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

-- 23. breastfeeding_sessions
CREATE TABLE IF NOT EXISTS breastfeeding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  side TEXT CHECK (side IN ('left', 'right', 'both')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PARTE 10: TABELAS - DOMÍNIO MODERAÇÃO (3 tabelas)
-- =============================================================================

-- 24. moderation_queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  content_text TEXT NOT NULL,
  content_metadata JSONB DEFAULT '{}'::jsonb,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_trust_score DECIMAL(3,2) DEFAULT 5.0,
  source moderation_source NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_safety_score DECIMAL(3,2),
  ai_analysis JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  decision moderation_status,
  decision_reason rejection_reason,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  appeal_text TEXT,
  appealed_at TIMESTAMPTZ,
  appeal_decision moderation_status,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 25. moderators (Super Mamas)
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'base' CHECK (tier IN ('base', 'senior', 'lead', 'founder')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  compensation_brl DECIMAL(10,2) DEFAULT 300.00,
  payment_info JSONB,
  hours_per_week INTEGER DEFAULT 4,
  available_hours JSONB,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  stats JSONB DEFAULT '{"total_reviewed": 0, "approved": 0, "rejected": 0, "escalated": 0}'::jsonb,
  training_completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 26. moderation_metrics
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_posts INTEGER DEFAULT 0,
  total_queued INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  auto_blocked INTEGER DEFAULT 0,
  ai_approved INTEGER DEFAULT 0,
  ai_blocked INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,
  human_rejected INTEGER DEFAULT 0,
  escalated INTEGER DEFAULT 0,
  avg_queue_latency_ms INTEGER,
  active_moderators INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PARTE 11: RLS POLICIES
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE breastfeeding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PARTE 12: ÍNDICES
-- =============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Content
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON content_items(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_user_content_interactions_user_id ON user_content_interactions(user_id);

-- Habits
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON user_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_id ON habit_logs(user_habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);

-- Community
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_comment_id ON community_likes(comment_id);

-- Milestones
CREATE INDEX IF NOT EXISTS idx_baby_milestones_age_months ON baby_milestones(age_months);
CREATE INDEX IF NOT EXISTS idx_user_baby_milestones_user_id ON user_baby_milestones(user_id);

-- Check-ins
CREATE INDEX IF NOT EXISTS idx_check_in_logs_user_id ON check_in_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_created_at ON check_in_logs(user_id, created_at DESC);

-- Crisis
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_user_id ON crisis_interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_level ON crisis_interventions(level);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_status ON crisis_interventions(status);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id ON funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_stage ON funnel_events(stage);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Moderation
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);

-- =============================================================================
-- PARTE 13: FUNCTIONS & TRIGGERS
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_content_interactions_updated_at ON user_content_interactions;
CREATE TRIGGER update_user_content_interactions_updated_at BEFORE UPDATE ON user_content_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_comments_updated_at ON community_comments;
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_baby_milestones_updated_at ON user_baby_milestones;
CREATE TRIGGER update_user_baby_milestones_updated_at BEFORE UPDATE ON user_baby_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_check_in_logs_updated_at ON check_in_logs;
CREATE TRIGGER update_check_in_logs_updated_at BEFORE UPDATE ON check_in_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crisis_interventions_updated_at ON crisis_interventions;
CREATE TRIGGER update_crisis_interventions_updated_at BEFORE UPDATE ON crisis_interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

SELECT
  '===== SCHEMA MVP CONSOLIDADO =====' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas;

-- Listar todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- FIM DO SCHEMA CONSOLIDADO MVP
-- Total esperado: 26 tabelas essenciais
-- =============================================================================
