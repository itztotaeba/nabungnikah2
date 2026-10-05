# Perbaikan Error Handling untuk Inisialisasi Wedding

## 📋 Ringkasan Perubahan

Perbaikan error handling pada proses inisialisasi wedding untuk menghindari toast error yang mengganggu pengguna. Semua operasi insert manual telah diganti dengan RPC call ke fungsi database `create_initial_wedding()`.

## 🎯 Masalah yang Diperbaiki

### 1. Toast Error yang Mengganggu
Saat user baru mendaftar dan login, jika terjadi error saat inisialisasi wedding, aplikasi menampilkan toast error yang mengganggu pengalaman pengguna.

**Solusi:** Menghilangkan toast error dan hanya menggunakan `console.error()` untuk logging.

### 2. Insert Manual yang Sering Gagal
Fungsi `initializeWedding` dan `initializeWeddingSession` masih menggunakan insert manual ke tabel `wedding_data` dan `wedding_members`, yang sering kali gagal karena RLS policy.

**Solusi:** Mengganti semua insert manual dengan RPC call ke fungsi database `create_initial_wedding()`.

## 🔧 Perubahan Kode

### File: `src/components/SupabaseSyncProvider.tsx`

**Sebelum:**
```typescript
catch (error) {
  console.error('Error syncing from cloud after login:', error);
  addToast('Gagal memuat data. Silakan coba sync manual.', 'error');
}
```

**Sesudah:**
```typescript
catch (error) {
  // Jangan tampilkan toast error saat inisialisasi wedding gagal
  // Cukup log ke console agar tidak mengganggu pengguna
  console.error('Gagal inisialisasi wedding:', error);
  console.log('User bisa melakukan sync manual nanti jika diperlukan');
}
```

### File: `src/collaborationStore.ts`

#### Fungsi: `initializeWedding`

**Sebelum:**
```typescript
// Insert wedding_data baru
const { data: newWedding, error: weddingError } = await supabase
  .from('wedding_data')
  .insert({
    user_id: user.id,
    settings: {},
    budget_items: [],
    savings: [],
    guests: [],
    vendors: [],
    tasks: [],
  })
  .select()
  .single();

if (weddingError) throw weddingError;

// Insert ke wedding_members sebagai owner
const { error: memberInsertError } = await supabase
  .from('wedding_members')
  .insert({
    wedding_id: newWedding.id,
    user_id: user.id,
    role: 'owner',
  });

if (memberInsertError) throw memberInsertError;
```

**Sesudah:**
```typescript
// Panggil fungsi database yang bypass RLS
const { data: newWeddingId, error: createError } = await supabase
  .rpc('create_initial_wedding');

if (createError) {
  console.error('RPC Error:', createError);
  throw createError;
}

if (!newWeddingId) {
  throw new Error('RPC did not return wedding_id');
}
```

#### Fungsi: `initializeWeddingSession`

Sudah menggunakan RPC call dari perubahan sebelumnya.

#### Error Handling

**Sebelum:**
```typescript
catch (error: any) {
  console.error('Error initializing wedding:', error);
  set({ isLoading: false });
  useToastStore.getState().addToast(
    'Gagal menginisialisasi wedding: ' + (error.message || 'Unknown error'),
    'error'
  );
}
```

**Sesudah:**
```typescript
catch (error: any) {
  // Jangan tampilkan toast error, cukup log ke console
  console.error('Gagal inisialisasi wedding:', error);
  console.log('User bisa melakukan sync manual nanti jika diperlukan');
  set({ isLoading: false });
}
```

## 📊 Perbandingan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Toast Error** | Menampilkan toast error | Hanya console.error |
| **User Experience** | Mengganggu | Tidak mengganggu |
| **Insert Method** | Manual insert | RPC call |
| **RLS Bypass** | Sering gagal | Bypass dengan RPC |
| **Error Recovery** | User harus reload | User bisa sync manual |

## 🎯 Keuntungan Perubahan

### 1. User Experience Lebih Baik
- Tidak ada toast error yang mengganggu saat inisialisasi gagal
- Aplikasi tetap berjalan meskipun inisialisasi gagal
- User bisa melakukan sync manual nanti jika diperlukan

### 2. Lebih Reliable
- RPC call bypass RLS policy
- Atomic operation di database
- Konsisten dengan fungsi `initializeWeddingSession`

### 3. Lebih Mudah Debug
- Error di-log ke console untuk developer
- User tidak terganggu dengan error message
- Bisa trace error di browser console

## 🧪 Testing

### Test Case 1: User Baru Mendaftar (Normal Flow)

1. Register akun baru
2. Login dengan akun baru
3. Check console log:
   ```
   🆕 Creating new wedding for user via RPC...
   ✅ New wedding created via RPC: <uuid>
   ```
4. Verifikasi:
   - ✅ Tidak ada toast error
   - ✅ Wedding terbuat dengan benar
   - ✅ User terdaftar sebagai owner
   - ✅ Data dari cloud berhasil di-load

