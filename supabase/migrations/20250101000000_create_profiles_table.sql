-- ============================================
-- Migration: Criar tabela profiles (Base)
-- Data: 2025-01-01 (retroativo)
-- Descricao: Tabela base de perfis de usuarios
-- NOTA: Esta migracao documenta a estrutura base da tabela profiles
--       que ja existe no banco de dados.
-- ============================================

-- Extensao para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funcao helper para updated_at (usada em triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Identificadores
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,

  -- Dados basicos
  name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,

  -- Dados da maternidade
  phase TEXT CHECK (phase IN ('tentante', 'gestacao', 'pos_parto', 'primeira_infancia', 'maternidade')),
  pregnancy_week INTEGER CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
  pregnancy_trimester TEXT CHECK (pregnancy_trimester IN ('1', '2', '3')),
  due_date DATE,
  baby_birth_date DATE,
  baby_name TEXT,
  baby_age_months INTEGER,
  motherhood_stage TEXT CHECK (motherhood_stage IN ('trying_to_conceive', 'pregnant', 'postpartum', 'experienced_mother')),
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'unknown', 'prefer_not_say')),

  -- Estado emocional (cache)
  current_emotion TEXT CHECK (current_emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma')),
  last_emotion_update TIMESTAMP WITH TIME ZONE,

  -- Preferencias
  notification_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT false,
  daily_reminder_time TIME,
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  -- Perfil completo
  bio TEXT,
  city TEXT,
  state TEXT,
  preferred_topics JSONB DEFAULT '[]'::jsonb,
  support_network TEXT CHECK (support_network IN ('family', 'friends', 'alone', 'partner')),

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Usuarios so podem ver/editar seus proprios dados
CREATE POLICY "Usuarios podem ver seu proprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem criar seu perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar seu perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy para perfis publicos (comunidade)
CREATE POLICY "Perfis sao visiveis publicamente para dados basicos"
  ON public.profiles FOR SELECT
  USING (true);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phase ON public.profiles(phase);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente apos signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON TABLE public.profiles IS 'Perfis de usuarios do Nossa Maternidade';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuario (referencia auth.users)';
COMMENT ON COLUMN public.profiles.phase IS 'Fase da maternidade (tentante, gestacao, pos_parto, etc)';
COMMENT ON COLUMN public.profiles.current_emotion IS 'Ultima emocao registrada (cache)';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Se a usuaria completou o onboarding';
