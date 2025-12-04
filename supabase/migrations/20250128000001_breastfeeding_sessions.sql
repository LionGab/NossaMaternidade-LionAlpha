-- Migration: Breastfeeding Sessions - Rastreador de Amamentação
-- Criado: 2025-01-28
-- Descrição: Tabela para registrar sessões de amamentação

CREATE TABLE IF NOT EXISTS public.breastfeeding_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  side TEXT NOT NULL CHECK (side IN ('left', 'right', 'both')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 120),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_breastfeeding_sessions_user_id ON public.breastfeeding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breastfeeding_sessions_timestamp ON public.breastfeeding_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_breastfeeding_sessions_user_timestamp ON public.breastfeeding_sessions(user_id, timestamp DESC);

-- RLS Policies
ALTER TABLE public.breastfeeding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver suas próprias sessões de amamentação"
  ON public.breastfeeding_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem inserir suas próprias sessões"
  ON public.breastfeeding_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar suas próprias sessões"
  ON public.breastfeeding_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar suas próprias sessões"
  ON public.breastfeeding_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_breastfeeding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER breastfeeding_sessions_updated_at
  BEFORE UPDATE ON public.breastfeeding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_breastfeeding_sessions_updated_at();

