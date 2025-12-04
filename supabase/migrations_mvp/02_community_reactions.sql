-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 02_community_reactions.sql
-- Descrição: Tabelas de interação da comunidade
-- Tabelas: community_comments, community_likes, post_reactions, content_favorites
-- Ordem: Executar DEPOIS de 01_core_tables.sql
-- =============================================================================

-- =============================================================================
-- TABELA: community_comments
-- Descrição: Comentários nos posts da comunidade
-- Relacionamento: N:1 com community_posts (post_id)
-- Suporta threading: parent_id para respostas
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- Para replies

  -- Conteúdo
  content TEXT NOT NULL,

  -- Moderação
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),

  -- Contadores
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para community_comments
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_comments_post_order ON community_comments(post_id, created_at ASC) WHERE deleted_at IS NULL AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_community_comments_pending ON community_comments(created_at DESC) WHERE status = 'pending' AND deleted_at IS NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_community_comments_updated_at ON community_comments;
CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE community_comments IS 'Comentários em posts da comunidade (suporta threading)';

-- =============================================================================
-- TABELA: community_likes
-- Descrição: Likes em posts e comentários da comunidade
-- Relacionamento: N:1 com community_posts OU community_comments
-- Constraint: Deve ter post_id OU comment_id, não ambos
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem deu o like
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- O que foi curtido (post OU comentário)
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Índices para community_likes
CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_likes_comment ON community_likes(comment_id) WHERE comment_id IS NOT NULL;

-- Índice único para evitar likes duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_likes_unique_post ON community_likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_likes_unique_comment ON community_likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

COMMENT ON TABLE community_likes IS 'Likes em posts e comentários da comunidade';

-- =============================================================================
-- TABELA: post_reactions
-- Descrição: Reações mais expressivas (além do like simples)
-- Relacionamento: N:1 com community_posts
-- Tipos: like, love, support, hug
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem reagiu
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Post que recebeu a reação
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,

  -- Tipo de reação
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'hug', 'helpful')),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: uma reação por tipo por usuário por post
  UNIQUE(user_id, post_id, reaction_type)
);

-- Índices para post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_type ON post_reactions(post_id, reaction_type);

COMMENT ON TABLE post_reactions IS 'Reações expressivas em posts (like, love, support, hug)';

-- =============================================================================
-- TABELA: content_favorites
-- Descrição: Conteúdos salvos/favoritados pelas usuárias
-- Pode ser um post da comunidade ou conteúdo editorial
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem favoritou
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- O que foi favoritado
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'video', 'tip')),
  content_id UUID NOT NULL,

  -- Metadados para exibição (desnormalizado para performance)
  content_title TEXT,
  content_preview TEXT,
  content_image_url TEXT,

  -- Organização
  folder TEXT, -- Para agrupar favoritos em pastas
  notes TEXT,  -- Notas pessoais sobre o conteúdo

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: um favorito por conteúdo por usuário
  UNIQUE(user_id, content_type, content_id)
);

-- Índices para content_favorites
CREATE INDEX IF NOT EXISTS idx_content_favorites_user ON content_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_content_favorites_user_type ON content_favorites(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_favorites_content ON content_favorites(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_favorites_folder ON content_favorites(user_id, folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_favorites_recent ON content_favorites(user_id, created_at DESC);

COMMENT ON TABLE content_favorites IS 'Conteúdos salvos/favoritados pelas usuárias';

-- =============================================================================
-- TRIGGERS: Atualizar contadores desnormalizados
-- =============================================================================

-- Função para atualizar like_count em community_posts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_like_count ON community_likes;
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

-- Função para atualizar like_count em community_comments
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_like_count ON community_likes;
CREATE TRIGGER trigger_update_comment_like_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();

-- Função para atualizar comment_count em community_posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Só conta comentários de primeiro nível (sem parent_id)
    IF NEW.parent_id IS NULL AND NEW.deleted_at IS NULL THEN
      UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
    -- Atualiza reply_count do comentário pai
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE community_comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    IF OLD.parent_id IS NULL THEN
      UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE community_comments SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.parent_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON community_comments;
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('community_comments', 'community_likes', 'post_reactions', 'content_favorites');

  RAISE NOTICE '02_community_reactions.sql: % tabelas criadas/verificadas', table_count;
END $$;
