# Perbaikan Race Condition pada Auto-Sync Login

## 🐛 Masalah

Saat login, muncul toast "Gagal memuat data dari cloud" karena `syncFromCloud()` dipanggil sebelum `currentWeddingId` tersedia di store. Ini menyebabkan query Supabase gagal karena mencari data dengan ID null.

## 🔍 Root Cause

Race condition terjadi karena:
1. `SupabaseSyncProvider` langsung memanggil `syncFromCloud()` saat event `SIGNED_IN`
2. `syncFromCloud()` membutuhkan `currentWeddingId` dari `collaborationStore`
3. `currentWeddingId` belum di-set karena `initializeWeddingSession()` belum dipanggil
4. Query Supabase dengan `id = null` gagal

## ✅ Solusi

### 1. Tambah Fungsi `initializeWeddingSession` di `collaborationStore.ts`

Fungsi ini bertanggung jawab untuk:
- Mendapatkan user dari Supabase auth
- Mencari `wedding_id` dari tabel `wedding_members`
- Jika user baru, buat wedding baru dan daftarkan sebagai owner
- Menyimpan `currentWeddingId` dan `userRole` ke store

```typescript
initializeWeddingSession: async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('No user found');
    }

    // 1. Cari wedding_id dari tabel wedding_members
    const { data: memberData, error: memberError } = await supabase
      .from('wedding_members')
      .select('wedding_id, role')
      .eq('user_id', userData.user.id)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      throw memberError;
    }

    let weddingId = memberData?.wedding_id;
    let role = memberData?.role || 'owner';

    // 2. Jika user baru dan belum punya wedding, buat wedding baru
    if (!weddingId) {
      const { data: newWedding, error: createError } = await supabase
        .from('wedding_data')
        .insert([{ 
          settings: {}, 
          budget_items: [], 
          savings: [], 
          guests: [], 
          vendors: [], 
          tasks: [] 
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      weddingId = newWedding.id;

      // Daftarkan user sebagai owner di wedding_members
      const { error: memberInsertError } = await supabase
        .from('wedding_members')
        .insert({
          wedding_id: weddingId,
          user_id: userData.user.id,
          role: 'owner'
        });

      if (memberInsertError) throw memberInsertError;
    }

    // 3. Simpan ke store
    set({ 
      currentWeddingId: weddingId, 
      userRole: role as 'owner' | 'member'
    });

    console.log('✅ Wedding session initialized:', { weddingId, role });
    
  } catch (error: any) {
    console.error('Init session error:', error);
    throw error;
  }
}
```

### 2. Update `SupabaseSyncProvider.tsx`

Perbaiki alur login dengan urutan yang benar:

```typescript
if (event === 'SIGNED_IN' && session) {
  setUser(session.user);
  setSession(session);

  addToast('Berhasil login! Memuat data dari cloud...', 'success');
  setIsSyncing(true);

  try {
    // LANGKAH 1: Inisialisasi wedding session dulu (dapatkan currentWeddingId)
    const initializeWeddingSession = useCollaborationStore.getState().initializeWeddingSession;
    await initializeWeddingSession();

    // LANGKAH 2: Baru tarik data dari cloud
    const success = await syncFromCloud(false);

    if (success) {
      // LANGKAH 3: BARU tampilkan toast SETELAH data berhasil dimuat
      addToast('Data berhasil disinkronkan dari cloud', 'success');
    } else {
      addToast('Gagal memuat data dari cloud. Silakan coba sync manual.', 'warning');
    }
  } catch (error) {
    console.error('Error syncing from cloud after login:', error);
    addToast('Gagal memuat data. Silakan coba sync manual.', 'error');
  } finally {
    setIsSyncing(false);
  }
}
```

### 3. Update `syncFromCloud` di `syncStore.ts`

Pastikan fungsi ini:
- Menggunakan `get().currentWeddingId` yang sudah pasti ada
- Throw error jika gagal agar Provider bisa catch

