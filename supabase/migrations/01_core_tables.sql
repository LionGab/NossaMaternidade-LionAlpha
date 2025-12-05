-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 01_core_tables.sql
-- Descrição: Tabelas principais do MVP
-- Tabelas: profiles, community_posts, chat_sessions, chat_messages, habits, habit_logs
-- Ordem: Executar DEPOIS de 00_types.sql
-- =============================================================================

-- =============================================================================
-- TABELA: profiles
-- Descrição: Perfis das usuárias (extensão do auth.users)
-- Relacionamento: 1:1 com auth.users
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  -- Identificador (mesmo ID do auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados de contato
  email TEXT,
  phone TEXT,

  -- Dados pessoais básicos
  name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Localização
  city TEXT,
  state TEXT,

  -- Dados da maternidade
  phase TEXT CHECK (phase IN ('tentante', 'gestacao', 'pos_parto', 'primeira_infancia', 'maternidade')),
  pregnancy_week INTEGER CHECK (pregnancy_week IS NULL OR (pregnancy_week >= 1 AND pregnancy_week <= 42)),
  pregnancy_trimester TEXT CHECK (pregnancy_trimester IN ('1', '2', '3', NULL)),
  due_date DATE,
  baby_birth_date DATE,
  baby_name TEXT,
  baby_age_months INTEGER,
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'unknown', 'prefer_not_say', NULL)),
  motherhood_stage TEXT CHECK (motherhood_stage IN ('trying_to_conceive', 'pregnant', 'postpartum', 'experienced_mother', NULL)),

  -- Estado emocional (cache do último check-in)
  current_emotion TEXT CHECK (current_emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma', NULL)),
  last_emotion_update TIMESTAMPTZ,

  -- Preferências do app
  notification_enabled BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  daily_reminder_time TIME,
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,

  -- Perfil social
  preferred_topics JSONB DEFAULT '[]'::jsonb,
  support_network TEXT CHECK (support_network IN ('family', 'friends', 'alone', 'partner', NULL)),

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phase ON profiles(phase);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE onboarding_completed = FALSE;

-- Trigger updated_at
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

COMMENT ON TABLE profiles IS 'Perfis das usuárias do Nossa Maternidade (extensão do auth.users)';

-- =============================================================================
-- TABELA: community_posts
-- Descrição: Posts da comunidade
-- Relacionamento: N:1 com profiles (author_id)
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Autor
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conteúdo
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,

  -- Categorização
  category TEXT,
  tags TEXT[],

  -- Moderação
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  moderation_score DECIMAL(3,2),
  moderation_flags TEXT[],

  -- Contadores (desnormalizados para performance)
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(published_at DESC) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_posts_pending ON community_posts(created_at DESC) WHERE status = 'pending' AND deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE community_posts IS 'Posts da comunidade criados pelas usuárias';

-- =============================================================================
-- TABELA: chat_sessions
-- Descrição: Sessões/conversas do chat com NathIA
-- Relacionamento: N:1 com profiles (user_id)
-- NOTA: Renomeada de chat_conversations para chat_sessions
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuária
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadados da sessão
  title TEXT DEFAULT 'Nova conversa',
  model TEXT DEFAULT 'gemini-pro',

  -- Análise da sessão (preenchido por IA)
  summary TEXT,
  emotion_detected TEXT,
  topics TEXT[],

  -- Contadores
  message_count INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_active ON chat_sessions(user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_recent ON chat_sessions(updated_at DESC) WHERE deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE chat_sessions IS 'Sessões de chat com a NathIA (assistente IA)';

-- =============================================================================
-- TABELA: chat_messages
-- Descrição: Mensagens dentro de uma sessão de chat
-- Relacionamento: N:1 com chat_sessions (session_id)
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  -- NOTA: Usa conversation_id para manter compatibilidade com código existente
  -- Aponta para chat_sessions.id
  conversation_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conteúdo
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadados (tool calls, tokens usados, etc)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_order ON chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recent ON chat_messages(conversation_id, created_at DESC);

COMMENT ON TABLE chat_messages IS 'Mensagens individuais dentro de uma sessão de chat';
COMMENT ON COLUMN chat_messages.conversation_id IS 'FK para chat_sessions.id (nome mantido para compatibilidade)';

-- =============================================================================
-- TABELA: habits
-- Descrição: Definição de hábitos das usuárias
-- Relacionamento: N:1 com profiles (user_id)
-- =============================================================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuária dona do hábito
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Definição do hábito
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,

  -- Frequência
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Dom, 7=Sáb
  reminder_time TIME,

  -- Estado
  active BOOLEAN DEFAULT TRUE,

  -- Estatísticas (desnormalizadas para performance)
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,

  -- Ordenação customizada
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para habits
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, sort_order) WHERE active = TRUE AND deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE habits IS 'Hábitos definidos pelas usuárias para acompanhamento';

-- =============================================================================
-- TABELA: habit_logs
-- Descrição: Registros de conclusão de hábitos
-- Relacionamento: N:1 com habits (habit_id)
-- =============================================================================

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do registro
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,

  -- Metadados opcionais
  duration_minutes INTEGER,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible', NULL)),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para habit_logs
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, completed_at DESC);

-- Índice para evitar duplicatas no mesmo dia (opcional - comentar se quiser permitir múltiplos logs por dia)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_logs_unique_daily
--   ON habit_logs(habit_id, DATE(completed_at AT TIME ZONE 'America/Sao_Paulo'));

COMMENT ON TABLE habit_logs IS 'Registros de quando um hábito foi completado';

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'community_posts', 'chat_sessions', 'chat_messages', 'habits', 'habit_logs');

  RAISE NOTICE '01_core_tables.sql: % tabelas criadas/verificadas', table_count;
END $$;
