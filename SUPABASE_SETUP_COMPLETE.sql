-- =============================================================================
-- NOSSA MATERNIDADE - SETUP COMPLETO DO SUPABASE
-- =============================================================================
-- 
-- Este script aplica TODAS as migrations necessárias em ordem correta.
-- Execute este arquivo completo no Supabase Dashboard → SQL Editor → New Query
--
-- Ordem de execução:
-- 1. ENUMs e tipos (00_types.sql)
-- 2. Tabelas core (01_core_tables.sql)
-- 3. Reações da comunidade (02_community_reactions.sql)
-- 4. LGPD e consentimentos (03_lgpd_flags_screenings.sql)
-- 5. RLS Policies (05_rls_policies.sql)
--
-- ⚠️ IMPORTANTE: Execute este script em um projeto LIMPO ou faça backup primeiro!
-- =============================================================================

-- =============================================================================
-- PARTE 1: ENUMs e Tipos Customizados
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMs - Crise e Moderação
DO $$ BEGIN
  CREATE TYPE crisis_level AS ENUM (
    'low', 'moderate', 'severe', 'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE crisis_type AS ENUM (
    'suicidal_ideation', 'self_harm', 'postpartum_depression',
    'anxiety_attack', 'overwhelm', 'domestic_violence', 'baby_safety', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intervention_status AS ENUM (
    'detected', 'resources_shown', 'user_acknowledged', 'contacted_cvv',
    'contacted_samu', 'contacted_caps', 'continued_chat', 'left_app',
    'resolved', 'escalated', 'follow_up_pending', 'follow_up_completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM (
    'pending', 'assigned', 'in_review', 'approved', 'rejected',
    'escalated', 'appealed', 'appeal_approved', 'appeal_rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'post', 'comment', 'reply', 'profile_bio', 'profile_photo', 'message'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_source AS ENUM (
    'auto_filter', 'ai_review', 'user_report', 'manual', 'appeal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'spam', 'hate_speech', 'harassment', 'nsfw', 'violence', 'self_harm',
    'medical_misinformation', 'personal_info', 'advertising', 'off_topic', 'duplicate', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUMs - LGPD / Consentimento
DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM (
    'essential', 'ai_processing', 'analytics', 'marketing', 'data_sharing', 'health_data'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM (
    'granted', 'revoked', 'expired', 'pending'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUMs - Analytics / Funil
DO $$ BEGIN
  CREATE TYPE funnel_stage AS ENUM (
    'app_opened', 'onboarding_started', 'onboarding_profile', 'onboarding_baby',
    'onboarding_complete', 'aha_moment_nathia', 'aha_moment_tracker',
    'aha_moment_community', 'first_week_active', 'subscription_viewed',
    'subscription_started', 'churned', 'reactivated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUMs - Screening de Saúde Mental
DO $$ BEGIN
  CREATE TYPE screening_type AS ENUM (
    'epds', 'phq9', 'gad7', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE screening_result AS ENUM (
    'low_risk', 'moderate_risk', 'high_risk', 'inconclusive'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Função helper: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PARTE 2: Tabelas Core (profiles, community_posts, chat_sessions, etc)
-- =============================================================================

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  phase TEXT CHECK (phase IN ('tentante', 'gestacao', 'pos_parto', 'primeira_infancia', 'maternidade')),
  pregnancy_week INTEGER CHECK (pregnancy_week IS NULL OR (pregnancy_week >= 1 AND pregnancy_week <= 42)),
  pregnancy_trimester TEXT CHECK (pregnancy_trimester IN ('1', '2', '3', NULL)),
  due_date DATE,
  baby_birth_date DATE,
  baby_name TEXT,
  baby_age_months INTEGER,
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'unknown', 'prefer_not_say', NULL)),
  motherhood_stage TEXT CHECK (motherhood_stage IN ('trying_to_conceive', 'pregnant', 'postpartum', 'experienced_mother', NULL)),
  current_emotion TEXT CHECK (current_emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma', NULL)),
  last_emotion_update TIMESTAMPTZ,
  notification_enabled BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  daily_reminder_time TIME,
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  preferred_topics JSONB DEFAULT '[]'::jsonb,
  support_network TEXT CHECK (support_network IN ('family', 'friends', 'alone', 'partner', NULL)),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phase ON profiles(phase);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE onboarding_completed = FALSE;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

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

-- Adicionar coluna is_approved para compatibilidade com código existente
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_posts' AND column_name = 'is_approved') THEN
    ALTER TABLE community_posts ADD COLUMN is_approved BOOLEAN GENERATED ALWAYS AS (status = 'approved') STORED;
  END IF;
END $$;

-- Adicionar coluna user_id para compatibilidade (alias de author_id)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_posts' AND column_name = 'user_id') THEN
    ALTER TABLE community_posts ADD COLUMN user_id UUID GENERATED ALWAYS AS (author_id) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(published_at DESC) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_posts_pending ON community_posts(created_at DESC) WHERE status = 'pending' AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  emotion TEXT,
  crisis_detected BOOLEAN DEFAULT FALSE,
  crisis_level crisis_level,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_recent ON chat_sessions(user_id, created_at DESC) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'nathia', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  audio_duration INTEGER,
  tts_audio_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  color TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_value INTEGER,
  unit TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(user_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value INTEGER,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(user_id, logged_at DESC);

-- =============================================================================
-- PARTE 3: Tabelas de Reações da Comunidade
-- =============================================================================

-- community_comments
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_comments_post_order ON community_comments(post_id, created_at ASC) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_comments_pending ON community_comments(created_at DESC) WHERE status = 'pending' AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_community_comments_updated_at ON community_comments;
CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- community_likes (TABELA CRÍTICA QUE ESTÁ FALTANDO!)
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_likes_comment ON community_likes(comment_id) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_likes_unique_post ON community_likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_likes_unique_comment ON community_likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- post_reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'hug', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_type ON post_reactions(post_id, reaction_type);

-- content_favorites
CREATE TABLE IF NOT EXISTS content_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'video', 'tip')),
  content_id UUID NOT NULL,
  content_title TEXT,
  content_preview TEXT,
  content_image_url TEXT,
  folder TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_favorites_user ON content_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_content_favorites_user_type ON content_favorites(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_favorites_content ON content_favorites(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_favorites_folder ON content_favorites(user_id, folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_favorites_recent ON content_favorites(user_id, created_at DESC);

-- Triggers para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_like_count ON community_likes;
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_like_count ON community_likes;
CREATE TRIGGER trigger_update_comment_like_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NULL AND NEW.deleted_at IS NULL THEN
      UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE community_comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    IF OLD.parent_id IS NULL THEN
      UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE community_comments SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.parent_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON community_comments;
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- =============================================================================
-- PARTE 4: LGPD e Consentimentos
-- =============================================================================

-- consent_terms_versions
CREATE TABLE IF NOT EXISTS consent_terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL,
  consent_type consent_type NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_text TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  is_breaking BOOLEAN DEFAULT FALSE,
  effective_from TIMESTAMPTZ NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(consent_type, version)
);

CREATE INDEX IF NOT EXISTS idx_terms_current ON consent_terms_versions(consent_type, is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_terms_effective ON consent_terms_versions(effective_from DESC);

-- user_consents
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES consent_terms_versions(id),
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'granted',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  device_id VARCHAR(255),
  collection_method VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  previous_consent_id UUID REFERENCES user_consents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_type ON user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consents_status ON user_consents(user_id, status) WHERE status = 'granted';
CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_active_unique ON user_consents(user_id, consent_type) WHERE status = 'granted';

-- user_feature_flags
CREATE TABLE IF NOT EXISTS user_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  flag_value JSONB NOT NULL DEFAULT 'true'::jsonb,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'experiment', 'rollout', 'beta', 'override')),
  experiment_id TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flag_name)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_user ON user_feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag ON user_feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_user_enabled ON user_feature_flags(user_id) WHERE enabled = TRUE AND (expires_at IS NULL OR expires_at > NOW());

DROP TRIGGER IF EXISTS update_user_feature_flags_updated_at ON user_feature_flags;
CREATE TRIGGER update_user_feature_flags_updated_at
  BEFORE UPDATE ON user_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- postpartum_screenings
CREATE TABLE IF NOT EXISTS postpartum_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screening_type screening_type NOT NULL,
  responses JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL,
  result screening_result NOT NULL,
  risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5),
  interpretation TEXT,
  critical_items INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  requires_followup BOOLEAN DEFAULT FALSE,
  followup_scheduled_at TIMESTAMPTZ,
  followup_completed_at TIMESTAMPTZ,
  administered_by TEXT DEFAULT 'self' CHECK (administered_by IN ('self', 'healthcare_provider', 'nathia')),
  session_id UUID,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_screenings_user ON postpartum_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_user_type ON postpartum_screenings(user_id, screening_type);
CREATE INDEX IF NOT EXISTS idx_screenings_result ON postpartum_screenings(result) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenings_high_risk ON postpartum_screenings(completed_at DESC) WHERE result IN ('moderate_risk', 'high_risk') AND deleted_at IS NULL;

-- Funções auxiliares LGPD
CREATE OR REPLACE FUNCTION get_user_active_consents(p_user_id UUID)
RETURNS TABLE (
  consent_type consent_type,
  status consent_status,
  granted_at TIMESTAMPTZ,
  terms_version VARCHAR(20),
  is_current_terms BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.consent_type,
    uc.status,
    uc.granted_at,
    ctv.version AS terms_version,
    ctv.is_current AS is_current_terms
  FROM user_consents uc
  JOIN consent_terms_versions ctv ON uc.terms_version_id = ctv.id
  WHERE uc.user_id = p_user_id
    AND uc.status = 'granted'
  ORDER BY uc.consent_type;
END;
$$;

CREATE OR REPLACE FUNCTION has_active_consent(p_user_id UUID, p_consent_type consent_type)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_consent BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_consents
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND status = 'granted'
  ) INTO v_has_consent;
  RETURN v_has_consent;
END;
$$;

-- Inserir versões iniciais dos termos
INSERT INTO consent_terms_versions (
  version, consent_type, title, summary, full_text,
  is_current, is_breaking, effective_from, content_hash
) VALUES
(
  '1.0.0', 'essential',
  'Termos Essenciais',
  'Permissões mínimas para funcionamento do app: armazenamento local de dados, sincronização com nuvem.',
  'Ao usar o Nossa Maternidade, você concorda com o armazenamento seguro dos seus dados em nossos servidores para sincronização entre dispositivos. Estes dados incluem seu perfil, preferências e atividades no app. Você pode solicitar a exclusão dos seus dados a qualquer momento através das configurações do app ou entrando em contato conosco.',
  TRUE, FALSE, NOW(),
  encode(digest('essential_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
(
  '1.0.0', 'ai_processing',
  'Processamento por IA (NathIA)',
  'Suas mensagens serão processadas pela NathIA para fornecer respostas personalizadas. Dados são anonimizados após 30 dias.',
  'Para oferecer suporte personalizado, suas mensagens são processadas por nossa assistente virtual NathIA, baseada em inteligência artificial. A NathIA analisa suas mensagens para entender seu contexto e fornecer respostas relevantes. Suas conversas são armazenadas por 30 dias para continuidade do atendimento, após o qual são anonimizadas. Você pode solicitar a exclusão imediata através das configurações.',
  TRUE, FALSE, NOW(),
  encode(digest('ai_processing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
(
  '1.0.0', 'analytics',
  'Analytics e Melhorias',
  'Coletamos dados de uso anonimizados para melhorar o app. Nenhum dado pessoal identificável é compartilhado.',
  'Para melhorar continuamente o Nossa Maternidade, coletamos métricas de uso anonimizadas como: telas visitadas, tempo de uso, funcionalidades mais utilizadas e padrões gerais de navegação. Estes dados são agregados e não permitem identificar usuárias individuais. Usamos estas informações exclusivamente para melhorar a experiência do app.',
  TRUE, FALSE, NOW(),
  encode(digest('analytics_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
(
  '1.0.0', 'marketing',
  'Comunicações',
  'Receba dicas, novidades e conteúdo personalizado por email ou push. Pode desativar a qualquer momento.',
  'Gostaríamos de enviar comunicações personalizadas sobre sua jornada maternal, incluindo: dicas baseadas na fase do seu bebê, novidades do app, conteúdos educativos e ofertas especiais. As comunicações são enviadas por email e/ou notificações push. Você pode cancelar a qualquer momento nas configurações do app ou clicando no link de descadastro nos emails.',
  TRUE, FALSE, NOW(),
  encode(digest('marketing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
(
  '1.0.0', 'health_data',
  'Dados de Saúde',
  'Dados sensíveis de saúde (sintomas, humor, amamentação) são protegidos com criptografia adicional. LGPD Art. 11.',
  'Seus dados de saúde são considerados dados sensíveis pela LGPD (Art. 11) e recebem proteções extras: são criptografados em trânsito e em repouso, acessíveis apenas por você e pela NathIA para fornecer suporte, nunca compartilhados com terceiros sem seu consentimento explícito, e podem ser excluídos permanentemente a qualquer momento. Estes dados incluem: registros de humor, sintomas, amamentação, sono do bebê e resultados de questionários de saúde mental.',
  TRUE, FALSE, NOW(),
  encode(digest('health_data_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
(
  '1.0.0', 'data_sharing',
  'Compartilhamento de Dados',
  'Permite compartilhar dados anonimizados para pesquisas sobre saúde materna. Totalmente opcional.',
  'Ao aceitar este consentimento, você permite que dados completamente anonimizados do seu uso do app sejam utilizados em pesquisas acadêmicas sobre saúde materna. Os dados compartilhados nunca incluem informações que possam identificar você. Esta participação é totalmente voluntária e não afeta o funcionamento do app. Você pode revogar este consentimento a qualquer momento.',
  TRUE, FALSE, NOW(),
  encode(digest('data_sharing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
)
ON CONFLICT (consent_type, version) DO NOTHING;

-- =============================================================================
-- PARTE 5: RLS Policies (Row Level Security)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
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

-- Função helper: verificar se é moderador
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

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles for community" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles for community"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- community_posts
DROP POLICY IF EXISTS "Anyone can view approved posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Service role full access community_posts" ON community_posts;

CREATE POLICY "Anyone can view approved posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Service role full access community_posts"
  ON community_posts FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- community_likes
DROP POLICY IF EXISTS "Users can view all likes" ON community_likes;
DROP POLICY IF EXISTS "Users can create own likes" ON community_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON community_likes;
DROP POLICY IF EXISTS "Service role full access community_likes" ON community_likes;

CREATE POLICY "Users can view all likes"
  ON community_likes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can create own likes"
  ON community_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON community_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access community_likes"
  ON community_likes FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- community_comments
DROP POLICY IF EXISTS "Users can view approved comments" ON community_comments;
DROP POLICY IF EXISTS "Users can create comments" ON community_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON community_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON community_comments;
DROP POLICY IF EXISTS "Service role full access community_comments" ON community_comments;

CREATE POLICY "Users can view approved comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Users can create comments"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON community_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON community_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Service role full access community_comments"
  ON community_comments FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- chat_sessions
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

-- chat_messages
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

-- user_consents
DROP POLICY IF EXISTS "Users can view own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can create own consents" ON user_consents;
DROP POLICY IF EXISTS "Service role full access user_consents" ON user_consents;

CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access user_consents"
  ON user_consents FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- consent_terms_versions (público para leitura)
DROP POLICY IF EXISTS "Anyone can view consent terms" ON consent_terms_versions;
DROP POLICY IF EXISTS "Service role full access consent_terms_versions" ON consent_terms_versions;

CREATE POLICY "Anyone can view consent terms"
  ON consent_terms_versions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Service role full access consent_terms_versions"
  ON consent_terms_versions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
  enum_count INTEGER;
BEGIN
  -- Verificar tabelas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'profiles', 'community_posts', 'chat_sessions', 'chat_messages',
      'habits', 'habit_logs', 'community_comments', 'community_likes',
      'post_reactions', 'content_favorites', 'consent_terms_versions',
      'user_consents', 'user_feature_flags', 'postpartum_screenings'
    );

  -- Verificar ENUMs
  SELECT COUNT(*) INTO enum_count
  FROM pg_type
  WHERE typname IN (
    'crisis_level', 'crisis_type', 'intervention_status',
    'moderation_status', 'content_type', 'moderation_source', 'rejection_reason',
    'consent_type', 'consent_status', 'funnel_stage',
    'screening_type', 'screening_result'
  );

  RAISE NOTICE '✅ Setup completo!';
  RAISE NOTICE '   Tabelas criadas: %', table_count;
  RAISE NOTICE '   ENUMs criados: %', enum_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Banco de dados configurado com sucesso!';
  RAISE NOTICE '   Agora você pode testar o app novamente.';
END $$;

