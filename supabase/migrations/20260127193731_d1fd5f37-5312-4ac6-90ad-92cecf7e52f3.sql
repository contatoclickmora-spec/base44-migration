-- Create storage buckets for file uploads

-- Bucket for package photos (encomendas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('encomendas', 'encomendas', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for visitor photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('visitantes', 'visitantes', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for general documents and files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documentos', 'documentos', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/pdf', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for encomendas bucket
CREATE POLICY "Authenticated users can upload package photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'encomendas');

CREATE POLICY "Anyone can view package photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'encomendas');

CREATE POLICY "Authenticated users can update package photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'encomendas');

CREATE POLICY "Authenticated users can delete package photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'encomendas');

-- RLS Policies for avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for visitantes bucket
CREATE POLICY "Authenticated users can upload visitor photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'visitantes');

CREATE POLICY "Anyone can view visitor photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'visitantes');

CREATE POLICY "Authenticated users can manage visitor photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'visitantes');

CREATE POLICY "Authenticated users can delete visitor photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'visitantes');

-- RLS Policies for documentos bucket (private)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');