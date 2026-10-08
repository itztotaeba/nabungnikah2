-- ============================================
-- SQL Script: Tambah Kolom Tasks
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk menambahkan kolom tasks ke table wedding_data

-- Tambah kolom tasks dengan default array kosong
ALTER TABLE wedding_data 
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]';

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wedding_data' 
AND column_name = 'tasks';

-- ============================================
-- CATATAN:
-- ============================================
-- 1. Script ini menggunakan IF NOT EXISTS untuk menghindari error
--    jika kolom sudah ada
-- 2. Default value adalah array kosong '[]'
-- 3. Data type JSONB memungkinkan penyimpanan array of objects
-- 4. Setelah menjalankan script, restart aplikasi untuk melihat perubahan
-- ============================================
