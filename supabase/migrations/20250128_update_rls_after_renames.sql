-- =============================================================================
-- Migration: Atualizar RLS Policies após renames de tabelas
-- Data: 2025-01-28
-- Descrição: Atualiza policies RLS e funções que podem referenciar nomes antigos de tabelas
-- =============================================================================

-- =============================================================================
-- PARTE 1: Atualizar RLS Policies para profiles (se user_profiles foi renomeado)
-- =============================================================================

-- Verificar se tabela profiles existe e atualizar policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    -- Garantir que RLS está habilitado
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Recriar policies com nomes atualizados (se necessário)
    -- Nota: Policies existentes devem continuar funcionando, mas vamos garantir que estão corretas
    
    -- Policy: Usuárias podem ver seu próprio perfil
    DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.profiles;
    CREATE POLICY "Usuarios podem ver seu proprio perfil"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
    
    -- Policy: Perfis são visíveis publicamente para dados básicos (comunidade)
    DROP POLICY IF EXISTS "Perfis sao visiveis publicamente para dados basicos" ON public.profiles;
    CREATE POLICY "Perfis sao visiveis publicamente para dados basicos"
      ON public.profiles FOR SELECT
      USING (true);
    
    -- Policy: Usuárias podem criar seu perfil
    DROP POLICY IF EXISTS "Usuarios podem criar seu perfil" ON public.profiles;
    CREATE POLICY "Usuarios podem criar seu perfil"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
    
    -- Policy: Usuárias podem atualizar seu perfil
    DROP POLICY IF EXISTS "Usuarios podem atualizar seu perfil" ON public.profiles;
    CREATE POLICY "Usuarios podem atualizar seu perfil"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
    
    RAISE NOTICE 'RLS policies atualizadas para tabela profiles';
  END IF;
END $$;

-- =============================================================================
-- PARTE 2: Atualizar RLS Policies para community_posts (se posts foi renomeado)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'community_posts'
  ) THEN
    -- Garantir que RLS está habilitado
    ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Posts aprovados são públicos
    DROP POLICY IF EXISTS "Public can read approved posts" ON public.community_posts;
    CREATE POLICY "Public can read approved posts"
      ON public.community_posts FOR SELECT
      USING (is_approved = TRUE AND deleted_at IS NULL);
    
    -- Policy: Usuárias autenticadas podem criar posts
    DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
    CREATE POLICY "Authenticated users can create posts"
      ON public.community_posts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Policy: Usuárias podem atualizar seus próprios posts
    DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
    CREATE POLICY "Users can update own posts"
      ON public.community_posts FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Policy: Usuárias podem deletar seus próprios posts
    DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
    CREATE POLICY "Users can delete own posts"
      ON public.community_posts FOR DELETE
      USING (auth.uid() = user_id);
    
    -- Policy: Moderadores podem atualizar qualquer post
    DROP POLICY IF EXISTS "Moderators can update posts" ON public.community_posts;
    CREATE POLICY "Moderators can update posts"
      ON public.community_posts FOR UPDATE
      USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));
    
    RAISE NOTICE 'RLS policies atualizadas para tabela community_posts';
  END IF;
END $$;

-- =============================================================================
-- PARTE 3: Atualizar RLS Policies para user_content_interactions
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_content_interactions'
  ) THEN
    -- Garantir que RLS está habilitado
    ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Usuárias podem ver apenas suas próprias interações
    DROP POLICY IF EXISTS "Users can view own interactions" ON public.user_content_interactions;
    CREATE POLICY "Users can view own interactions"
      ON public.user_content_interactions FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Policy: Usuárias podem criar suas próprias interações
    DROP POLICY IF EXISTS "Users can create own interactions" ON public.user_content_interactions;
    CREATE POLICY "Users can create own interactions"
      ON public.user_content_interactions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Policy: Usuárias podem atualizar suas próprias interações
    DROP POLICY IF EXISTS "Users can update own interactions" ON public.user_content_interactions;
    CREATE POLICY "Users can update own interactions"
      ON public.user_content_interactions FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Policy: Usuárias podem deletar suas próprias interações
    DROP POLICY IF EXISTS "Users can delete own interactions" ON public.user_content_interactions;
    CREATE POLICY "Users can delete own interactions"
      ON public.user_content_interactions FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies atualizadas para tabela user_content_interactions';
  END IF;
END $$;

-- =============================================================================
-- PARTE 4: Atualizar função handle_new_user para usar 'profiles' ao invés de 'user_profiles'
-- =============================================================================

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

-- =============================================================================
-- PARTE 5: Verificar e atualizar views que podem referenciar tabelas renomeadas
-- =============================================================================

-- Listar views que podem precisar de atualização
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT table_name, view_definition
    FROM information_schema.views
    WHERE table_schema = 'public'
  LOOP
    -- Verificar se a view referencia tabelas renomeadas
    IF view_record.view_definition LIKE '%user_profiles%' THEN
      RAISE NOTICE 'View % pode precisar atualização (referencia user_profiles)', view_record.table_name;
    END IF;
    IF view_record.view_definition LIKE '%posts%' AND view_record.view_definition NOT LIKE '%community_posts%' THEN
      RAISE NOTICE 'View % pode precisar atualização (referencia posts sem community_)', view_record.table_name;
    END IF;
    IF view_record.view_definition LIKE '%content_favorites%' THEN
      RAISE NOTICE 'View % pode precisar atualização (referencia content_favorites)', view_record.table_name;
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- PARTE 6: Verificar e atualizar funções RPC que podem referenciar tabelas renomeadas
-- =============================================================================

-- Listar funções que podem precisar de atualização
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
  LOOP
    -- Verificar se a função referencia tabelas renomeadas
    IF func_record.routine_definition LIKE '%user_profiles%' THEN
      RAISE NOTICE 'Função % pode precisar atualização (referencia user_profiles)', func_record.routine_name;
    END IF;
    IF func_record.routine_definition LIKE '%posts%' AND func_record.routine_definition NOT LIKE '%community_posts%' THEN
      RAISE NOTICE 'Função % pode precisar atualização (referencia posts sem community_)', func_record.routine_name;
    END IF;
    IF func_record.routine_definition LIKE '%content_favorites%' THEN
      RAISE NOTICE 'Função % pode precisar atualização (referencia content_favorites)', func_record.routine_name;
    END IF;
  END LOOP;
END $$;

SELECT 'Migration completa: RLS policies e funções atualizadas após renames' as status;

