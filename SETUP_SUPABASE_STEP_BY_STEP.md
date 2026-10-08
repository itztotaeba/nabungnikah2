# 🚀 Panduan Setup Supabase - Step by Step

## ⚠️ PENTING: Error yang Anda Alami

Error: **"Registrasi gagal: Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia."**

**Penyebab:** File `.env.local` belum diisi dengan credentials Supabase yang benar.

---

## 📋 Langkah 1: Buat Project di Supabase

### 1.1 Buka Supabase
- Buka browser dan kunjungi: **https://supabase.com**
- Klik tombol **"Start your project"** atau **"Sign In"**
- Login dengan GitHub/Google/Email

### 1.2 Buat Project Baru
- Klik tombol **"New Project"** (biasanya di dashboard utama)
- Isi form:
  - **Organization**: Pilih organisasi Anda (atau buat baru)
  - **Name**: `weddingplan` (atau nama apapun)
  - **Database Password**: Buat password yang kuat (CONTOH: `MyStrongPassword123!`)
    - ⚠️ **PENTING**: Simpan password ini! Anda akan membutuhkannya nanti
  - **Region**: Pilih **Southeast Asia (Singapore)** untuk performa terbaik di Indonesia
  - **Pricing Plan**: Free (cukup untuk development)
- Klik **"Create new project"**
- Tunggu ~2 menit sampai project selesai dibuat

---

## 📋 Langkah 2: Dapatkan Credentials

### 2.1 Buka Settings
- Setelah project selesai dibuat, Anda akan masuk ke dashboard project
- Di sidebar kiri, klik icon **Settings** (⚙️ gear icon)
- Klik menu **"API"**

### 2.2 Copy Project URL
- Di bagian **"Project URL"**, Anda akan melihat URL seperti:
  ```
  https://abcdefghijklmnop.supabase.co
  ```
- Klik tombol **"Copy"** di sebelah URL
- Simpan URL ini (akan digunakan untuk `VITE_SUPABASE_URL`)

### 2.3 Copy Anon Key
- Scroll ke bawah ke bagian **"Project API keys"**
- Di bagian **"anon public"**, Anda akan melihat key panjang seperti:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQ1NjQ4MDAsImV4cCI6MTk5MDE0MDgwMH0.signature-here
  ```
- Klik tombol **"Copy"** di sebelah key
- Simpan key ini (akan digunakan untuk `VITE_SUPABASE_ANON_KEY`)

⚠️ **PENTING**: 
- Gunakan **anon public** key (BUKAN service_role key)
- Key sangat panjang, pastikan ter-copy semua

---

## 📋 Langkah 3: Update File `.env.local`

### 3.1 Buka File `.env.local`
- Di root project Anda, buka file `.env.local`
- Jika belum ada, buat file baru dengan nama `.env.local`

### 3.2 Isi dengan Credentials Anda
Ganti isi file dengan:

```bash
# Supabase Configuration
# Ganti dengan credentials Anda dari Supabase Dashboard

VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQ1NjQ4MDAsImV4cCI6MTk5MDE0MDgwMH0.signature-here
```

**CONTOH NYATA:**
```bash
VITE_SUPABASE_URL=https://xyzabcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjQ4MDAsImV4cCI6MjAxMDY0MDgwMH0.abc123xyz
```

⚠️ **PENTING**:
- Gunakan prefix `VITE_` (BUKAN `NEXT_PUBLIC_`)
- Jangan ada spasi di sekitar `=`
- Jangan ada quote di sekitar value
- Pastikan URL dimulai dengan `https://`
- Pastikan key dimulai dengan `eyJ...`

---

## 📋 Langkah 4: Setup Database Table

### 4.1 Buka SQL Editor
- Di Supabase Dashboard, klik icon **SQL Editor** di sidebar kiri
- Klik tombol **"New Query"**

### 4.2 Copy dan Paste SQL Script
Copy script berikut dan paste di SQL Editor:

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

-- Create policies: Users can only access their own data
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

### 4.3 Jalankan SQL
- Klik tombol **"Run"** di pojok kanan bawah (atau tekan `Ctrl+Enter`)
- Tunggu sampai muncul **"Success. No rows returned"**
- Table `wedding_data` sudah terbuat!

---

## 📋 Langkah 5: Enable Email Authentication

### 5.1 Buka Authentication Settings
- Di Supabase Dashboard, klik icon **Authentication** di sidebar kiri
- Klik menu **"Providers"**

### 5.2 Enable Email Provider
- Cari **"Email"** di list providers
- Pastikan toggle **"Enable"** sudah ON (hijau)
- Klik **"Save"** jika ada perubahan

### 5.3 (Optional) Disable Email Confirmation
Untuk testing, Anda bisa disable email confirmation:
- Klik menu **"Email Templates"** di sidebar Authentication
- Klik tab **"Confirm signup"**
- (Atau lebih mudah) Di **Authentication** → **Providers** → **Email**
- Scroll ke bawah, cari **"Confirm email"**
- Toggle OFF untuk disable confirmation
- Klik **"Save"**

