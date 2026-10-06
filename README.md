# 💒 Nabung Nikah - Wedding Planner

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-3178C6.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.98.0-3ECF8E.svg)

**Aplikasi Wedding Planner modern dengan fitur kolaborasi multi-user, realtime sync, dan manajemen anggaran yang komprehensif.**

[Fitur](#-fitur-utama) • [Setup](#-panduan-setup-lokal) • [Dokumentasi](#-dokumentasi) • [Kontribusi](#-kontribusi)

</div>

---

## 📋 Deskripsi

**Nabung Nikah** adalah aplikasi web modern yang dirancang khusus untuk membantu calon pengantin dalam merencanakan pernikahan mereka. Aplikasi ini menyediakan fitur lengkap mulai dari manajemen anggaran, tracking tabungan, manajemen vendor, daftar tamu, timeline tugas, hingga kolaborasi realtime antara pasangan.

Dengan antarmuka yang elegan dan intuitif, Nabung Nikah membuat perencanaan pernikahan menjadi lebih terorganisir, transparan, dan menyenangkan.

---

## 🚀 Fitur Utama

### 💰 Manajemen Anggaran & Tabungan
- **Budget Tracking**: Kelola anggaran pernikahan dengan detail per kategori
- **Savings Tracker**: Lacak progress tabungan dengan visualisasi chart
- **Overbudget Alert**: Peringatan otomatis saat pengeluaran melebihi anggaran
- **Emergency Buffer**: Dana darurat otomatis 15% dari total anggaran
- **Export to Excel**: Download laporan anggaran dalam format Excel

### 👥 Kolaborasi Multi-User
- **Realtime Sync**: Sinkronisasi data realtime antara pasangan
- **Role-Based Access**: Owner dan Member dengan permission berbeda
- **Invite System**: Undang pasangan via email untuk kolaborasi
- **Conflict Detection**: Deteksi dan resolusi konflik edit bersamaan
- **Audit Trail**: Track siapa yang mengubah data dan kapan

### 🏢 Manajemen Vendor
- **Vendor Database**: Kelola daftar vendor pernikahan
- **Payment Tracking**: Lacak DP dan pelunasan pembayaran
- **Comparison Analysis**: Bandingkan paket All-in vs Satuan
- **Deadline Calendar**: Kalender visual untuk jatuh tempo pembayaran
- **Contact Management**: Simpan kontak WhatsApp dan email vendor

### 📋 Timeline & Task Management
- **23 Default Tasks**: Checklist standar pernikahan Indonesia
- **Custom Tasks**: Tambah tugas custom sesuai kebutuhan
- **Task Assignment**: Bagi tugas antara Pria, Wanita, atau Bersama
- **Progress Tracking**: Lihat progress penyelesaian tugas
- **Timeline View**: Visualisasi timeline berdasarkan bulan

### 👨‍👩‍👧‍👦 Manajemen Tamu
- **Guest List**: Kelola daftar tamu undangan
- **RSVP Tracking**: Lacak status kehadiran tamu
- **Category Management**: Kategorikan tamu (Keluarga, Teman, Rekan Kerja)
- **Gift Estimation**: Estimasi angpao dari tamu
- **Pax Management**: Kelola jumlah pax per tamu

### 📊 Dashboard & Visualisasi
- **Countdown Timer**: Hitung mundur menuju hari pernikahan
- **Progress Charts**: Visualisasi progress dengan grafik
- **Budget Breakdown**: Ringkasan anggaran per kategori
- **Task Statistics**: Statistik penyelesaian tugas
- **Financial Overview**: Overview keuangan pernikahan

### 🔐 Keamanan & Backup
- **Cloud Sync**: Sinkronisasi data ke Supabase Cloud
- **Local Backup**: Backup data ke LocalStorage
- **Export/Import JSON**: Backup dan restore data dalam format JSON
- **Export PDF**: Generate laporan dalam format PDF
- **Data Encryption**: Data terenkripsi di Supabase

### 🎨 User Experience
- **Responsive Design**: Tampilan optimal di desktop, tablet, dan mobile
- **Dark Mode**: Mode gelap untuk kenyamanan mata
- **Custom Avatar**: Upload foto profil user
- **Toast Notifications**: Notifikasi yang informatif
- **Smooth Animations**: Animasi yang halus dan elegan

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Library UI utama
- **TypeScript 5.7.0** - Type safety
- **Vite 6.3.5** - Build tool dan dev server
- **Tailwind CSS 4.1.7** - Utility-first CSS framework
- **Zustand 5.0.15** - State management
- **React Router 6.8.0** - Client-side routing

### Backend & Database
- **Supabase 2.98.0** - Backend as a Service
  - PostgreSQL database
  - Realtime subscriptions
  - Authentication
  - Storage untuk avatar
  - Row Level Security (RLS)

### Libraries & Tools
- **date-fns 2.30.0** - Date manipulation
- **recharts 2.10.0** - Data visualization
- **jspdf 4.2.1** - PDF generation
- **xlsx 0.18.5** - Excel export
- **lucide-react 0.294.0** - Icon library
- **framer-motion 11.16.1** - Animation library
- **uuid 9.0.1** - Unique ID generation

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## 📦 Panduan Setup Lokal

### Prasyarat
- Node.js 18+ dan npm
- Git
- Akun Supabase (gratis)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/nabung-nikah.git
cd nabung-nikah
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard/)
2. Dapatkan **Project URL** dan **Anon Key** dari Settings → API
3. Jalankan SQL migrations di Supabase SQL Editor:

