-- ============================================
-- Setup User Avatar Feature
-- ============================================
-- Script ini menambahkan fitur upload foto profil user
-- Menggunakan Supabase Storage untuk menyimpan foto

-- ============================================
-- STEP 1: Tambah kolom avatar_url di tabel profiles
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- STEP 2: Buat Storage Bucket untuk avatars
-- ============================================
-- Note: Ini harus dilakukan via Supabase Dashboard
-- Atau gunakan SQL berikut jika punya permission:

-- Insert storage bucket (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Setup RLS Policies untuk Storage
-- ============================================

-- Policy: Users bisa upload avatar mereka sendiri
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users bisa update avatar mereka sendiri
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users bisa delete avatar mereka sendiri
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Semua orang bisa lihat avatar (public)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- ============================================
-- STEP 4: Update RLS untuk profiles table
-- ============================================

-- Policy: Users bisa update avatar_url mereka sendiri
DROP POLICY IF EXISTS "Users can update own avatar_url" ON public.profiles;
CREATE POLICY "Users can update own avatar_url"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check kolom sudah ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'avatar_url';

-- Check storage bucket sudah dibuat
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'avatars';

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Setelah menjalankan script ini, buka Supabase Dashboard
-- 2. Go to Storage → avatars bucket
-- 3. Pastikan bucket sudah public
-- 4. Test upload avatar via UI
-- ============================================
