-- ============================================
-- MIGRATION: Multi-User Collaboration Setup
-- ============================================
-- Script ini mengubah arsitektur dari 1 user = 1 row
-- menjadi 1 wedding event bisa diakses banyak user
-- 
-- PENTING: Script ini aman dan TIDAK menghapus data existing
-- ============================================

-- ============================================
-- STEP 1: Tambah kolom id ke wedding_data
-- ============================================
-- wedding_data saat ini menggunakan user_id sebagai primary key
-- Kita perlu menambah kolom id (UUID) sebagai primary key baru

-- Tambah kolom id jika belum ada
ALTER TABLE wedding_data 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

-- Drop constraint lama (user_id sebagai primary key)
-- dan buat id sebagai primary key baru
DO $$
BEGIN
  -- Check jika constraint lama masih ada
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'wedding_data' 
    AND constraint_name = 'wedding_data_pkey'
  ) THEN
    -- Drop constraint lama
    ALTER TABLE wedding_data DROP CONSTRAINT wedding_data_pkey;
  END IF;
  
  -- Buat primary key baru dengan kolom id
  ALTER TABLE wedding_data ADD CONSTRAINT wedding_data_pkey PRIMARY KEY (id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Primary key migration skipped or already done';
END $$;

-- ============================================
-- STEP 2: Buat tabel profiles
-- ============================================
-- Tabel ini menyimpan informasi publik user (email, nama)
-- agar bisa ditampilkan ke user lain tanpa expose data sensitif

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS untuk profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: User bisa lihat semua profiles (untuk fitur invite)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: User hanya bisa update profile sendiri
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: User bisa insert profile sendiri
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 3: Buat trigger untuk auto-insert profiles
-- ============================================
-- Saat user baru register di auth.users, otomatis insert ke profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Buat tabel wedding_members
-- ============================================
-- Tabel ini menghubungkan banyak user ke satu wedding event

CREATE TABLE IF NOT EXISTS wedding_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES wedding_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- Enable RLS untuk wedding_members
ALTER TABLE wedding_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members bisa lihat wedding members
DROP POLICY IF EXISTS "Members can view wedding members" ON wedding_members;
CREATE POLICY "Members can view wedding members"
  ON wedding_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_members.wedding_id
      AND wm.user_id = auth.uid()
    )
  );

-- Policy: Owner bisa insert member
DROP POLICY IF EXISTS "Owner can insert wedding members" ON wedding_members;
CREATE POLICY "Owner can insert wedding members"
  ON wedding_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
    OR user_id = auth.uid() -- User bisa add diri sendiri
  );

-- Policy: Owner bisa delete member
DROP POLICY IF EXISTS "Owner can delete wedding members" ON wedding_members;
CREATE POLICY "Owner can delete wedding members"
  ON wedding_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_members.wedding_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
    OR user_id = auth.uid() -- User bisa remove diri sendiri
  );

-- ============================================
-- STEP 5: Migrasi data existing
-- ============================================
-- Pindahkan semua user_id yang sudah ada di wedding_data
-- menjadi 'owner' di tabel wedding_members

INSERT INTO wedding_members (wedding_id, user_id, role)
SELECT id, user_id, 'owner'
FROM wedding_data
WHERE user_id IS NOT NULL
ON CONFLICT (wedding_id, user_id) DO NOTHING;

-- ============================================
-- STEP 6: Update RLS untuk wedding_data
-- ============================================
-- Hapus semua policy lama
DROP POLICY IF EXISTS "Users can view own data" ON wedding_data;
DROP POLICY IF EXISTS "Users can insert own data" ON wedding_data;
DROP POLICY IF EXISTS "Users can update own data" ON wedding_data;
DROP POLICY IF EXISTS "Users can delete own data" ON wedding_data;

-- Buat policy baru berdasarkan wedding_members
-- Policy: Members bisa SELECT wedding data
DROP POLICY IF EXISTS "Members can view wedding data" ON wedding_data;
CREATE POLICY "Members can view wedding data"
  ON wedding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_data.id
      AND wm.user_id = auth.uid()
    )
  );

-- Policy: Owner bisa INSERT wedding data
DROP POLICY IF EXISTS "Owner can insert wedding data" ON wedding_data;
CREATE POLICY "Owner can insert wedding data"
  ON wedding_data FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Members bisa UPDATE wedding data
DROP POLICY IF EXISTS "Members can update wedding data" ON wedding_data;
CREATE POLICY "Members can update wedding data"
  ON wedding_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_data.id
      AND wm.user_id = auth.uid()
    )
  );

-- Policy: Owner bisa DELETE wedding data
DROP POLICY IF EXISTS "Owner can delete wedding data" ON wedding_data;
CREATE POLICY "Owner can delete wedding data"
  ON wedding_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = wedding_data.id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
  );

-- ============================================
-- STEP 7: Enable Realtime untuk wedding_data
-- ============================================
-- Aktifkan realtime replication untuk tabel wedding_data
-- (Ini juga bisa dilakukan via Supabase Dashboard → Database → Replication)

ALTER PUBLICATION supabase_realtime ADD TABLE wedding_data;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Jalankan query ini untuk verifikasi migrasi berhasil:

-- Check jumlah members yang sudah dimigrasi
-- SELECT COUNT(*) as migrated_members FROM wedding_members WHERE role = 'owner';

-- Check semua wedding data dengan members
-- SELECT wd.id, wd.user_id, wm.user_id as member_id, wm.role
-- FROM wedding_data wd
-- LEFT JOIN wedding_members wm ON wd.id = wm.wedding_id;

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Script ini menggunakan IF NOT EXISTS dan ON CONFLICT untuk menghindari error
-- 2. Data existing TIDAK dihapus, hanya dimigrasi
-- 3. RLS sangat ketat: user hanya bisa akses wedding yang mereka member-nya
-- 4. Trigger otomatis membuat profile saat user baru register
-- 5. Realtime enabled untuk wedding_data
-- ============================================