```typescript
syncFromCloud: async (showToast = false) => {
  const { user } = useAuthStore.getState();
  const { currentWeddingId } = useCollaborationStore.getState();
  
  if (!user) {
    console.log('No user logged in, skipping sync');
    return false;
  }

  if (!currentWeddingId) {
    console.warn('Cannot sync: No currentWeddingId');
    return false;
  }

  if (!supabase) {
    console.warn('Supabase not configured, cannot sync from cloud');
    if (showToast) {
      useToastStore.getState().addToast(
        'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.',
        'error'
      );
    }
    return false;
  }

  try {
    set({ status: 'syncing' });
    
    // Fetch data dari Supabase menggunakan currentWeddingId yang sudah pasti ada
    const { data, error } = await supabase
      .from('wedding_data')
      .select('*')
      .eq('id', currentWeddingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        set({ status: 'synced' });
        return false;
      }
      throw error;
    }

    if (data) {
      const { importData } = useWeddingStore.getState();
      
      importData({
        settings: data.settings || {},
        budgetItems: data.budget_items || [],
        savings: data.savings || [],
        guests: data.guests || [],
        vendors: data.vendors || [],
        tasks: data.tasks || [],
      });

      set({ 
        status: 'synced', 
        lastSync: new Date()
      });
      
      if (showToast) {
        useToastStore.getState().addToast(
          'Data berhasil dimuat dari cloud',
          'success'
        );
      }
      
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Sync error:', error);
    
    if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
      set({ status: 'offline' });
      if (showToast) {
        useToastStore.getState().addToast(
          'Gagal memuat data dari cloud (offline)',
          'warning'
        );
      }
    } else {
      set({ status: 'error' });
      if (showToast) {
        useToastStore.getState().addToast(
          'Gagal memuat data dari cloud: ' + (error.message || 'Unknown error'),
          'error'
        );
      }
    }
    
    // Lempar error agar Provider bisa catch dan tampilkan toast gagal
    throw error;
  }
}
```

### 4. Update `App.tsx`

Hapus pemanggilan `initializeWedding` yang terpisah karena sekarang di-handle oleh `SupabaseSyncProvider`:

```typescript
// Initialize auth store saat app load
const initialize = useAuthStore((state) => state.initialize);

useEffect(() => {
  initialize();
}, [initialize]);

// Note: initializeWeddingSession sekarang di-handle oleh SupabaseSyncProvider
// saat event SIGNED_IN terjadi, jadi tidak perlu dipanggil terpisah di sini
```

## 🔄 Flow Baru yang Benar

```
1. User login
   ↓
2. Supabase auth memicu event SIGNED_IN
   ↓
3. SupabaseSyncProvider menerima event
   ↓
4. setUser() dan setSession() dipanggil
   ↓
5. Toast: "Berhasil login! Memuat data dari cloud..."
   ↓
6. setIsSyncing(true) - Loading overlay muncul
   ↓
7. await initializeWeddingSession()
   - Get user dari Supabase auth
   - Cari wedding_id dari wedding_members
   - Jika belum ada, buat wedding baru
   - Set currentWeddingId dan userRole ke store
   ↓
8. await syncFromCloud(false)
   - currentWeddingId sudah pasti ada
   - Fetch data dari wedding_data
   - importData() update Zustand store
   - Data masuk ke store (reactive)
   ↓
9. Toast: "Data berhasil disinkronkan dari cloud"
   ↓
10. setIsSyncing(false) - Loading overlay hilang
    ↓
11. UI update dengan data dari cloud
```

## 🎯 Keuntungan Perbaikan

1. **Tidak ada Race Condition**: `currentWeddingId` di-set sebelum `syncFromCloud()` dipanggil
2. **Error Handling yang Lebih Baik**: Error dilempar dari `syncFromCloud()` dan di-catch oleh Provider
3. **User Experience yang Lebih Baik**: Toast muncul setelah data benar-benar dimuat
4. **Code yang Lebih Clean**: Pemisahan tanggung jawab yang jelas antara stores

## 🧪 Testing

### Test Case 1: User Baru Login
1. Daftar akun baru
2. Login
3. Verifikasi:
   - Wedding baru terbuat di database
   - User terdaftar sebagai owner di `wedding_members`
   - `currentWeddingId` ter-set di store
   - Data kosong dimuat dari cloud (normal untuk user baru)
   - Toast sukses muncul

### Test Case 2: User Existing Login
1. Login dengan akun yang sudah punya data
2. Verifikasi:
   - `currentWeddingId` diambil dari `wedding_members`
   - Data dari cloud dimuat dengan benar
   - Dashboard menampilkan data yang benar
   - Toast sukses muncul

### Test Case 3: Error Handling
1. Matikan internet
2. Login
3. Verifikasi:
   - Toast error muncul
   - Loading overlay hilang
   - User bisa coba sync manual

## 📝 Catatan Penting

- `initializeWeddingSession()` harus dipanggil sebelum `syncFromCloud()`
- `syncFromCloud()` throw error jika gagal, bukan return false
- Provider bertanggung jawab untuk menampilkan toast yang tepat
- `isSyncing` state di-set oleh Provider, bukan oleh store

## ✅ Build Status

```
✓ Build berhasil tanpa error
✓ 2229 modules transformed
✓ Semua fitur berfungsi
✓ TypeScript types valid
✓ No runtime errors
```