### Test Case 2: User Baru Mendaftar (Error Flow)

1. Register akun baru
2. Matikan koneksi internet
3. Login dengan akun baru
4. Check console log:
   ```
   Gagal inisialisasi wedding: <error message>
   User bisa melakukan sync manual nanti jika diperlukan
   ```
5. Verifikasi:
   - ✅ Tidak ada toast error
   - ✅ Aplikasi tetap berjalan
   - ✅ User bisa login tanpa error
   - ✅ User bisa sync manual nanti

### Test Case 3: User Existing Login

1. Login dengan akun yang sudah punya wedding
2. Check console log:
   ```
   ✅ User already has wedding: <uuid>
   ```
3. Verifikasi:
   - ✅ Tidak ada RPC call (karena sudah punya wedding)
   - ✅ Data dari cloud berhasil di-load
   - ✅ Tidak ada toast error

### Test Case 4: Manual Sync

1. Login dengan akun yang inisialisasinya gagal
2. Buka Settings → Cloud Sync
3. Klik "Sync Sekarang"
4. Verifikasi:
   - ✅ Sync berhasil
   - ✅ Data dari cloud di-load
   - ✅ Toast sukses muncul

## 🔒 Keamanan

### RPC Function: `create_initial_wedding()`

Fungsi database ini harus memiliki:
- `SECURITY DEFINER` - Bypass RLS
- `SET search_path = ''` - Mencegah schema attack
- Validasi `auth.uid()` - Pastikan user terautentikasi
- Atomic operation - Semua insert dalam satu transaksi

### Contoh Fungsi Database

```sql
CREATE OR REPLACE FUNCTION public.create_initial_wedding()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  new_wedding_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create new wedding
  INSERT INTO public.wedding_data (user_id, settings, budget_items, savings, guests, vendors, tasks)
  VALUES (current_user_id, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  RETURNING id INTO new_wedding_id;
  
  -- Add user as owner
  INSERT INTO public.wedding_members (wedding_id, user_id, role)
  VALUES (new_wedding_id, current_user_id, 'owner');
  
  RETURN new_wedding_id;
END;
$function$;
```

## 📝 Best Practices

### 1. Error Handling
- ✅ Gunakan `console.error()` untuk logging error
- ✅ Jangan tampilkan toast error untuk error yang bisa di-recover
- ✅ Berikan informasi yang jelas di console untuk debugging

### 2. User Experience
- ✅ Biarkan aplikasi tetap berjalan meskipun ada error
- ✅ Berikan opsi untuk recovery (sync manual)
- ✅ Jangan mengganggu user dengan error message yang tidak perlu

### 3. Database Operations
- ✅ Gunakan RPC untuk operasi yang butuh bypass RLS
- ✅ Pastikan fungsi database memiliki `SECURITY DEFINER`
- ✅ Validasi user authentication di dalam fungsi database

## 🐛 Troubleshooting

### Error: "function create_initial_wedding() does not exist"

**Solusi:**
1. Check apakah fungsi sudah dibuat di Supabase
2. Buka SQL Editor dan jalankan fungsi `create_initial_wedding()`
3. Verifikasi dengan: `SELECT * FROM pg_proc WHERE proname = 'create_initial_wedding';`

### Error: "permission denied for function create_initial_wedding"

**Solusi:**
1. Check apakah fungsi memiliki `SECURITY DEFINER`
2. Check apakah owner fungsi adalah `postgres` atau `service_role`
3. Grant permission: `GRANT EXECUTE ON FUNCTION create_initial_wedding() TO authenticated;`

### Error: "Not authenticated"

**Solusi:**
1. Pastikan user sudah login
2. Check `auth.uid()` return value
3. Verify session token valid

## 📚 Referensi

- [Supabase RPC Documentation](https://supabase.com/docs/reference/javascript/rpc)
- [PostgreSQL Security Definer](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist

- [x] Update `SupabaseSyncProvider.tsx` - Hilangkan toast error
- [x] Update `initializeWedding` - Ganti insert manual dengan RPC
- [x] Update `initializeWeddingSession` - Sudah menggunakan RPC
- [x] Update error handling - Hanya console.error
- [x] Build project berhasil
- [ ] Test user baru register & login
- [ ] Test error flow (offline)
- [ ] Test manual sync
- [ ] Verify database records
- [ ] Monitor console logs

## 🎉 Kesimpulan

Perbaikan error handling berhasil dilakukan dengan:

1. ✅ Menghilangkan toast error yang mengganggu
2. ✅ Mengganti semua insert manual dengan RPC call
3. ✅ Menggunakan `console.error()` untuk logging
4. ✅ Memastikan aplikasi tetap berjalan meskipun ada error
5. ✅ Memberikan opsi recovery (sync manual)

**User experience sekarang lebih baik dan tidak terganggu oleh error message yang tidak perlu!** 🚀
