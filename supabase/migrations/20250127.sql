-- ============================================
-- Migration: Sleep Logs
-- Data: 2025-01-27
-- Descrição: Tabela para registrar horas de sono diárias
-- ============================================

CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Duração do sono em horas (0-12)
  duration_hours NUMERIC(3,1) NOT NULL CHECK (duration_hours >= 0 AND duration_hours <= 12),
  
  -- Data/hora do registro
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Notas opcionais
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuárias veem seus próprios sleep logs"
  ON public.sleep_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar sleep logs"
  ON public.sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus sleep logs"
  ON public.sleep_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus sleep logs"
  ON public.sleep_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_sleep_logs_user_id ON public.sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_logged_at ON public.sleep_logs(user_id, logged_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_sleep_logs_updated_at
  BEFORE UPDATE ON public.sleep_logs
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
--    SELECT * FROM public.sleep_logs LIMIT 1;
-- ============================================

