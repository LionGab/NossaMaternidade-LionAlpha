-- =============================================================================
-- Migration 1/6: Rename user_profiles → profiles
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- =============================================================================

-- 1. Renomear a tabela
ALTER TABLE IF EXISTS public.user_profiles RENAME TO profiles;

-- 2. Renomear constraints (se existirem com nome hardcoded)
-- PostgreSQL automaticamente atualiza referências, mas nomes de constraints
-- podem precisar ser atualizados para consistência

-- Verificar e renomear primary key constraint se necessário
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_pkey'
  ) THEN
    ALTER TABLE profiles RENAME CONSTRAINT user_profiles_pkey TO profiles_pkey;
  END IF;
END $$;

-- 3. Renomear indexes para consistência
DO $$
BEGIN
  -- Index de email
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_profiles_email_idx') THEN
    ALTER INDEX user_profiles_email_idx RENAME TO profiles_email_idx;
  END IF;

  -- Index de user_type
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_profiles_user_type_idx') THEN
    ALTER INDEX user_profiles_user_type_idx RENAME TO profiles_user_type_idx;
  END IF;

  -- Index de subscription_tier
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_profiles_subscription_tier_idx') THEN
    ALTER INDEX user_profiles_subscription_tier_idx RENAME TO profiles_subscription_tier_idx;
  END IF;
END $$;

-- 4. Atualizar comentário da tabela
COMMENT ON TABLE public.profiles IS 'Perfis de usuárias - extensão do auth.users (renomeado de user_profiles)';

-- 5. Verificar se a renomeação foi bem sucedida
SELECT
  'profiles' as expected_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) as exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) as old_removed;

-- =============================================================================
-- NOTA: As RLS policies serão atualizadas na migration 6
-- =============================================================================
