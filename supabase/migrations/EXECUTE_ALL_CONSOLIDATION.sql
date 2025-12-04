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
-- =============================================================================
-- Migration 2/6: Rename posts → community_posts
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 1
-- =============================================================================

-- 1. Renomear a tabela
ALTER TABLE IF EXISTS public.posts RENAME TO community_posts;

-- 2. Renomear constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_pkey'
  ) THEN
    ALTER TABLE community_posts RENAME CONSTRAINT posts_pkey TO community_posts_pkey;
  END IF;

  -- Foreign key para user_id
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE community_posts RENAME CONSTRAINT posts_user_id_fkey TO community_posts_user_id_fkey;
  END IF;
END $$;

-- 3. Renomear indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'posts_user_id_idx') THEN
    ALTER INDEX posts_user_id_idx RENAME TO community_posts_user_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'posts_created_at_idx') THEN
    ALTER INDEX posts_created_at_idx RENAME TO community_posts_created_at_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_id') THEN
    ALTER INDEX idx_posts_user_id RENAME TO idx_community_posts_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_created_at') THEN
    ALTER INDEX idx_posts_created_at RENAME TO idx_community_posts_created_at;
  END IF;
END $$;

-- 4. Atualizar triggers que referenciam a tabela antiga
-- Primeiro, dropar triggers com referência ao nome antigo
DROP TRIGGER IF EXISTS increment_post_likes ON public.post_reactions;
DROP TRIGGER IF EXISTS decrement_post_likes ON public.post_reactions;

-- 5. Recriar triggers com referência ao novo nome
CREATE OR REPLACE FUNCTION public.increment_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recriar triggers
CREATE TRIGGER increment_community_post_likes
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.increment_community_post_likes_count();

CREATE TRIGGER decrement_community_post_likes
  AFTER DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.decrement_community_post_likes_count();

-- 6. Atualizar foreign keys em outras tabelas que referenciam posts
-- community_comments.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_comments_post_id_fkey'
  ) THEN
    -- FK já existe com nome correto, não precisa fazer nada
    NULL;
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'post_comments_post_id_fkey'
  ) THEN
    -- Dropar e recriar com novo nome
    ALTER TABLE community_comments DROP CONSTRAINT post_comments_post_id_fkey;
    ALTER TABLE community_comments
      ADD CONSTRAINT community_comments_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- community_likes.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_likes_post_id_fkey'
  ) THEN
    -- FK já aponta para tabela correta (PostgreSQL atualiza automaticamente)
    NULL;
  END IF;
END $$;

-- post_reactions.post_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'post_reactions_post_id_fkey'
  ) THEN
    -- Dropar e recriar apontando para community_posts
    ALTER TABLE post_reactions DROP CONSTRAINT post_reactions_post_id_fkey;
    ALTER TABLE post_reactions
      ADD CONSTRAINT post_reactions_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Atualizar comentário da tabela
COMMENT ON TABLE public.community_posts IS 'Posts da comunidade MãesValentes (renomeado de posts)';

-- 8. Verificar se a renomeação foi bem sucedida
SELECT
  'community_posts' as expected_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'community_posts'
  ) as exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'posts'
  ) as old_removed;

-- =============================================================================
-- NOTA: As RLS policies serão atualizadas na migration 6
-- =============================================================================
-- =============================================================================
-- Migration 3/6: Rename content_favorites → user_content_interactions
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 2
-- =============================================================================

-- 1. Renomear a tabela
ALTER TABLE IF EXISTS public.content_favorites RENAME TO user_content_interactions;

-- 2. Adicionar colunas que o código espera (que content_favorites não tinha)
ALTER TABLE public.user_content_interactions
  ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT true, -- favoritos existentes = saved
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Renomear constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_pkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_pkey TO user_content_interactions_pkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_user_id_fkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_user_id_fkey TO user_content_interactions_user_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_content_id_fkey'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_content_id_fkey TO user_content_interactions_content_id_fkey;
  END IF;

  -- Unique constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_favorites_user_id_content_id_key'
  ) THEN
    ALTER TABLE user_content_interactions RENAME CONSTRAINT content_favorites_user_id_content_id_key TO user_content_interactions_user_id_content_id_key;
  END IF;
END $$;

-- 4. Renomear indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'content_favorites_user_id_idx') THEN
    ALTER INDEX content_favorites_user_id_idx RENAME TO user_content_interactions_user_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'content_favorites_content_id_idx') THEN
    ALTER INDEX content_favorites_content_id_idx RENAME TO user_content_interactions_content_id_idx;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_favorites_user_id') THEN
    ALTER INDEX idx_content_favorites_user_id RENAME TO idx_user_content_interactions_user_id;
  END IF;
