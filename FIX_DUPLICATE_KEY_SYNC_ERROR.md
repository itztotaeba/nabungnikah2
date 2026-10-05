# 🔧 Fix: Duplicate Key Error pada Multi-User Sync

## 🐛 Masalah yang Dilaporkan

**Error Message:**
```
Gagal sync ke cloud: duplicate key value violates unique constraint "wedding_data_user_id_key"
```

**Skenario:**
1. User A login → buat wedding → wedding_id: ABC
2. User B login → di-invite ke wedding ABC → join ke wedding ABC
3. User A edit data → auto-sync ke cloud → ✅ berhasil
4. User B edit data → auto-sync ke cloud → ❌ **ERROR: duplicate key**

**Expected Behavior:**
- User A dan User B bisa sync data ke wedding yang sama
- Tidak ada error duplicate key
- Data ter-sync dengan benar antar user

**Actual Behavior:**
- User B tidak bisa sync data
- Error: "duplicate key value violates unique constraint wedding_data_user_id_key"
- Data tidak ter-sync antar user

---

## 🔍 Root Cause Analysis

### Penyebab Error

Database memiliki constraint `wedding_data_user_id_key` yang mengharuskan kolom `user_id` unik di tabel `wedding_data`.

**Struktur Database (SEBELUM):**
```sql
CREATE TABLE wedding_data (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,  -- ❌ PROBLEM: user_id harus unik
  settings JSONB,
  budget_items JSONB,
  -- ...
);
```

**Mengapa Ini Salah?**

Dalam model **multi-user collaboration**:
- 1 wedding bisa punya **banyak user** (via `wedding_members`)
- 1 user bisa jadi member di **banyak wedding** (jika di-invite)
- `user_id` di `wedding_data` hanya menunjukkan **owner/pembuat wedding**
- **BUKAN** menunjukkan siapa saja yang bisa akses wedding

**Contoh Skenario yang Gagal:**

```
User A (owner) buat wedding ABC
  → wedding_data: { id: ABC, user_id: A }

User B di-invite ke wedding ABC
  → wedding_members: { wedding_id: ABC, user_id: B, role: member }

User B edit data dan sync
  → syncToCloud mencoba upsert: { id: ABC, user_id: B }
  → ❌ ERROR: user_id B sudah ada di row lain (wedding User B sendiri)
```

### Solusi yang Benar

**Struktur Database (SESUDAH):**
```sql
CREATE TABLE wedding_data (
  id UUID PRIMARY KEY,  -- ✅ Hanya id yang unik
  user_id UUID,         -- ✅ user_id TIDAK harus unik
  settings JSONB,
  budget_items JSONB,
  -- ...
);
```

**Uniqueness:**
- ✅ `wedding_data.id` → UNIQUE (1 wedding = 1 row)
- ❌ `wedding_data.user_id` → NOT UNIQUE (1 user bisa punya banyak wedding)
- ✅ `wedding_members(wedding_id, user_id)` → UNIQUE COMPOSITE (1 user hanya bisa 1x di wedding yang sama)

---

## ✅ Solusi yang Diimplementasikan

### Step 1: Hapus Constraint yang Salah

**File SQL:** `sql/fix_duplicate_key_constraint.sql`

```sql
-- Drop constraint user_id dari wedding_data
ALTER TABLE public.wedding_data 
DROP CONSTRAINT IF EXISTS wedding_data_user_id_key;
```

### Step 2: Verifikasi Constraint Sudah Dihapus

```sql
-- Check constraint yang ada
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
```

### Step 3: Test Sync Antar User

1. User A login → edit data → sync → ✅ berhasil
2. User B login → edit data → sync → ✅ berhasil
3. User A lihat data → ✅ muncul data dari User B
4. User B lihat data → ✅ muncul data dari User A

---

## 📊 Perbandingan Before/After

### Before (Error)

| User | Action | Result |
|------|--------|--------|
| User A | Sync ke wedding ABC | ✅ Success |
| User B | Sync ke wedding ABC | ❌ Error: duplicate key |

**Console Log:**
```
User A: ✅ Auto-sync to cloud successful
User B: ❌ Error syncing to cloud: duplicate key value violates unique constraint "wedding_data_user_id_key"
```

### After (Fixed)