```bash
# Jalankan file SQL secara berurutan
sql/001_multi_user_migration.sql
sql/002_add_vendors_column.sql
sql/003_add_tasks_column.sql
sql/004_fix_ambiguous_column.sql
sql/005_fix_duplicate_key_constraint.sql
sql/006_setup_user_avatar.sql
```

4. Buat Storage bucket `avatars` (public)

### 4. Konfigurasi Environment

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Isi variabel environment di file `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara mendapatkan credentials:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Go to **Settings** → **API**
4. Copy **Project URL** → paste ke `VITE_SUPABASE_URL`
5. Copy **anon public key** → paste ke `VITE_SUPABASE_ANON_KEY`

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 6. Build untuk Production

```bash
npm run build
```

Output akan ada di folder `dist/`

### 7. Preview Production Build

```bash
npm run preview
```

---

## 🔧 Konfigurasi Environment

### Variabel yang Dibutuhkan

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | URL project Supabase Anda | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon public key dari Supabase | ✅ Yes |

### Contoh File `.env`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjQ4MDAsImV4cCI6MjAxMDY0MDgwMH0.abc123xyz
```

### Keamanan Environment

⚠️ **PENTING:**
- Jangan commit file `.env` ke Git
- File `.env` sudah ada di `.gitignore`
- Gunakan `.env.example` sebagai template
- Untuk production, set environment variables di Vercel/Netlify dashboard

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder [`docs/`](./docs/):

### Setup & Configuration
- [Setup Supabase](./docs/SETUP_SUPABASE.md) - Panduan setup Supabase
- [Cloud Sync Guide](./docs/CLOUD_SYNC_GUIDE.md) - Panduan Cloud Sync
- [Multi-User Collaboration](./docs/MULTI_USER_COLLABORATION.md) - Fitur kolaborasi

### Fitur Utama
- [Dashboard Visualization](./docs/DASHBOARD_VISUALIZATION.md) - Visualisasi dashboard
- [Vendor Management](./docs/VENDOR_MANAGEMENT.md) - Manajemen vendor
- [Task Assignment](./docs/TASK_ASSIGNMENT.md) - Pembagian tugas
- [Timeline & Todo](./docs/TIMELINE_TODO.md) - Timeline dan checklist
- [Emergency Buffer](./docs/EMERGENCY_BUFFER.md) - Dana darurat
- [Overbudget Alert](./docs/OVERBUDGET_ALERT.md) - Peringatan overbudget
- [Excel Export](./docs/EXCEL_EXPORT.md) - Export ke Excel
- [User Avatar](./docs/USER_AVATAR_FEATURE.md) - Fitur avatar user

