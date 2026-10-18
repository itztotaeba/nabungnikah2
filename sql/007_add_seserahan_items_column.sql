-- ============================================
-- SQL Script: Tambah Kolom Daftar Seserahan
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk menambahkan kolom seserahan_items ke table wedding_data

-- Tambah kolom seserahan_items dengan default array kosong
ALTER TABLE wedding_data
ADD COLUMN IF NOT EXISTS seserahan_items JSONB DEFAULT '[]';

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'wedding_data'
AND column_name = 'seserahan_items';

-- ============================================
-- CATATAN:
-- ============================================
-- 1. Script ini menggunakan IF NOT EXISTS untuk menghindari error
--    jika kolom sudah ada
-- 2. Default value adalah array kosong '[]'
-- 3. Data type JSONB memungkinkan penyimpanan array of objects
--    (SeserahanItem: title, category, brand, estimatedCost,
--     isBought, link, label, notes, updatedBy, updatedAt)
-- 4. Setelah menjalankan script, restart aplikasi untuk melihat perubahan
-- ============================================