END $$;

-- 5. Criar novos indexes úteis
CREATE INDEX IF NOT EXISTS idx_user_content_interactions_user_content
  ON public.user_content_interactions(user_id, content_id);

CREATE INDEX IF NOT EXISTS idx_user_content_interactions_liked
  ON public.user_content_interactions(user_id) WHERE is_liked = true;

CREATE INDEX IF NOT EXISTS idx_user_content_interactions_saved
  ON public.user_content_interactions(user_id) WHERE is_saved = true;

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_content_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_content_interactions_updated_at ON public.user_content_interactions;
CREATE TRIGGER update_user_content_interactions_updated_at
  BEFORE UPDATE ON public.user_content_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_content_interactions_updated_at();

-- 7. Atualizar comentário da tabela
COMMENT ON TABLE public.user_content_interactions IS 'Interações de usuárias com conteúdos - likes, saves, progresso (renomeado de content_favorites)';

-- 8. Verificar se a renomeação foi bem sucedida
SELECT
  'user_content_interactions' as expected_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_content_interactions'
  ) as exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'content_favorites'
  ) as old_removed;

-- =============================================================================
-- NOTA: As RLS policies serão atualizadas na migration 6
-- =============================================================================
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
-- =============================================================================
-- Migration 5/6: Create content_items table
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 4
-- =============================================================================

-- 1. Criar tabela content_items (conteúdos do feed MundoNath)
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informações básicas
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'article', 'reels')),
  category TEXT NOT NULL,

  -- URLs de mídia
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,

  -- Metadata
  duration INTEGER, -- Em segundos
  author_name TEXT,
  author_avatar_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Controle de acesso
  is_premium BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,

  -- Estatísticas
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Comentário da tabela
COMMENT ON TABLE public.content_items IS 'Conteúdos do feed MundoNath - vídeos, áudios, artigos, reels';

-- 3. Habilitar RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- 4. Criar policies RLS
-- Conteúdos publicados são visíveis para todos os usuários autenticados
CREATE POLICY "Conteúdos publicados são visíveis"
  ON public.content_items FOR SELECT
  USING (is_published = true);

-- Apenas admins podem inserir/atualizar/deletar (via service role)
-- Por enquanto, não criamos policies de escrita para usuários normais

-- 5. Criar indexes
CREATE INDEX idx_content_items_type ON public.content_items(type);
CREATE INDEX idx_content_items_category ON public.content_items(category);
CREATE INDEX idx_content_items_published ON public.content_items(is_published, published_at DESC);
CREATE INDEX idx_content_items_premium ON public.content_items(is_premium);
CREATE INDEX idx_content_items_tags ON public.content_items USING gin(tags);

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_content_items_updated_at();

-- 7. Atualizar user_content_interactions para referenciar content_items
-- Primeiro verificar se já existe a FK correta
DO $$
BEGIN
  -- Verificar se a FK existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_content_interactions_content_id_fkey'
  ) THEN
    -- Criar a FK
    ALTER TABLE public.user_content_interactions
      ADD CONSTRAINT user_content_interactions_content_id_fkey
      FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. Inserir alguns conteúdos de exemplo para teste
INSERT INTO public.content_items (title, description, type, category, is_published, published_at, tags)
VALUES
  ('Bem-vinda ao MundoNath', 'Conheça nossa plataforma de apoio à maternidade', 'video', 'welcome', true, NOW(), '["introducao", "boas-vindas"]'::jsonb),
  ('Técnicas de Respiração para Mamães', 'Aprenda técnicas simples para momentos de estresse', 'audio', 'wellness', true, NOW(), '["respiracao", "calma", "bem-estar"]'::jsonb),
  ('Alimentação Saudável no Puerpério', 'Dicas de nutrição para o pós-parto', 'article', 'nutrition', true, NOW(), '["nutricao", "puerperio", "saude"]'::jsonb)
ON CONFLICT DO NOTHING;

-- 9. Verificar se a tabela foi criada
SELECT
  'content_items' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'content_items'
  ) as exists,
  (SELECT COUNT(*) FROM public.content_items) as row_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'content_items') as policy_count;

-- =============================================================================
-- FIM DA MIGRATION 5
-- =============================================================================
-- =============================================================================
-- Migration 6/6: Update RLS Policies After Renames
-- Nossa Maternidade - Consolidação de Schema
-- =============================================================================
-- IMPORTANTE: Execute no Supabase Dashboard SQL Editor
-- Execute DEPOIS da migration 5 (última migration!)
-- =============================================================================

