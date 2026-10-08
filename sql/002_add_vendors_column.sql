-- ============================================
-- SQL Script: Tambah Kolom Vendors
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk menambahkan kolom vendors ke table wedding_data

-- Tambah kolom vendors dengan default array kosong
ALTER TABLE wedding_data 
ADD COLUMN IF NOT EXISTS vendors JSONB DEFAULT '[]';

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wedding_data' 
AND column_name = 'vendors';

-- ============================================
-- CATATAN:
-- ============================================
-- 1. Script ini menggunakan IF NOT EXISTS untuk menghindari error
--    jika kolom sudah ada
-- 2. Default value adalah array kosong '[]'
-- 3. Data type JSONB memungkinkan penyimpanan array of objects
-- 4. Setelah menjalankan script, restart aplikasi untuk melihat perubahan
-- ============================================
