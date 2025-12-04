-- ============================================
-- NOSSA MATERNIDADE - DATABASE SCHEMA
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles
-- Perfis de usuárias (1:1 com auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,

  -- Dados do onboarding
  motherhood_stage TEXT CHECK (motherhood_stage IN (
    'trying_to_conceive',
    'pregnant',
    'postpartum',
    'experienced_mother'
  )),
  pregnancy_week INTEGER,
  baby_birth_date DATE,
  baby_name TEXT,
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'unknown', 'prefer_not_say')),

  -- Preferências e necessidades
  emotions JSONB DEFAULT '[]'::jsonb, -- Array de emoções: ['anxiety', 'joy', 'fear', etc]
  needs JSONB DEFAULT '[]'::jsonb, -- Array de necessidades: ['sleep_support', 'nutrition', etc]
  interests JSONB DEFAULT '[]'::jsonb, -- Array de interesses

  -- Configurações
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuárias podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Perfis são criados automaticamente"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TABELA: chat_conversations
-- Conversas do chat com IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  model TEXT DEFAULT 'gemini-pro', -- gemini-pro, claude, gpt-4, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: chat_messages
-- Mensagens individuais do chat
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Informações extras como tokens, tempo de resposta, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para chat
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias veem suas próprias conversas"
  ON public.chat_conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias veem mensagens de suas conversas"
  ON public.chat_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- TABELA: content_items
-- Conteúdos do feed (vídeos, áudios, artigos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'article', 'reels')),
  category TEXT NOT NULL, -- 'sleep', 'nutrition', 'mental_health', etc

  -- URLs de mídia (armazenados no Supabase Storage)
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,

  -- Metadata
  duration INTEGER, -- Em segundos
  author_name TEXT,
  author_avatar_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Controle de acesso
  is_premium BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,

  -- Estatísticas
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: user_content_interactions
-- Interações de usuárias com conteúdos
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_content_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,

  -- Tipos de interação
  is_liked BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,

  -- Progresso (para vídeos/áudios)
  progress_seconds INTEGER DEFAULT 0,

  -- Timestamps
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: uma interação por usuária por conteúdo
  UNIQUE(user_id, content_id)
);

-- RLS Policies para conteúdo
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conteúdos publicados são visíveis para todos"
  ON public.content_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Usuárias gerenciam suas próprias interações"
  ON public.user_content_interactions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: habits
-- Hábitos disponíveis no app
-- ============================================
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Nome do ícone (lucide-react-native)
  color TEXT, -- Cor hex
  category TEXT, -- 'wellness', 'nutrition', 'exercise', etc
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: user_habits
-- Hábitos das usuárias
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,

  -- Configurações personalizadas
  custom_name TEXT,
  custom_target INTEGER DEFAULT 1, -- Meta diária/semanal

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, habit_id)
);

-- ============================================
-- TABELA: habit_logs
-- Registro de conclusão de hábitos
-- ============================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_habit_id UUID REFERENCES public.user_habits(id) ON DELETE CASCADE NOT NULL,

  completed_at DATE NOT NULL,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Um log por dia por hábito
  UNIQUE(user_habit_id, completed_at)
);

-- RLS Policies para hábitos
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hábitos são visíveis para todos"
  ON public.habits FOR SELECT
  USING (true);

CREATE POLICY "Usuárias gerenciam seus próprios hábitos"
  ON public.user_habits FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias gerenciam seus próprios logs"
  ON public.habit_logs FOR ALL
  USING (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- TABELA: community_posts
-- Posts da comunidade
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,
  image_url TEXT,

  -- Categorias/tags
  tags JSONB DEFAULT '[]'::jsonb,

  -- Estatísticas
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Moderação
  is_reported BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: community_comments
-- Comentários em posts da comunidade
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,

  -- Estatísticas
  likes_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: community_likes
-- Curtidas em posts e comentários
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Pode ser like em post ou comentário
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Uma curtida por item por usuária
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),

  -- Deve ter UM dos dois
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- RLS Policies para comunidade
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts aprovados são visíveis para todos"
  ON public.community_posts FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Usuárias podem criar posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem editar seus próprios posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Comentários são visíveis para todos"
  ON public.community_comments FOR SELECT
  USING (true);

