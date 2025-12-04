-- =============================================================================
-- SCHEMA ALVO CONSOLIDADO - Nossa Maternidade
-- Este é o schema FINAL que deve existir após a limpeza
-- Total: 20 tabelas essenciais
-- =============================================================================

-- =============================================================================
-- PARTE 1: ENUMS (7 tipos)
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
-- PARTE 2: TABELAS ESSENCIAIS (20 tabelas)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DOMÍNIO: USUÁRIAS (3 tabelas)
-- -----------------------------------------------------------------------------

-- profiles (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  -- Dados do bebê
  baby_name TEXT,
  baby_birth_date DATE,
  baby_gender TEXT,
  gestational_week INTEGER,
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT DEFAULT 'welcome',
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- user_consents (LGPD)
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'marketing', 'data_processing'
  version TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_sessions (retenção)
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

-- -----------------------------------------------------------------------------
-- DOMÍNIO: CHAT/IA (3 tabelas)
-- -----------------------------------------------------------------------------

-- chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary TEXT, -- resumo gerado por IA
  emotion_detected TEXT,
  topics TEXT[],
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- crisis_interventions
CREATE TABLE IF NOT EXISTS crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level crisis_level NOT NULL,
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],
  status intervention_status NOT NULL DEFAULT 'detected',
  trigger_message TEXT,
  matched_patterns TEXT[],
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- DOMÍNIO: EMOÇÕES & HÁBITOS (3 tabelas)
-- -----------------------------------------------------------------------------

-- emotion_logs (check-ins diários)
CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL, -- 'happy', 'sad', 'anxious', 'tired', 'overwhelmed'
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  notes TEXT,
  factors TEXT[], -- ['sleep', 'baby', 'partner', 'work']
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- habits (definição de hábitos)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
  target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- dias da semana
  reminder_time TIME,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- habit_logs (registros de hábitos)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- DOMÍNIO: CONTEÚDO (3 tabelas)
-- -----------------------------------------------------------------------------

-- content_items (artigos, posts curados)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  body TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  category TEXT,
  tags TEXT[],
  author_name TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- content_categories
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_content_interactions (likes, bookmarks, views)
CREATE TABLE IF NOT EXISTS user_content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, interaction_type)
);

-- -----------------------------------------------------------------------------
-- DOMÍNIO: COMUNIDADE (3 tabelas)
-- -----------------------------------------------------------------------------

-- community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  moderation_score DECIMAL(3,2),
  moderation_flags TEXT[],
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- community_comments
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- para replies
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- community_reactions
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'hug')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL),
  UNIQUE(user_id, post_id, comment_id, reaction_type)
);

-- -----------------------------------------------------------------------------
-- DOMÍNIO: MODERAÇÃO (3 tabelas)
-- -----------------------------------------------------------------------------

-- moderation_queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  content_text TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source moderation_source NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_safety_score DECIMAL(3,2),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  decision moderation_status,
  decision_reason rejection_reason,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- moderators (Super Mamas)
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'base' CHECK (tier IN ('base', 'senior', 'lead', 'founder')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  compensation_brl DECIMAL(10,2) DEFAULT 300.00,
  stats JSONB DEFAULT '{"total_reviewed": 0, "approved": 0, "rejected": 0}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- moderation_metrics (diário)
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_posts INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,
  human_rejected INTEGER DEFAULT 0,
  avg_queue_latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- DOMÍNIO: ANALYTICS (2 tabelas)
-- -----------------------------------------------------------------------------

-- funnel_events
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

-- breastfeeding_sessions
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
-- PARTE 3: VERIFICAÇÃO
-- =============================================================================

SELECT
  'SCHEMA ALVO' as status,
  COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles', 'user_consents', 'user_sessions',
    'chat_sessions', 'chat_messages', 'crisis_interventions',
    'emotion_logs', 'habits', 'habit_logs',
    'content_items', 'content_categories', 'user_content_interactions',
    'community_posts', 'community_comments', 'community_reactions',
    'moderation_queue', 'moderators', 'moderation_metrics',
    'funnel_events', 'breastfeeding_sessions'
  );

-- Esperado: 20 tabelas