-- =============================================================================
-- PARTE 1: RLS POLICIES PARA PROFILES (ex-user_profiles)
-- =============================================================================

-- Dropar policies antigas (se existirem com nome antigo)
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar novas policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- PARTE 2: RLS POLICIES PARA COMMUNITY_POSTS (ex-posts)
-- =============================================================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "posts_select_all" ON public.community_posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can view approved posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;

-- Criar novas policies
CREATE POLICY "community_posts_select_approved"
  ON public.community_posts FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "community_posts_insert_own"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts_update_own"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "community_posts_delete_own"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 3: RLS POLICIES PARA USER_CONTENT_INTERACTIONS (ex-content_favorites)
-- =============================================================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "content_favorites_select_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "content_favorites_insert_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "content_favorites_delete_own" ON public.user_content_interactions;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_content_interactions;
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_content_interactions;

-- Criar novas policies
CREATE POLICY "user_content_interactions_select_own"
  ON public.user_content_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_insert_own"
  ON public.user_content_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_update_own"
  ON public.user_content_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_delete_own"
  ON public.user_content_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 4: RLS POLICIES PARA COMMUNITY_COMMENTS
-- =============================================================================

-- Verificar e recriar policies
DROP POLICY IF EXISTS "community_comments_select_all" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_insert_own" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_update_own" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_delete_own" ON public.community_comments;

CREATE POLICY "community_comments_select_all"
  ON public.community_comments FOR SELECT
  USING (true);

CREATE POLICY "community_comments_insert_own"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_update_own"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "community_comments_delete_own"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 5: RLS POLICIES PARA COMMUNITY_LIKES
-- =============================================================================

DROP POLICY IF EXISTS "community_likes_select_own" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_insert_own" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_delete_own" ON public.community_likes;

CREATE POLICY "community_likes_select_own"
  ON public.community_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "community_likes_insert_own"
  ON public.community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_likes_delete_own"
  ON public.community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PARTE 6: RLS POLICIES PARA CHAT_CONVERSATIONS E CHAT_MESSAGES
-- =============================================================================

-- chat_conversations
DROP POLICY IF EXISTS "chat_conversations_select_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_insert_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_update_own" ON public.chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_delete_own" ON public.chat_conversations;

CREATE POLICY "chat_conversations_select_own"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_insert_own"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_conversations_update_own"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_delete_own"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- chat_messages (via conversation ownership)
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;

CREATE POLICY "chat_messages_select_own"
  ON public.chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert_own"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PARTE 7: RLS POLICIES PARA HABITS E HABIT_LOGS
-- =============================================================================

-- habits (leitura pública, escrita restrita)
DROP POLICY IF EXISTS "habits_select_all" ON public.habits;

CREATE POLICY "habits_select_all"
  ON public.habits FOR SELECT
  USING (true);

-- habit_logs
DROP POLICY IF EXISTS "habit_logs_select_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_insert_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_delete_own" ON public.habit_logs;

CREATE POLICY "habit_logs_select_own"
  ON public.habit_logs FOR SELECT
  USING (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "habit_logs_insert_own"
  ON public.habit_logs FOR INSERT
  WITH CHECK (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "habit_logs_delete_own"
  ON public.habit_logs FOR DELETE
  USING (
    user_habit_id IN (
      SELECT id FROM public.user_habits WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- =============================================================================

-- Listar todas as tabelas com status de RLS
SELECT
  t.tablename as tabela,
  t.rowsecurity as rls_habilitado,
  COUNT(p.policyname) as qtd_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles',
    'community_posts',
    'user_content_interactions',
    'community_comments',
    'community_likes',
    'chat_conversations',
    'chat_messages',
    'habits',
    'habit_logs',
    'user_habits',
    'content_items',
    'user_consents',
    'consent_terms_versions',
    'crisis_interventions',
    'moderation_queue',
    'moderators',
    'moderation_metrics'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =============================================================================
-- RESUMO DAS MIGRAÇÕES EXECUTADAS
-- =============================================================================
SELECT '=== CONSOLIDAÇÃO DE SCHEMA CONCLUÍDA ===' as status;
SELECT '1. user_profiles → profiles ✓' as migration_1;
SELECT '2. posts → community_posts ✓' as migration_2;
SELECT '3. content_favorites → user_content_interactions ✓' as migration_3;
SELECT '4. Criada tabela user_habits ✓' as migration_4;
SELECT '5. Criada tabela content_items ✓' as migration_5;
SELECT '6. RLS policies atualizadas ✓' as migration_6;

-- Listar tabelas finais
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- FIM DA CONSOLIDAÇÃO DE SCHEMA
-- Total de tabelas esperado: ~20
-- =============================================================================
