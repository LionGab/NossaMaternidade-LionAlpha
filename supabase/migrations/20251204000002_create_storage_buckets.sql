-- =============================================================================
-- Migration: 20251204000002_create_storage_buckets.sql
-- Criar buckets de storage para avatars e community
-- Nossa Maternidade
-- =============================================================================

-- Criar bucket para avatars (fotos de perfil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Criar bucket para community (imagens de posts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community',
  'community',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =============================================================================
-- RLS Policies para avatars
-- =============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Policy: Avatars são públicos para visualização
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Usuários podem fazer upload do próprio avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Usuários podem atualizar o próprio avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Usuários podem deletar o próprio avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- RLS Policies para community
-- =============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Community images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own community images" ON storage.objects;

-- Policy: Imagens da comunidade são públicas para visualização
CREATE POLICY "Community images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community');

-- Policy: Usuários autenticados podem fazer upload
CREATE POLICY "Users can upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community' AND
    auth.uid() IS NOT NULL
  );

-- Policy: Usuários podem atualizar suas próprias imagens
CREATE POLICY "Users can update their own community images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'community' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Usuários podem deletar suas próprias imagens
CREATE POLICY "Users can delete their own community images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM storage.buckets WHERE id = 'avatars') THEN
    RAISE NOTICE 'Bucket avatars criado/atualizado com sucesso!';
  ELSE
    RAISE WARNING 'Bucket avatars nao foi criado';
  END IF;

  IF EXISTS (SELECT FROM storage.buckets WHERE id = 'community') THEN
    RAISE NOTICE 'Bucket community criado/atualizado com sucesso!';
  ELSE
    RAISE WARNING 'Bucket community nao foi criado';
  END IF;
END $$;
