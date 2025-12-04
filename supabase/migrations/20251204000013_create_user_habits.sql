-- =============================================================================
-- Migration 4/6: Create user_habits table
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 3
-- =============================================================================

-- 1. Criar tabela user_habits (hábitos personalizados das usuárias)
CREATE TABLE IF NOT EXISTS public.user_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,

  -- Personalização
  custom_name TEXT,
  custom_target INTEGER DEFAULT 1,
  reminder_time TIME,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: um hábito por usuária
  UNIQUE(user_id, habit_id)
);

-- 2. Comentário da tabela
COMMENT ON TABLE public.user_habits IS 'Hábitos personalizados das usuárias - vincula usuária a hábitos com configurações customizadas';

-- 3. Habilitar RLS
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

-- 4. Criar policies RLS
CREATE POLICY "Usuárias veem seus próprios hábitos"
  ON public.user_habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar seus hábitos"
  ON public.user_habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus hábitos"
  ON public.user_habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus hábitos"
  ON public.user_habits FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Criar indexes
CREATE INDEX idx_user_habits_user_id ON public.user_habits(user_id);
CREATE INDEX idx_user_habits_habit_id ON public.user_habits(habit_id);
CREATE INDEX idx_user_habits_active ON public.user_habits(user_id) WHERE is_active = true;

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_habits_updated_at
  BEFORE UPDATE ON public.user_habits
  FOR EACH ROW EXECUTE FUNCTION public.update_user_habits_updated_at();

-- 7. Atualizar habit_logs para referenciar user_habits (se ainda não fizer)
-- Verificar se a coluna user_habit_id existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'habit_logs'
      AND column_name = 'user_habit_id'
  ) THEN
    -- Adicionar coluna user_habit_id
    ALTER TABLE public.habit_logs ADD COLUMN user_habit_id UUID REFERENCES public.user_habits(id) ON DELETE CASCADE;

    -- Criar index
    CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_id ON public.habit_logs(user_habit_id);
  END IF;
END $$;

-- 8. Verificar se a tabela foi criada
SELECT
  'user_habits' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_habits'
  ) as exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_habits') as policy_count;

-- =============================================================================
-- FIM DA MIGRATION 4
-- =============================================================================
