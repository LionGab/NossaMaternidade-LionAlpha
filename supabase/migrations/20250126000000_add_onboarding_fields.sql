-- ============================================
-- Migration: Adicionar campos de onboarding
-- Data: 2025-01-26
-- Descrição: Adiciona campos para o fluxo de onboarding rápido (5-7 perguntas)
-- ============================================

-- 1. Campo display_name (apelido/como quer ser chamada)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Campo life_stage_generic (fase de vida genérica)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS life_stage_generic TEXT CHECK (life_stage_generic IN (
  'pregnant',           -- Estou grávida
  'has_children',       -- Já tenho filho(s)
  'trying',             -- Estou pensando em ser mãe / tentando
  'caregiver',          -- Cuido de alguém (sobrinho, afilhado, etc.)
  'self_care'           -- Tô aqui mais por mim mesma
));

-- 3. Campo main_goals (motivos de entrada - multi-select)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS main_goals JSONB DEFAULT '[]'::jsonb;
-- Array de strings: ['mental_health', 'routine', 'support', 'content', 'sleep', 'curiosity']

-- 4. Campo baseline_emotion (estado emocional base)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS baseline_emotion TEXT CHECK (baseline_emotion IN (
  'bem',        -- Bem, no geral
  'triste',     -- Triste / sensível
  'ansiosa',    -- Ansiosa / acelerada
  'cansada',    -- Muito cansada / esgotada
  'calma'       -- Calma, mas querendo cuidar mais de mim
));

-- 5. Campo first_focus (prioridade nº 1)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_focus TEXT CHECK (first_focus IN (
  'emotional_care',     -- Cuidar melhor de mim emocionalmente
  'organization',       -- Me organizar (rotina, tarefas, vida)
  'reduce_fatigue',     -- Me sentir menos cansada / sobrecarregada
  'community',          -- Me sentir menos sozinha
  'content'             -- Receber conteúdos certos pra minha fase
));

-- 6. Campo preferred_language_tone (estilo de fala da IA)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language_tone TEXT CHECK (preferred_language_tone IN (
  'friendly',           -- Bem acolhedora, tipo amiga
  'direct',             -- Com carinho, mas direta ao ponto
  'mentor'              -- Mais séria e organizada, quase como uma mentora
));

-- 7. Campo notification_opt_in (aceite de notificações)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_opt_in BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.display_name IS 'Apelido/nome de exibição escolhido pela usuária no onboarding';
COMMENT ON COLUMN public.profiles.life_stage_generic IS 'Fase de vida genérica da usuária (grávida, tem filhos, etc.)';
COMMENT ON COLUMN public.profiles.main_goals IS 'Array de objetivos principais da usuária (mental_health, routine, support, etc.)';
COMMENT ON COLUMN public.profiles.baseline_emotion IS 'Estado emocional base capturado no onboarding';
COMMENT ON COLUMN public.profiles.first_focus IS 'Prioridade número 1 da usuária ao entrar no app';
COMMENT ON COLUMN public.profiles.preferred_language_tone IS 'Tom de voz preferido para a IA NathIA';
COMMENT ON COLUMN public.profiles.notification_opt_in IS 'Aceite para receber notificações de lembretes';