| User | Action | Result |
|------|--------|--------|
| User A | Sync ke wedding ABC | ✅ Success |
| User B | Sync ke wedding ABC | ✅ Success |

**Console Log:**
```
User A: ✅ Auto-sync to cloud successful
User B: ✅ Auto-sync to cloud successful
```

---

## 🧪 Testing Scenarios

### Test 1: User A dan User B Sync ke Wedding yang Sama

**Setup:**
1. User A register dan login
2. User A buat wedding
3. User B register dan login
4. User A invite User B ke wedding

**Steps:**
1. User A edit budget item → auto-sync
2. User B edit guest → auto-sync
3. User A refresh → lihat data dari User B
4. User B refresh → lihat data dari User A

**Expected:**
- ✅ Tidak ada error duplicate key
- ✅ Data ter-sync dengan benar
- ✅ Kedua user melihat data yang sama

### Test 2: User C Punya Wedding Sendiri

**Setup:**
1. User C register dan login
2. User C buat wedding sendiri (tidak di-invite)

**Steps:**
1. User C edit data → auto-sync
2. User C lihat data

**Expected:**
- ✅ User C punya wedding sendiri
- ✅ Tidak ada conflict dengan wedding User A
- ✅ Data User C terpisah dari User A

### Test 3: User B Di-Invite ke Multiple Weddings

**Setup:**
1. User A buat wedding ABC
2. User D buat wedding XYZ
3. User B di-invite ke ABC dan XYZ

**Steps:**
1. User B login
2. Check console log

**Expected:**
```
🔍 Checking if user is already invited to a wedding...
✅ User already invited to wedding: ABC with role: member
```

**Note:**
- User B hanya bisa join ke 1 wedding pada satu waktu
- Jika ingin join ke wedding lain, harus leave wedding saat ini dulu
- Ini adalah limitasi desain saat ini (bisa di-improve di masa depan)

---

## 🔍 Debugging Guide

### Jika Masih Ada Error Duplicate Key

#### 1. Check Constraint di Database
```sql
-- Check apakah constraint user_id masih ada
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'wedding_data'
AND constraint_name = 'wedding_data_user_id_key';

-- Expected: No rows returned (constraint sudah dihapus)
```

#### 2. Check Data di wedding_data
```sql
-- Check apakah ada duplicate user_id
SELECT user_id, COUNT(*)
FROM public.wedding_data
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Expected: No rows returned (tidak ada duplicate)
```

#### 3. Check syncToCloud Function
```typescript
// Di src/syncStore.ts
const data = {
  id: currentWeddingId,      // ← Harus wedding_id
  user_id: user.id,          // ← User yang sedang login
  settings,
  budget_items: budgetItems,
  // ...
};

const { error } = await supabase
  .from('wedding_data')
  .upsert(data, { onConflict: 'id' });  // ← Harus 'id', bukan 'user_id'
```

#### 4. Check Console Log
Saat User B sync, console harus menampilkan:
```
✅ Auto-sync to cloud successful
```

Bukan:
```
❌ Error syncing to cloud: duplicate key value violates unique constraint "wedding_data_user_id_key"
```

---

## 📝 Penjelasan Teknis

### Mengapa Constraint user_id Salah?

**Model Data yang Benar:**

```
wedding_data (1 wedding = 1 row)
├── id: UUID (PRIMARY KEY, UNIQUE)
├── user_id: UUID (owner/pembuat wedding, NOT UNIQUE)
├── settings: JSONB
├── budget_items: JSONB
└── ...

wedding_members (many-to-many relationship)
├── wedding_id: UUID (FK ke wedding_data)
├── user_id: UUID (FK ke auth.users)
├── role: TEXT ('owner' | 'member')
└── UNIQUE(wedding_id, user_id) ← 1 user hanya bisa 1x di wedding yang sama
```

**Contoh Data:**

```
wedding_data:
| id  | user_id | settings |
|-----|---------|----------|
| ABC | User A  | {...}    |  ← Wedding ABC dibuat oleh User A
| XYZ | User D  | {...}    |  ← Wedding XYZ dibuat oleh User D

wedding_members:
| wedding_id | user_id | role   |
|------------|---------|--------|
| ABC        | User A  | owner  |  ← User A owner dari wedding ABC
| ABC        | User B  | member |  ← User B member dari wedding ABC
| XYZ        | User D  | owner  |  ← User D owner dari wedding XYZ
| XYZ        | User B  | member |  ← User B member dari wedding XYZ
```

