-- =============================================================================
-- Migration: Criar tabela content_items
-- Data: 2025-01-28
-- Descrição: Tabela principal do feed de conteúdo (vídeos, artigos, reels) - necessária para FeedService
-- =============================================================================

-- Criar enum para tipos de conteúdo se não existir
DO $$ BEGIN
  CREATE TYPE content_item_type AS ENUM ('video', 'audio', 'article', 'reels');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Criar tabela content_items
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type content_item_type NOT NULL,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  duration INTEGER, -- em segundos
  author_name TEXT,
  author_avatar_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_content_items_published ON public.content_items(is_published, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(type) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_category ON public.content_items(category) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_tags ON public.content_items USING GIN(tags) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_views ON public.content_items(views_count DESC) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_likes ON public.content_items(likes_count DESC) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_premium ON public.content_items(is_premium) WHERE is_published = TRUE AND deleted_at IS NULL;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_items_updated_at ON public.content_items;
CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_content_items_updated_at();

-- Habilitar RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Conteúdo publicado é público (qualquer um pode ler)
DROP POLICY IF EXISTS "Public can read published content" ON public.content_items;
CREATE POLICY "Public can read published content"
  ON public.content_items FOR SELECT
  USING (is_published = TRUE AND deleted_at IS NULL);

-- Apenas service_role pode criar/atualizar/deletar conteúdo
-- (Conteúdo é criado via admin/backend, não diretamente pelo app)
DROP POLICY IF EXISTS "Service role manages content" ON public.content_items;
CREATE POLICY "Service role manages content"
  ON public.content_items FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Comentários
COMMENT ON TABLE public.content_items IS 'Itens de conteúdo do feed (vídeos, artigos, áudios, reels)';
COMMENT ON COLUMN public.content_items.type IS 'Tipo de conteúdo: video, audio, article, reels';
COMMENT ON COLUMN public.content_items.category IS 'Categoria do conteúdo (ex: saúde, bem-estar, rotina)';
COMMENT ON COLUMN public.content_items.is_premium IS 'Se o conteúdo requer assinatura premium';
COMMENT ON COLUMN public.content_items.is_exclusive IS 'Se o conteúdo é exclusivo para usuárias específicas';
COMMENT ON COLUMN public.content_items.views_count IS 'Contador de visualizações (atualizado via trigger ou RPC)';
COMMENT ON COLUMN public.content_items.likes_count IS 'Contador de likes (atualizado via trigger ou RPC)';

SELECT 'Migration completa: Tabela content_items criada' as status;