⚠️ **Catatan**: Untuk production, sebaiknya enable email confirmation untuk keamanan

---

## 📋 Langkah 6: Restart Development Server

### 6.1 Stop Server
- Di terminal, tekan `Ctrl+C` untuk stop server

### 6.2 Jalankan Ulang Server
```bash
npm run dev
```

### 6.3 Clear Browser Cache
- Buka browser
- Tekan `Ctrl+Shift+R` (hard refresh) untuk clear cache
- Atau buka **Developer Tools** (F12) → klik kanan di refresh button → **"Empty Cache and Hard Reload"**

---

## 📋 Langkah 7: Test Registrasi

### 7.1 Buka Aplikasi
- Buka browser di `http://localhost:5173`
- Klik **"Login untuk Cloud Sync"** di Settings

### 7.2 Test Sign Up
- Klik **"Daftar sekarang"**
- Isi form:
  - **Email**: `test@example.com` (atau email Anda)
  - **Password**: `password123` (minimal 6 karakter)
  - **Konfirmasi Password**: `password123`
- Klik **"Daftar"**

### 7.3 Check Console
Buka **Developer Console** (F12) dan lihat:

**Jika BERHASIL:**
```
🔧 Supabase Configuration:
  URL: https://xyzabcdefg.supabase.co
  Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📝 Attempting signup for: test@example.com
✅ Signup successful
```

**Jika GAGAL:**
```
❌ Signup error: [error message]
```

### 7.4 Check Supabase Dashboard
- Buka Supabase Dashboard
- Klik **Authentication** → **Users**
- User yang baru terdaftar harus muncul di list!

---

## 🐛 Troubleshooting

### Error: "Supabase tidak dikonfigurasi"

**Penyebab:** File `.env.local` tidak terbaca

**Solusi:**
1. Pastikan file `.env.local` ada di root project
2. Pastikan prefix `VITE_` (bukan `NEXT_PUBLIC_`)
3. Restart server (`Ctrl+C` lalu `npm run dev`)
4. Hard refresh browser (`Ctrl+Shift+R`)
5. Check console log, harus muncul:
   ```
   🔧 Supabase Configuration:
     URL: https://...
     Key: eyJ...
   ```

### Error: "Invalid API key"

**Penyebab:** Anon key salah atau tidak lengkap

**Solusi:**
1. Copy ulang anon key dari Supabase Dashboard
2. Pastikan key dimulai dengan `eyJ...`
3. Pastikan tidak ada spasi atau newline
4. Paste ulang ke `.env.local`
5. Restart server

### Error: "User already registered"

**Penyebab:** Email sudah terdaftar

**Solusi:**
1. Gunakan email lain
2. Atau hapus user di Supabase Dashboard → Authentication → Users

### Error: "Invalid login credentials"

**Penyebab:** Email atau password salah

**Solusi:**
1. Check email dan password
2. Password minimal 6 karakter
3. Jika lupa password, reset di Supabase Dashboard

### Error: "Failed to fetch"

**Penyebab:** URL Supabase salah atau network issue

**Solusi:**
1. Check URL di `.env.local`
2. Pastikan format: `https://xxxxx.supabase.co`
3. Buka URL di browser, harus bisa diakses
4. Check internet connection

---

## ✅ Checklist Setup

- [ ] Buat project di Supabase
- [ ] Copy Project URL dari Settings → API
- [ ] Copy anon public key dari Settings → API
- [ ] Update file `.env.local` dengan credentials
- [ ] Jalankan SQL script untuk create table
- [ ] Enable Email authentication
- [ ] (Optional) Disable email confirmation untuk testing
- [ ] Restart development server
- [ ] Hard refresh browser
- [ ] Check console log untuk verifikasi credentials
- [ ] Test Sign Up berhasil
- [ ] Check user muncul di Supabase Dashboard
- [ ] Test Sign In berhasil
- [ ] Test sync data ke cloud

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:

1. **Check Console Logs** - Buka F12 → Console, lihat error message
2. **Check Supabase Logs** - Dashboard → Logs → API
3. **Check Network Tab** - F12 → Network, lihat request ke Supabase
4. **Verify Credentials** - Pastikan URL dan Key benar dari Dashboard
5. **Clear Cache** - Hard refresh browser (Ctrl+Shift+R)

---

## 🎯 Contoh File `.env.local` yang Benar

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xyzabcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjQ4MDAsImV4cCI6MjAxMDY0MDgwMH0.abc123xyz
```

**Karakteristik file yang benar:**
- ✅ Prefix `VITE_`
- ✅ URL dimulai dengan `https://`
- ✅ Key dimulai dengan `eyJ...`
- ✅ Tidak ada spasi di sekitar `=`
- ✅ Tidak ada quote di sekitar value
- ✅ Setiap variable di baris terpisah

---

**Happy coding! 🎉**

Setelah setup selesai, Anda bisa:
- Register akun baru
- Login ke aplikasi
- Data otomatis sync ke cloud
- Akses dari perangkat lain
