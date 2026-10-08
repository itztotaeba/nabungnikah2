# 🌐 Panduan Implementasi Cloud Sync - WeddingPlan

## 📋 Ringkasan Implementasi

Fitur Cloud Sync telah berhasil diimplementasikan menggunakan **Supabase** sebagai backend. Aplikasi sekarang mendukung:
- ✅ Autentikasi user (Login/Register)
- ✅ Sinkronisasi data otomatis ke cloud
- ✅ Fallback ke LocalStorage saat offline
- ✅ Indikator status sync real-time
- ✅ Manual sync buttons

---

## 🏗️ Struktur File Baru

```
src/
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── authStore.ts              # Auth state management (Zustand)
├── syncStore.ts              # Sync state & logic (Zustand)
├── vite-env.d.ts             # TypeScript env declarations
└── components/
    ├── AuthPage.tsx          # Login/Register UI
    └── SyncIndicator.tsx     # Sync status indicator
```

---

## 🔧 Konfigurasi Environment

### 1. Buat file `.env.local` di root project:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara mendapatkan credentials:**
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard/)
2. Pilih project Anda
3. Go to **Settings** → **API**
4. Copy **Project URL** dan **anon/public key**

### 2. Setup Database Table

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- Create wedding_data table
CREATE TABLE IF NOT EXISTS wedding_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  budget_items JSONB DEFAULT '[]',
  savings JSONB DEFAULT '[]',
  guests JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wedding_data ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only access their own data
CREATE POLICY "Users can view own data"
  ON wedding_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON wedding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON wedding_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON wedding_data FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🎯 Fitur yang Diimplementasikan

### 1. **Autentikasi (AuthPage.tsx)**

**Fitur:**
- Toggle antara mode Login dan Register
- Validasi email dan password
- Error handling untuk kredensial salah
- Auto-redirect ke dashboard setelah login berhasil

**UI:**
- Design elegan dengan gradient background
- Icon dari lucide-react (Mail, Lock, LogIn, UserPlus)
- Responsive untuk mobile dan desktop

### 2. **Proteksi Halaman (App.tsx)**

**Logic:**
```typescript
if (!user) {
  return <AuthPage />;
}
```

- Jika user belum login → tampilkan AuthPage
- Jika user sudah login → tampilkan Dashboard
- Loading state saat initialize auth

### 3. **Auto-Sync (syncStore.ts)**

**Mekanisme:**
1. Setiap kali state weddingStore berubah → trigger auto-sync
2. Debounce 2 detik untuk menghindari terlalu banyak request
3. Upsert data ke Supabase berdasarkan `user_id`
4. Jika offline/error → simpan di LocalStorage + tampilkan warning

**Code:**
```typescript
useEffect(() => {
  const unsubscribe = useWeddingStore.subscribe(() => {
    triggerAutoSync();
  });
  return () => unsubscribe();
}, []);
```

### 4. **Sync Indicator (SyncIndicator.tsx)**

**Status:**
- 🟢 **Tersinkron** (hijau) - Data berhasil sync
- 🟡 **Menyimpan...** (kuning + spinning) - Sedang sync
- 🔴 **Offline** (merah) - Tidak ada koneksi
- 🔴 **Error** (merah) - Gagal sync

**Lokasi:** Pojok kanan atas header

### 5. **Manual Sync Buttons (Settings.tsx)**

**Tombol:**
1. **Sync Sekarang** - Upload data lokal ke cloud
2. **Muat dari Cloud** - Download data dari cloud ke lokal

**Konfirmasi:**
- Jika data lokal ada → tampilkan konfirmasi sebelum replace
- Toast notification untuk feedback

### 6. **Logout Button**

**Lokasi:** Footer sidebar (desktop) dan mobile menu

**Action:**
```typescript
await supabase.auth.signOut();
```

---

## 🔄 Flow Sinkronisasi

### **Saat User Login:**
```
1. Check LocalStorage → ada data?
2. Jika YA → tampilkan dialog "Upload ke Cloud?"
3. Jika user confirm → syncToCloud()
4. Jika LocalStorage kosong → syncFromCloud()
```

### **Saat Data Berubah:**
```
1. User edit budget/guest/savings
2. Trigger auto-sync (debounce 2s)
3. syncToCloud() → upsert ke Supabase
4. Update status indicator
5. Jika error → fallback ke LocalStorage
```

### **Saat Offline:**
```
1. Detect navigator.onLine = false
2. Simpan perubahan di LocalStorage
3. Tampilkan warning "Data disimpan lokal"
4. Saat online kembali → auto-sync
```

---

## 🛡️ Security

### Row Level Security (RLS)

Setiap user hanya bisa akses data mereka sendiri:

```sql
-- Policy: Users can only SELECT their own data
USING (auth.uid() = user_id)

-- Policy: Users can only INSERT their own data
WITH CHECK (auth.uid() = user_id)

-- Policy: Users can only UPDATE their own data
USING (auth.uid() = user_id)
```

### Data Isolation

- `user_id` adalah primary key
- Foreign key reference ke `auth.users`
- ON DELETE CASCADE → hapus user = hapus data