### UI/UX
- [Theme Migration](./docs/THEME_MIGRATION.md) - Migrasi tema
- [Font Migration](./docs/FONT_MIGRATION.md) - Migrasi font
- [Logo Personalization](./docs/LOGO_PERSONALIZATION.md) - Personalisasi logo
- [Mobile Navigation](./docs/MOBILE_NAVIGATION_UX.md) - Navigasi mobile

---

## 🗄️ Database Schema

### Tabel Utama

#### `wedding_data`
Menyimpan data wedding utama (anggaran, tabungan, tamu, vendor, tugas)

```sql
CREATE TABLE wedding_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  settings JSONB,
  budget_items JSONB,
  savings JSONB,
  guests JSONB,
  vendors JSONB,
  tasks JSONB,
  updated_at TIMESTAMPTZ
);
```

#### `wedding_members`
Menyimpan relasi multi-user ke wedding

```sql
CREATE TABLE wedding_members (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES wedding_data(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ,
  UNIQUE(wedding_id, user_id)
);
```

#### `profiles`
Menyimpan informasi profil user

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 🚀 Deployment

### Deploy ke Vercel

1. Push repository ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy ke Netlify

1. Push repository ke GitHub
2. Connect repository ke Netlify
3. Set environment variables di Netlify Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Build Command

```bash
npm run build
```

### Output Directory

```
dist/
```

---

## 🧪 Testing

### Run Type Check

```bash
npm run typecheck
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

---

## 📂 Struktur Project

```
nabung-nikah/
├── docs/                    # Dokumentasi lengkap
├── sql/                     # SQL migrations
│   ├── 001_multi_user_migration.sql
│   ├── 002_add_vendors_column.sql
│   ├── 003_add_tasks_column.sql
│   ├── 004_fix_ambiguous_column.sql
│   ├── 005_fix_duplicate_key_constraint.sql
│   └── 006_setup_user_avatar.sql
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx
│   │   ├── BudgetManager.tsx
│   │   ├── SavingsTracker.tsx
│   │   ├── GuestManager.tsx
│   │   ├── VendorManager.tsx
│   │   ├── TimelineManager.tsx
│   │   └── ...
│   ├── helpers/             # Helper functions
│   │   ├── auditTrail.ts
│   │   ├── excelGenerator.ts
│   │   ├── pdfGenerator.ts
│   │   └── timeAgo.ts
│   ├── hooks/               # Custom hooks
│   │   └── useRealtimeSync.ts
│   ├── lib/                 # Library configurations
│   │   └── supabase.ts
│   ├── data/                # Static data
│   │   └── defaultTasks.ts
│   ├── App.tsx              # Main app component
│   ├── store.ts             # Zustand store
│   ├── syncStore.ts         # Sync store
│   ├── authStore.ts         # Auth store
│   ├── collaborationStore.ts # Collaboration store
│   ├── types.ts             # TypeScript types
│   └── main.tsx             # Entry point
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.js           # Vite config
└── README.md                # This file
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

### Guidelines

- Tulis commit message yang jelas dan deskriptif
- Pastikan code sudah di-lint dan di-format
- Tambahkan test untuk fitur baru
- Update dokumentasi jika perlu

---

## 📝 License

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

## 👨‍💻 Author

**Mahes & Aira**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend as a Service
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - Bear necessities for state management
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons

---

## 📞 Support

Jika Anda memiliki pertanyaan atau masalah:

1. Check [dokumentasi](./docs/) terlebih dahulu
2. Buka [GitHub Issue](https://github.com/yourusername/nabung-nikah/issues)
3. Hubungi kami via email

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/nabung-nikah&type=Date)](https://star-history.com/#yourusername/nabung-nikah&Date)

---

<div align="center">

**Dibuat dengan ❤️ untuk Mahes & Aira**

[⬆ back to top](#-nabung-nikah---wedding-planner)

</div>
