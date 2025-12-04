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