---

## 📊 Struktur Data di Supabase

**Table: `wedding_data`**

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Primary key, reference ke auth.users |
| `settings` | JSONB | Wedding settings (date, currency) |
| `budget_items` | JSONB | Array of budget items |
| `savings` | JSONB | Array of savings entries |
| `guests` | JSONB | Array of guests |
| `updated_at` | TIMESTAMP | Last update time |

**Example Data:**
```json
{
  "user_id": "abc123...",
  "settings": {
    "weddingDate": "2025-12-31",
    "currency": "IDR"
  },
  "budget_items": [
    {
      "id": "item1",
      "category": "Venue",
      "itemName": "Gedung Serbaguna",
      "estimatedCost": 50000000,
      "actualCost": 45000000,
      "status": "DP"
    }
  ],
  "savings": [...],
  "guests": [...],
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

## 🎨 UI/UX Improvements

### 1. **Auth Page**
- Gradient background (Sage Green theme)
- Clean form dengan icon
- Toggle animation antara Login/Register
- Loading state saat submit

### 2. **Sync Indicator**
- Real-time status update
- Warna intuitif (hijau/kuning/merah)
- Timestamp last sync
- Compact design

### 3. **Settings Page**
- Section baru "Cloud Sync"
- 2 tombol manual sync
- Info box dengan tips
- Disabled state saat syncing

---

## 🧪 Testing Checklist

### Authentication
- [ ] Register dengan email baru → sukses
- [ ] Register dengan email sudah ada → error message
- [ ] Login dengan kredensial benar → redirect ke dashboard
- [ ] Login dengan password salah → error message
- [ ] Logout → redirect ke auth page

### Sync
- [ ] Edit budget → auto-sync ke cloud
- [ ] Check Supabase dashboard → data updated
- [ ] Login di device lain → data muncul
- [ ] Offline mode → data tersimpan lokal
- [ ] Online kembali → auto-sync
- [ ] Manual sync → data ter-upload
- [ ] Load from cloud → data ter-download

### Edge Cases
- [ ] LocalStorage ada data, cloud kosong → dialog upload
- [ ] LocalStorage kosong, cloud ada data → auto-load
- [ ] Kedua-duanya ada data → konfirmasi replace
- [ ] Network error → warning toast
- [ ] Supabase down → fallback ke LocalStorage

---

## 🚀 Deployment

### 1. Set Environment Variables di Vercel/Netlify

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Update Supabase URL di Production

- Go to Supabase Dashboard → Settings → API
- Copy Production URL
- Update di environment variables

### 3. Test Production Build

```bash
npm run build
npm run preview
```

---

## 📝 Catatan Penting

### ⚠️ Limitations

1. **Supabase Free Tier:**
   - 500MB database
   - 1GB bandwidth/month
   - 50,000 monthly active users

2. **Auto-Sync:**
   - Debounce 2 detik untuk efisiensi
   - Tidak sync real-time (perlu refresh)

3. **Conflict Resolution:**
   - Last-write-wins (data terbaru yang menang)
   - Tidak ada merge conflict detection

### 💡 Best Practices

1. **Backup Rutin:**
   - Gunakan fitur Export JSON di Settings
   - Download backup mingguan

2. **Monitor Usage:**
   - Check Supabase Dashboard → Database → Size
   - Monitor bandwidth usage

3. **Error Handling:**
   - Selalu check network status
   - Tampilkan feedback ke user
   - Fallback ke LocalStorage

---

## 🔮 Future Enhancements

### Phase 2 (Optional)
- [ ] Real-time sync dengan Supabase Realtime
- [ ] Conflict resolution UI
- [ ] Version history
- [ ] Share data dengan partner (collaborative editing)
- [ ] Push notification saat data di-update

### Phase 3 (Advanced)
- [ ] Multi-device sync dengan conflict detection
- [ ] Encrypted data at rest
- [ ] Audit log untuk perubahan data
- [ ] Export to Google Sheets/Excel
- [ ] Integration dengan payment gateway

---

## 📞 Support

Jika ada masalah:
1. Check browser console untuk error
2. Verify Supabase credentials di `.env.local`
3. Check RLS policies di Supabase dashboard
4. Test dengan fresh browser (clear cache)

---

## ✅ Status Implementasi

| Fitur | Status | Notes |
|-------|--------|-------|
| Supabase Client | ✅ Complete | `src/lib/supabase.ts` |
| Auth Store | ✅ Complete | `src/authStore.ts` |
| Sync Store | ✅ Complete | `src/syncStore.ts` |
| Auth Page UI | ✅ Complete | `src/components/AuthPage.tsx` |
| Sync Indicator | ✅ Complete | `src/components/SyncIndicator.tsx` |
| App Protection | ✅ Complete | Updated `src/App.tsx` |
| Settings Sync UI | ✅ Complete | Updated `src/components/Settings.tsx` |
| Build Success | ✅ Complete | No TypeScript errors |

---

**Implementasi selesai! 🎉**

Aplikasi WeddingPlan sekarang memiliki fitur Cloud Sync lengkap dengan autentikasi, auto-sync, dan fallback ke LocalStorage.
