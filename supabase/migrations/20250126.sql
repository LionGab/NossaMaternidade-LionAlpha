-- ============================================
-- Migration: Check-in Emocional (Week 1)
-- Data: 2025-01-26
-- Descrição: Tabela para registrar check-ins emocionais diários
-- ============================================

-- Criar tabela check_in_logs
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

-- Habilitar RLS
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Usuárias só podem ver/editar seus próprios check-ins
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

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_check_in_logs_updated_at
  BEFORE UPDATE ON public.check_in_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Como aplicar esta migration no Supabase:
-- ============================================
-- 1. Via Supabase Dashboard:
--    - Acesse seu projeto no Supabase
--    - Vá em "SQL Editor"
--    - Cole este SQL e execute
--
-- 2. Via Supabase CLI:
--    npx supabase db push
--
-- 3. Validar:
--    SELECT * FROM public.check_in_logs LIMIT 1;
-- ============================================