CREATE POLICY "Usuárias podem comentar"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias gerenciam suas curtidas"
  ON public.community_likes FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: baby_milestones
-- Marcos de desenvolvimento do bebê
-- ============================================
CREATE TABLE IF NOT EXISTS public.baby_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('motor', 'cognitivo', 'linguagem', 'social', 'sensorial')),

  age_months INTEGER NOT NULL, -- Idade típica em meses
  tips JSONB DEFAULT '[]'::jsonb, -- Array de dicas

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: user_baby_milestones
-- Progresso dos marcos para cada bebê
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_baby_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES public.baby_milestones(id) ON DELETE CASCADE NOT NULL,

  is_completed BOOLEAN DEFAULT false,
  completed_at DATE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, milestone_id)
);

-- RLS Policies para milestones
ALTER TABLE public.baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_baby_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Milestones são visíveis para todos"
  ON public.baby_milestones FOR SELECT
  USING (true);

CREATE POLICY "Usuárias gerenciam progresso de seus bebês"
  ON public.user_baby_milestones FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_interactions_updated_at BEFORE UPDATE ON public.user_content_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_baby_milestones_updated_at BEFORE UPDATE ON public.user_baby_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Criar perfil automaticamente ao criar usuária
-- ============================================
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
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÍNDICES para melhor performance
-- ============================================

-- Índices para chat
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Índices para conteúdo
CREATE INDEX idx_content_items_type ON public.content_items(type);
CREATE INDEX idx_content_items_category ON public.content_items(category);
CREATE INDEX idx_content_items_published ON public.content_items(is_published, published_at);
CREATE INDEX idx_user_content_interactions_user_id ON public.user_content_interactions(user_id);

-- Índices para hábitos
CREATE INDEX idx_user_habits_user_id ON public.user_habits(user_id);
CREATE INDEX idx_habit_logs_user_habit_id ON public.habit_logs(user_habit_id);
CREATE INDEX idx_habit_logs_completed_at ON public.habit_logs(completed_at);

-- Índices para comunidade
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX idx_community_likes_comment_id ON public.community_likes(comment_id);

-- Índices para milestones
CREATE INDEX idx_baby_milestones_age_months ON public.baby_milestones(age_months);
CREATE INDEX idx_user_baby_milestones_user_id ON public.user_baby_milestones(user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Bucket para avatares de usuárias
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para conteúdos (vídeos, áudios, imagens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para posts da comunidade
INSERT INTO storage.buckets (id, name, public)
VALUES ('community', 'community', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuárias podem fazer upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Conteúdos são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content');

CREATE POLICY "Posts da comunidade são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community');

CREATE POLICY "Usuárias podem fazer upload em posts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community' AND auth.role() = 'authenticated');

-- ============================================
-- TABELA: check_in_logs
-- Registro diário de check-in emocional
-- ============================================
CREATE TABLE IF NOT EXISTS public.check_in_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Emoção registrada (5 opções fixas do EmotionalPrompt)
  emotion TEXT NOT NULL CHECK (emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma')),

  -- Notas opcionais da usuária
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para check-in logs
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias veem seus próprios check-ins"
  ON public.check_in_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar check-ins"
  ON public.check_in_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus check-ins"
  ON public.check_in_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus check-ins"
  ON public.check_in_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_check_in_logs_user_id ON public.check_in_logs(user_id);
CREATE INDEX idx_check_in_logs_created_at ON public.check_in_logs(user_id, created_at DESC);
CREATE INDEX idx_check_in_logs_emotion ON public.check_in_logs(emotion);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_check_in_logs_updated_at BEFORE UPDATE ON public.check_in_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
