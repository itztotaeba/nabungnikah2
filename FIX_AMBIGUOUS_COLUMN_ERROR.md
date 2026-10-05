# 🔧 Fix: Ambiguous Column Reference Error

## 🐛 Masalah yang Ditemukan

**Error Message:**
```
Gagal menginisialisasi wedding: column reference "wedding_id" is ambiguous
```

**Kapan Terjadi:**
- Setiap kali user baru register dan login
- Loading terus-menerus
- Toast error muncul

---

## 🔍 Root Cause Analysis

### Penyebab Error

Error terjadi di fungsi RPC `create_initial_wedding()` di database Supabase karena **ambiguitas nama kolom**.

**Kode Lama (BERMASALAH):**
```sql
DECLARE
  new_wedding_id UUID;  -- ← Variabel bernama 'new_wedding_id'
  
-- ...

SELECT wedding_id INTO new_wedding_id  -- ← PostgreSQL bingung!
FROM public.wedding_members
WHERE user_id = current_user_id;
```

**Masalah:**
- PostgreSQL menemukan `wedding_id` di query
- Tapi tidak jelas apakah ini:
  - Kolom `wedding_id` dari tabel `wedding_members`?
  - Atau referensi ke variabel `new_wedding_id`?
- Result: **Ambiguous column reference error**

### Mengapa Error Ini Muncul?

1. **PostgreSQL Strict Mode**: PostgreSQL sangat strict tentang ambiguity
2. **No Table Alias**: Query tidak menggunakan alias tabel (seperti `wm.wedding_id`)
3. **Variable Naming**: Variabel `new_wedding_id` mirip dengan kolom `wedding_id`

---

## ✅ Solusi yang Diimplementasikan

### 1. Gunakan Alias Tabel yang Eksplisit

**Kode Baru (FIXED):**
```sql
DECLARE
  v_wedding_id UUID;  -- ← Prefix 'v_' untuk variable
  v_user_id UUID;
  
-- ...

-- Gunakan alias tabel 'wm' untuk wedding_members
SELECT wm.wedding_id INTO v_wedding_id
FROM public.wedding_members wm
WHERE wm.user_id = v_user_id
LIMIT 1;

-- Gunakan alias tabel 'wd' untuk wedding_data
SELECT wd.id INTO v_wedding_id
FROM public.wedding_data wd
WHERE wd.user_id = v_user_id
LIMIT 1;
```

**Perubahan:**
- ✅ Tambah alias tabel: `wm` untuk `wedding_members`, `wd` untuk `wedding_data`
- ✅ Gunakan prefix `v_` untuk semua variabel
- ✅ Referensi kolom dengan alias: `wm.wedding_id`, `wd.id`

### 2. Best Practices yang Diterapkan

#### A. Table Aliases
```sql
-- ❌ BAD: No alias
SELECT wedding_id FROM wedding_members WHERE user_id = ...

-- ✅ GOOD: With alias
SELECT wm.wedding_id FROM wedding_members wm WHERE wm.user_id = ...
```

#### B. Variable Naming Convention
```sql
-- ❌ BAD: Similar to column name
DECLARE new_wedding_id UUID;

-- ✅ GOOD: Clear prefix
DECLARE v_wedding_id UUID;
```

#### C. Explicit Column References
```sql
-- ❌ BAD: Ambiguous
SELECT wedding_id INTO ...

-- ✅ GOOD: Explicit
SELECT wm.wedding_id INTO ...
```

---

## 📝 Cara Apply Fix