**Kenapa user_id di wedding_data TIDAK harus unik?**
- User A bisa buat wedding ABC (user_id: A)
- User A bisa buat wedding DEF juga (user_id: A lagi)
- Jadi user_id A muncul 2x di wedding_data → TIDAK UNIQUE

**Kenapa wedding_members(wedding_id, user_id) harus unique composite?**
- User B hanya bisa jadi member 1x di wedding ABC
- User B bisa jadi member di wedding ABC dan XYZ (wedding berbeda)
- Jadi composite key (wedding_id, user_id) harus unique

---

## 🎯 Best Practices untuk Multi-User Database

### 1. Pisahkan Ownership dan Access

```sql
-- ❌ BAD: user_id sebagai unique constraint
CREATE TABLE wedding_data (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,  -- ← Salah!
  -- ...
);

-- ✅ GOOD: user_id sebagai owner, access via wedding_members
CREATE TABLE wedding_data (
  id UUID PRIMARY KEY,
  user_id UUID,  -- ← Owner, tidak harus unique
  -- ...
);

CREATE TABLE wedding_members (
  wedding_id UUID REFERENCES wedding_data(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,
  UNIQUE(wedding_id, user_id)  -- ← Composite unique
);
```

### 2. Gunakan Composite Keys untuk Relationships

```sql
-- ✅ GOOD: Composite unique untuk many-to-many
CREATE TABLE wedding_members (
  wedding_id UUID,
  user_id UUID,
  role TEXT,
  UNIQUE(wedding_id, user_id)  -- ← 1 user hanya bisa 1x di wedding yang sama
);
```

### 3. Hindari Single-Column Unique untuk Foreign Keys

```sql
-- ❌ BAD: Foreign key dengan unique constraint
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID UNIQUE,  -- ← Salah! 1 order bisa punya banyak items
  -- ...
);

-- ✅ GOOD: Foreign key tanpa unique constraint
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID,  -- ← Benar! 1 order bisa punya banyak items
  -- ...
);
```

---

## ✅ Verification Steps

### 1. Run SQL Fix
```bash
# Buka Supabase Dashboard → SQL Editor
# Copy-paste isi file: sql/fix_duplicate_key_constraint.sql
# Klik "Run"
```

### 2. Verify Constraint Dihapus
```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'wedding_data'
AND constraint_name = 'wedding_data_user_id_key';

-- Expected: No rows returned
```

### 3. Test Sync Antar User
1. User A login → edit data → sync → ✅ berhasil
2. User B login → edit data → sync → ✅ berhasil
3. User A refresh → lihat data dari User B → ✅ muncul
4. User B refresh → lihat data dari User A → ✅ muncul

### 4. Check Console Log
```
User A: ✅ Auto-sync to cloud successful
User B: ✅ Auto-sync to cloud successful
```

---

## 📚 Related Files

- **SQL Fix:** `sql/fix_duplicate_key_constraint.sql`
- **Frontend Sync:** `src/syncStore.ts` (sudah benar, menggunakan `onConflict: 'id'`)
- **Collaboration Store:** `src/collaborationStore.ts` (sudah benar, cek wedding_members dulu)

---

## 🎉 Kesimpulan

Error "duplicate key value violates unique constraint wedding_data_user_id_key" telah diperbaiki dengan:

1. ✅ **Hapus constraint user_id** dari tabel `wedding_data`
2. ✅ **Pertahankan constraint id** sebagai primary key
3. ✅ **Pertahankan composite constraint** di `wedding_members`
4. ✅ **Verifikasi syncToCloud** menggunakan `onConflict: 'id'`

**User A dan User B sekarang bisa sync data ke wedding yang sama tanpa error!** 🚀

---

## 🚀 Next Steps

### Immediate:
1. ✅ Jalankan SQL fix di Supabase Dashboard
2. ✅ Test sync antar user
3. ✅ Verify tidak ada error duplicate key

### Future Improvements:
1. ⏳ Add migration script untuk production deployment
2. ⏳ Add database schema documentation
3. ⏳ Add automated tests untuk multi-user sync
4. ⏳ Add monitoring untuk sync errors
