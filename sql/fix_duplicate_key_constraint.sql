-- ============================================
-- FIX: Remove Incorrect Unique Constraint
-- ============================================
-- Error: "duplicate key value violates unique constraint wedding_data_user_id_key"
-- Penyebab: Constraint user_id tidak kompatibel dengan multi-user collaboration
-- Solusi: Hapus constraint user_id, hanya pertahankan constraint pada id

-- ============================================
-- STEP 1: Drop constraint user_id dari wedding_data
-- ============================================
ALTER TABLE public.wedding_data 
DROP CONSTRAINT IF EXISTS wedding_data_user_id_key;

-- ============================================
-- STEP 2: Verify constraint sudah dihapus
-- ============================================
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'wedding_data'
ORDER BY constraint_type, constraint_name;

-- Expected result:
-- - wedding_data_pkey (PRIMARY KEY) →应保持
-- - wedding_data_user_id_key →应已删除

-- ============================================
-- STEP 3: Verify primary key masih ada
-- ============================================
SELECT 
    kcu.constraint_name,
    kcu.column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'wedding_data' 
    AND tc.constraint_type = 'PRIMARY KEY';

-- Expected: id column sebagai primary key

-- ============================================
-- STEP 4: Test insert data untuk verifikasi
-- ============================================
-- Test 1: Insert wedding baru (harus berhasil)
-- INSERT INTO public.wedding_data (id, user_id, settings)
-- VALUES (gen_random_uuid(), 'test-user-id', '{}'::jsonb);

-- Test 2: Insert wedding dengan user_id yang sama tapi id berbeda (harus berhasil)
-- INSERT INTO public.wedding_data (id, user_id, settings)
-- VALUES (gen_random_uuid(), 'test-user-id', '{}'::jsonb);

-- Jika kedua test berhasil, berarti constraint sudah diperbaiki

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Constraint user_id DIHAPUS karena:
--    - 1 user bisa jadi member di multiple weddings (via wedding_members)
--    - 1 wedding bisa punya multiple users (via wedding_members)
--    - Uniqueness hanya diperlukan pada wedding_id (id column)
--
-- 2. wedding_members table tetap memiliki constraint:
--    - UNIQUE(wedding_id, user_id) → 1 user hanya bisa 1x di wedding yang sama
--    - Ini sudah benar dan tidak perlu diubah
--
-- 3. Setelah constraint dihapus:
--    - User A bisa sync ke wedding ABC
--    - User B bisa sync ke wedding ABC (setelah di-invite)
--    - Tidak ada lagi error duplicate key