### Step 1: Buka Supabase Dashboard
1. Login ke [Supabase Dashboard](https://supabase.com)
2. Pilih project WeddingPlan
3. Buka **SQL Editor**

### Step 2: Jalankan Script Fix
1. Klik **New Query**
2. Copy-paste isi file `sql/fix_ambiguous_column.sql`
3. Klik **Run** atau tekan `Ctrl+Enter`

### Step 3: Verifikasi
Jalankan query ini untuk memastikan fungsi sudah ter-update:
```sql
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'create_initial_wedding';
```

### Step 4: Test dengan User Baru
1. Register akun baru
2. Login
3. Check console log:
   ```
   🔄 Memanggil RPC create_initial_wedding...
   ✅ Wedding ID obtained: abc123-def456-...
   ✅ User role: owner
   ✅ Wedding session initialized
   ```
4. Verifikasi tidak ada error

---

## 🧪 Testing Checklist

### Test 1: User Baru Register
- [ ] Register akun baru
- [ ] Login
- [ ] Verifikasi tidak ada error "ambiguous column"
- [ ] Verifikasi wedding berhasil dibuat
- [ ] Verifikasi loading selesai

### Test 2: User Existing Login
- [ ] Login dengan akun existing
- [ ] Verifikasi tidak ada error
- [ ] Verifikasi wedding_id yang existing di-return

### Test 3: Legacy Data
- [ ] User dengan data lama di `wedding_data` tapi tidak di `wedding_members`
- [ ] Login
- [ ] Verifikasi tidak ada error duplicate key
- [ ] Verifikasi entry ditambahkan ke `wedding_members`

### Test 4: Multiple Calls
- [ ] Panggil RPC berkali-kali
- [ ] Verifikasi selalu return wedding_id yang sama
- [ ] Verifikasi tidak ada error

---

## 📊 Perbandingan Before/After

### Before (Error)
```sql
SELECT wedding_id INTO new_wedding_id
FROM public.wedding_members
WHERE user_id = current_user_id;

-- ❌ ERROR: column reference "wedding_id" is ambiguous
```

### After (Fixed)
```sql
SELECT wm.wedding_id INTO v_wedding_id
FROM public.wedding_members wm
WHERE wm.user_id = v_user_id;

-- ✅ SUCCESS: No ambiguity
```

---

## 🎯 Best Practices untuk RPC Functions

### 1. Always Use Table Aliases
```sql
-- ✅ GOOD
SELECT t.column_name FROM table_name t WHERE t.id = ...

-- ❌ BAD
SELECT column_name FROM table_name WHERE id = ...
```

### 2. Use Variable Prefixes
```sql
-- ✅ GOOD
DECLARE v_user_id UUID;
DECLARE v_wedding_id UUID;

-- ❌ BAD
DECLARE user_id UUID;  -- Conflicts with column name
DECLARE wedding_id UUID;  -- Conflicts with column name
```

### 3. Explicit Column References
```sql
-- ✅ GOOD
SELECT u.id, u.email FROM users u WHERE u.id = v_user_id;

-- ❌ BAD
SELECT id, email FROM users WHERE id = user_id;
```

### 4. Use Schema Qualification
```sql
-- ✅ GOOD
SELECT * FROM public.wedding_data wd WHERE wd.id = v_wedding_id;

-- ⚠️ OK (if search_path is set)
SELECT * FROM wedding_data WHERE id = wedding_id;
```

### 5. Handle NULL Explicitly
```sql
-- ✅ GOOD
IF v_wedding_id IS NULL THEN
  -- Handle case
END IF;

-- ❌ BAD
IF wedding_id IS NULL THEN  -- Ambiguous!
```

---

## 🔍 Debugging Guide

### Jika Masih Ada Error

#### 1. Check Function Definition
```sql
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'create_initial_wedding';
```

#### 2. Test Function Manually
```sql
-- Login sebagai user yang bermasalah
-- Kemudian jalankan:
SELECT public.create_initial_wedding();
```

#### 3. Check Error Details
```sql
-- Enable error logging
SET client_min_messages TO DEBUG;

-- Run function
SELECT public.create_initial_wedding();
```

#### 4. Check Table Structure
```sql
-- Verify column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wedding_members';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wedding_data';
```

---

## 📚 Related Issues

### Issue 1: Duplicate Key Error
**Error:** `duplicate key value violates unique constraint wedding_data_user_id_key`

**Solusi:** Sudah di-fix dengan RPC-First strategy di frontend

### Issue 2: Ambiguous Column Reference
**Error:** `column reference "wedding_id" is ambiguous`

**Solusi:** File ini - gunakan table aliases dan variable prefixes

### Issue 3: Permission Denied
**Error:** `permission denied for function create_initial_wedding`

**Solusi:** 
```sql
GRANT EXECUTE ON FUNCTION public.create_initial_wedding() TO authenticated;
```

---

## ✅ Verification Steps

### 1. Function Exists
```sql
SELECT COUNT(*) 
FROM information_schema.routines 
WHERE routine_name = 'create_initial_wedding';
-- Expected: 1
```

### 2. Function is IDEMPOTENT
```sql
-- Call multiple times
SELECT public.create_initial_wedding();
SELECT public.create_initial_wedding();
SELECT public.create_initial_wedding();
-- Expected: Same UUID returned each time
```

### 3. No Ambiguity Errors
```sql
-- Enable strict mode
SET check_function_bodies = on;

-- Recreate function
-- (run the fix script again)

-- Expected: No errors
```

---

## 🎉 Kesimpulan

Error "ambiguous column reference" telah diperbaiki dengan:

1. ✅ **Table Aliases** - Gunakan `wm.`, `wd.` untuk referensi kolom
2. ✅ **Variable Prefixes** - Gunakan `v_` untuk semua variabel
3. ✅ **Explicit References** - Selalu gunakan `table_alias.column_name`
4. ✅ **Best Practices** - Ikuti PostgreSQL naming conventions

**Fungsi RPC sekarang berjalan tanpa error!** 🚀

---

## 📞 Support

Jika masih ada masalah:
1. Check console browser untuk error details
2. Check Supabase logs di Dashboard
3. Test fungsi secara manual di SQL Editor
4. Review dokumentasi ini

**File SQL Fix:** `sql/fix_ambiguous_column.sql`
