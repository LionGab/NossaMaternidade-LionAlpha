-- =============================================================================
-- Migration: Renomear user_profiles → profiles
-- Data: 2025-01-28
-- Descrição: Alinha nome da tabela com o código do app (ProfileService usa 'profiles')
-- =============================================================================

-- Verificar se a tabela user_profiles existe antes de renomear
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
  ) THEN
    -- Renomear tabela
    ALTER TABLE public.user_profiles RENAME TO profiles;
    
    RAISE NOTICE 'Tabela user_profiles renomeada para profiles';
  ELSE
    RAISE NOTICE 'Tabela user_profiles não existe. Pulando rename.';
  END IF;
END $$;

-- Renomear índices que referenciam user_profiles
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE '%user_profiles%'
  LOOP
    EXECUTE format('ALTER INDEX IF EXISTS %I RENAME TO %I',
      idx_record.indexname,
      replace(idx_record.indexname, 'user_profiles', 'profiles')
    );
  END LOOP;
END $$;

-- Renomear constraints que referenciam user_profiles
DO $$
DECLARE
  con_record RECORD;
BEGIN
  FOR con_record IN
    SELECT conname, conrelid::regclass::text as table_name
    FROM pg_constraint
    WHERE conrelid = 'public.user_profiles'::regclass
      OR confrelid = 'public.user_profiles'::regclass
  LOOP
    -- Constraints são renomeadas automaticamente com a tabela
    -- Mas podemos verificar se há constraints com nomes explícitos
    IF con_record.conname LIKE '%user_profiles%' THEN
      EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
        con_record.table_name,
        con_record.conname,
        replace(con_record.conname, 'user_profiles', 'profiles')
      );
    END IF;
  END LOOP;
END $$;

-- Atualizar foreign keys de outras tabelas que referenciam user_profiles
-- Nota: PostgreSQL renomeia automaticamente FKs quando a tabela referenciada é renomeada
-- Mas precisamos atualizar views e funções que podem ter referências hardcoded

-- Atualizar função handle_new_user se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
  ) THEN
    -- A função já deve estar usando 'profiles' ou será atualizada separadamente
    RAISE NOTICE 'Função handle_new_user encontrada. Verifique se usa o nome correto da tabela.';
  END IF;
END $$;

-- Comentário final
COMMENT ON TABLE public.profiles IS 'Perfis de usuárias do Nossa Maternidade (renomeado de user_profiles em 2025-01-28)';

SELECT 'Migration completa: user_profiles → profiles' as status;

