-- =============================================================================
-- Migration: Criar tabela user_habits
-- Data: 2025-01-28
-- Descrição: Tabela de relacionamento entre usuárias e hábitos (necessária para HabitsService)
-- =============================================================================

-- Criar tabela user_habits
CREATE TABLE IF NOT EXISTS public.user_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  custom_name TEXT,
  custom_target INTEGER NOT NULL DEFAULT 1 CHECK (custom_target > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Garantir que uma usuária não pode ter o mesmo hábito duplicado ativo
  UNIQUE(user_id, habit_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON public.user_habits(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_habits_habit_id ON public.user_habits(habit_id);
CREATE INDEX IF NOT EXISTS idx_user_habits_user_active ON public.user_habits(user_id, is_active, created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_habits_updated_at ON public.user_habits;
CREATE TRIGGER user_habits_updated_at
  BEFORE UPDATE ON public.user_habits
  FOR EACH ROW
  EXECUTE FUNCTION update_user_habits_updated_at();

-- Habilitar RLS
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Usuárias podem ver apenas seus próprios hábitos
DROP POLICY IF EXISTS "Users can view own habits" ON public.user_habits;
CREATE POLICY "Users can view own habits"
  ON public.user_habits FOR SELECT
  USING (auth.uid() = user_id);

-- Usuárias podem criar seus próprios hábitos
DROP POLICY IF EXISTS "Users can create own habits" ON public.user_habits;
CREATE POLICY "Users can create own habits"
  ON public.user_habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuárias podem atualizar seus próprios hábitos
DROP POLICY IF EXISTS "Users can update own habits" ON public.user_habits;
CREATE POLICY "Users can update own habits"
  ON public.user_habits FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuárias podem deletar seus próprios hábitos
DROP POLICY IF EXISTS "Users can delete own habits" ON public.user_habits;
CREATE POLICY "Users can delete own habits"
  ON public.user_habits FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.user_habits IS 'Relacionamento entre usuárias e hábitos disponíveis. Permite customização de nome e meta por usuária.';
COMMENT ON COLUMN public.user_habits.custom_name IS 'Nome customizado do hábito para esta usuária (opcional)';
COMMENT ON COLUMN public.user_habits.custom_target IS 'Meta customizada (ex: beber 2L de água ao invés de 1L)';
COMMENT ON COLUMN public.user_habits.is_active IS 'Se o hábito está ativo para esta usuária (soft delete)';

SELECT 'Migration completa: Tabela user_habits criada' as status;

