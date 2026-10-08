# 🔧 Setup Supabase untuk WeddingPlan

## ⚠️ PENTING: Perbedaan Vite vs Next.js

Project ini menggunakan **Vite + React**, BUKAN Next.js. Jadi ada perbedaan penting:

| Framework | Environment Variable | Cara Akses |
|-----------|---------------------|------------|
| **Next.js** | `NEXT_PUBLIC_SUPABASE_URL` | `process.env.NEXT_PUBLIC_SUPABASE_URL` |
| **Vite** | `VITE_SUPABASE_URL` | `import.meta.env.VITE_SUPABASE_URL` |

---

## 📋 Langkah-langkah Setup

### 1. Buat Project di Supabase

1. Buka [supabase.com](https://supabase.com)
2. Login/Daftar akun
3. Klik "New Project"
4. Isi detail project:
   - Name: `weddingplan`
   - Database Password: (simpan baik-baik!)
   - Region: Singapore (atau yang terdekat)
5. Tunggu project selesai dibuat (~2 menit)

### 2. Dapatkan Credentials

1. Buka project yang baru dibuat
2. Klik icon **Settings** (gear) di sidebar kiri
3. Klik **API**
4. Copy 2 nilai ini:
   - **Project URL** (contoh: `https://abcdefg.supabase.co`)
   - **anon public key** (contoh: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Setup Environment Variables

Buka file `.env.local` di root project dan isi:

```bash
# Ganti dengan credentials Anda dari Supabase
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ PENTING:**
- Gunakan prefix `VITE_` (BUKAN `NEXT_PUBLIC_`)
- Jangan commit `.env.local` ke Git (sudah ada di `.gitignore`)
- Restart development server setelah mengubah `.env.local`

### 4. Setup Database Table

1. Di Supabase Dashboard, klik **SQL Editor** di sidebar
2. Klik **New Query**
3. Copy-paste SQL berikut:

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

-- Create policies
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

4. Klik **Run** (atau tekan Ctrl+Enter)

### 5. Enable Email Auth

1. Di Supabase Dashboard, klik **Authentication** di sidebar
2. Klik **Providers**
3. Pastikan **Email** sudah enabled
4. Optional: Konfigurasi email template di **Email Templates**

### 6. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Kemudian jalankan lagi
npm run dev
```

---

## 🧪 Testing Setup

### Test 1: Check Console Logs

Buka browser dan buka halaman `/auth`. Buka **Developer Console** (F12) dan lihat:

```
🔧 Supabase Configuration:
  URL: https://abcdefg.supabase.co
  Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔍 AuthPage - Supabase URL: https://abcdefg.supabase.co
🔍 AuthPage - Supabase Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Jika URL dan Key muncul dengan benar, berarti environment variables terbaca! ✅

### Test 2: Sign Up

1. Buka halaman `/auth`
2. Klik "Daftar sekarang"
3. Isi email dan password
4. Klik "Daftar"
5. Lihat console:
   - `📝 Attempting signup for: your@email.com`
   - `✅ Signup successful` (jika berhasil)
   - `❌ Signup error: ...` (jika gagal)

### Test 3: Check Supabase Dashboard

1. Buka Supabase Dashboard
2. Klik **Authentication** → **Users**
3. User yang baru terdaftar harus muncul di list

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Penyebab:** Environment variables tidak terbaca atau URL salah

**Solusi:**
1. Check file `.env.local` sudah ada dan isi benar
2. Pastikan prefix `VITE_` (bukan `NEXT_PUBLIC_`)
3. Restart development server
4. Clear browser cache (Ctrl+Shift+R)
5. Check console logs untuk melihat URL yang terbaca

### Error: "Missing Supabase credentials"

**Penyebab:** File `.env.local` tidak ada atau kosong

**Solusi:**
1. Buat file `.env.local` di root project
2. Isi dengan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
3. Restart server

### Error: "Invalid API key"

**Penyebab:** Anon key salah atau expired

**Solusi:**
1. Copy ulang anon key dari Supabase Dashboard
2. Paste ke `.env.local`
3. Restart server

### Error: "User already registered"

**Penyebab:** Email sudah terdaftar di Supabase

**Solusi:**
1. Gunakan email lain
2. Atau hapus user di Supabase Dashboard → Authentication → Users

### Error: "Invalid login credentials"

**Penyebab:** Email atau password salah

**Solusi:**
1. Check email dan password
2. Jika lupa password, gunakan fitur "Forgot password" di Supabase

---

## 📊 Verifikasi Data di Supabase

### Check Table Data

1. Buka Supabase Dashboard
2. Klik **Table Editor** di sidebar
3. Klik table `wedding_data`
4. Lihat data yang tersimpan

### Check Auth Users

1. Klik **Authentication** di sidebar
2. Klik **Users**
3. Lihat list user yang terdaftar

---

## 🔒 Security Notes

### Row Level Security (RLS)

Table `wedding_data` sudah di-setup dengan RLS:
- Setiap user hanya bisa akses data mereka sendiri
- Policy menggunakan `auth.uid() = user_id`
- Data otomatis ter-isolate per user

### Environment Variables

- `.env.local` **JANGAN** di-commit ke Git
- Sudah ada di `.gitignore`
- Untuk production, set environment variables di hosting platform (Vercel/Netlify)

---

## 🚀 Deployment

### Vercel

1. Buka project di Vercel Dashboard
2. Klik **Settings** → **Environment Variables**
3. Tambahkan:
   - `VITE_SUPABASE_URL` = your-supabase-url
   - `VITE_SUPABASE_ANON_KEY` = your-anon-key
4. Redeploy project

### Netlify

1. Buka site di Netlify Dashboard
2. Klik **Site settings** → **Environment variables**
3. Tambahkan:
   - `VITE_SUPABASE_URL` = your-supabase-url
   - `VITE_SUPABASE_ANON_KEY` = your-anon-key
4. Redeploy site

---

## 📞 Support

Jika masih ada masalah:

1. **Check Console Logs** - Lihat error message di browser console
2. **Check Supabase Logs** - Di Dashboard → Logs → API
3. **Check Network Tab** - Di browser DevTools → Network
4. **Verify Credentials** - Pastikan URL dan Key benar dari Supabase Dashboard

---

## ✅ Checklist Setup

- [ ] Buat project di Supabase
- [ ] Copy Project URL dan Anon Key
- [ ] Buat file `.env.local` dengan prefix `VITE_`
- [ ] Jalankan SQL script untuk create table
- [ ] Enable Email Auth di Supabase
- [ ] Restart development server
- [ ] Check console logs untuk verifikasi
- [ ] Test Sign Up berhasil
- [ ] Check user muncul di Supabase Dashboard
- [ ] Test Sign In berhasil
- [ ] Test data sync ke cloud

---

**Happy coding! 🎉**
