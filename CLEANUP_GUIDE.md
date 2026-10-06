# 🧹 Panduan Cleanup Repository

Panduan lengkap untuk membersihkan dan merapikan repository Nabung Nikah.

---

## ⚡ Quick Start (Otomatis)

Jika Anda menggunakan Linux/Mac, jalankan script otomatis:

```bash
chmod +x cleanup-repo.sh
./cleanup-repo.sh
```

---

## 📝 Manual Cleanup (Step-by-Step)

Jika script tidak bisa dijalankan, ikuti langkah manual berikut:

### Step 1: Buat Folder `docs/`

```bash
mkdir -p docs
```

### Step 2: Pindahkan Dokumentasi yang Berguna

```bash
# Pindahkan file dokumentasi yang berguna ke docs/
mv SETUP_SUPABASE.md docs/ 2>/dev/null || true
mv SETUP_SUPABASE_STEP_BY_STEP.md docs/ 2>/dev/null || true
mv CLOUD_SYNC_GUIDE.md docs/ 2>/dev/null || true
mv CLOUD_SYNC_OPTIONAL.md docs/ 2>/dev/null || true
mv MULTI_USER_COLLABORATION.md docs/ 2>/dev/null || true
mv UX_IMPROVEMENTS.md docs/ 2>/dev/null || true
mv AUDIT_TRAIL_COMPLETE.md docs/ 2>/dev/null || true
mv AUDIT_TRAIL_CONFLICT_DETECTION.md docs/ 2>/dev/null || true
mv DASHBOARD_VISUALIZATION.md docs/ 2>/dev/null || true
mv EMERGENCY_BUFFER.md docs/ 2>/dev/null || true
mv EXCEL_EXPORT.md docs/ 2>/dev/null || true
mv OVERBUDGET_ALERT.md docs/ 2>/dev/null || true
mv TASK_ASSIGNMENT.md docs/ 2>/dev/null || true
mv TIMELINE_TODO.md docs/ 2>/dev/null || true
mv VENDOR_MANAGEMENT.md docs/ 2>/dev/null || true
mv USER_AVATAR_FEATURE.md docs/ 2>/dev/null || true
mv USER_AVATAR_SECURITY_UPDATE.md docs/ 2>/dev/null || true
mv THEME_MIGRATION.md docs/ 2>/dev/null || true
mv FONT_MIGRATION.md docs/ 2>/dev/null || true
mv LOGO_PERSONALIZATION.md docs/ 2>/dev/null || true
mv COPYWRITING_PERSONALIZATION.md docs/ 2>/dev/null || true
mv HEADER_NAVIGATION_UX.md docs/ 2>/dev/null || true
mv MOBILE_NAVIGATION_UX.md docs/ 2>/dev/null || true
mv COMPARISON_ANALYSIS_INLINE.md docs/ 2>/dev/null || true
mv IMPLEMENT_AUDIT_TRAIL_UI.md docs/ 2>/dev/null || true
```

### Step 3: Hapus File `FIX_*` dan `MIGRATION_*`

```bash
# Hapus semua file FIX_*.md
rm -f FIX_*.md

# Hapus semua file MIGRATION_*.md
rm -f MIGRATION_*.md
```

### Step 4: Hapus File Temporary

```bash
# Hapus script migrate-colors.js
rm -f migrate-colors.js
```

### Step 5: Rename SQL Files dengan Penomoran

```bash
# Masuk ke folder sql
cd sql

# Rename SQL files dengan penomoran migrasi
mv multi_user_migration.sql 001_multi_user_migration.sql 2>/dev/null || true
mv add_vendors_column.sql 002_add_vendors_column.sql 2>/dev/null || true
mv add_tasks_column.sql 003_add_tasks_column.sql 2>/dev/null || true
mv fix_ambiguous_column.sql 004_fix_ambiguous_column.sql 2>/dev/null || true
mv fix_duplicate_key_constraint.sql 005_fix_duplicate_key_constraint.sql 2>/dev/null || true
mv setup_user_avatar.sql 006_setup_user_avatar.sql 2>/dev/null || true

# Kembali ke root
cd ..
```

### Step 6: Buat `docs/README.md`

```bash
cat > docs/README.md << 'EOF'
# 📚 Dokumentasi Nabung Nikah

Folder ini berisi dokumentasi lengkap untuk aplikasi Nabung Nikah (Wedding Planner).

## 📂 Struktur Dokumentasi

### Setup & Configuration
- `SETUP_SUPABASE.md` - Panduan setup Supabase
- `SETUP_SUPABASE_STEP_BY_STEP.md` - Panduan setup Supabase step-by-step
- `CLOUD_SYNC_GUIDE.md` - Panduan Cloud Sync
- `CLOUD_SYNC_OPTIONAL.md` - Panduan Cloud Sync (Optional)

### Fitur Utama
- `MULTI_USER_COLLABORATION.md` - Fitur Kolaborasi Multi-User
- `AUDIT_TRAIL_COMPLETE.md` - Audit Trail System
- `AUDIT_TRAIL_CONFLICT_DETECTION.md` - Conflict Detection
- `DASHBOARD_VISUALIZATION.md` - Dashboard Visualization
- `EMERGENCY_BUFFER.md` - Emergency Buffer
- `EXCEL_EXPORT.md` - Excel Export
- `OVERBUDGET_ALERT.md` - Overbudget Alert
- `TASK_ASSIGNMENT.md` - Task Assignment
- `TIMELINE_TODO.md` - Timeline & Todo
- `VENDOR_MANAGEMENT.md` - Vendor Management
- `USER_AVATAR_FEATURE.md` - User Avatar Feature
- `USER_AVATAR_SECURITY_UPDATE.md` - User Avatar Security Update

### UI/UX
- `UX_IMPROVEMENTS.md` - UX Improvements
- `THEME_MIGRATION.md` - Theme Migration
- `FONT_MIGRATION.md` - Font Migration
- `LOGO_PERSONALIZATION.md` - Logo Personalization
- `COPYWRITING_PERSONALIZATION.md` - Copywriting Personalization
- `HEADER_NAVIGATION_UX.md` - Header Navigation UX
- `MOBILE_NAVIGATION_UX.md` - Mobile Navigation UX
- `COMPARISON_ANALYSIS_INLINE.md` - Comparison Analysis Inline
- `IMPLEMENT_AUDIT_TRAIL_UI.md` - Implement Audit Trail UI

## 🚀 Cara Menggunakan Dokumentasi

1. Pilih dokumentasi yang sesuai dengan kebutuhan Anda
2. Baca panduan setup untuk konfigurasi awal
3. Baca panduan fitur untuk memahami cara menggunakan fitur tertentu
4. Baca panduan UI/UX untuk memahami desain dan pengalaman pengguna

## 📝 Catatan

Dokumentasi ini akan terus diperbarui seiring dengan perkembangan aplikasi.

---

**Last Updated:** 2026-01-15
EOF
```

---

## ✅ Verifikasi Cleanup

Setelah menjalankan cleanup, verifikasi dengan:

```bash
# Check folder docs/ ada
ls -la docs/

# Check file FIX_* sudah dihapus
ls FIX_*.md 2>/dev/null || echo "✅ No FIX_* files found"

# Check file MIGRATION_* sudah dihapus
ls MIGRATION_*.md 2>/dev/null || echo "✅ No MIGRATION_* files found"

# Check SQL files sudah di-rename
ls sql/*.sql

# Check .gitignore ada
ls -la .gitignore

# Check .env.example ada
ls -la .env.example

# Check README.md ada
ls -la README.md
```

---

## 📊 Expected Result

Setelah cleanup, struktur repository seharusnya:

```
nabung-nikah/
├── docs/                          # ✅ Dokumentasi terorganisir
│   ├── README.md
│   ├── SETUP_SUPABASE.md
│   ├── CLOUD_SYNC_GUIDE.md
│   ├── MULTI_USER_COLLABORATION.md
│   └── ... (25+ file dokumentasi)
├── sql/                           # ✅ SQL files dengan penomoran
│   ├── 001_multi_user_migration.sql
│   ├── 002_add_vendors_column.sql
│   ├── 003_add_tasks_column.sql
│   ├── 004_fix_ambiguous_column.sql
│   ├── 005_fix_duplicate_key_constraint.sql
│   └── 006_setup_user_avatar.sql
├── src/                           # ✅ Source code (tidak berubah)
│   ├── components/
│   ├── helpers/
│   ├── hooks/
│   └── ...
├── .env.example                   # ✅ Template environment
├── .gitignore                     # ✅ Git ignore rules
├── README.md                      # ✅ README profesional
├── package.json                   # ✅ Updated package.json
├── tsconfig.json
├── vite.config.js
└── vercel.json
```

**File yang DIHAPUS:**
- ❌ Semua file `FIX_*.md` (25+ file)
- ❌ Semua file `MIGRATION_*.md` (jika ada)
- ❌ `migrate-colors.js`

**File yang DIPINDAHKAN:**
- ✅ 25+ file dokumentasi → `docs/`

**File yang DI-RENAME:**
- ✅ 6 SQL files dengan penomoran migrasi

**File yang DIBUAT:**
- ✅ `.gitignore` (comprehensive)
- ✅ `.env.example` (template)
- ✅ `README.md` (profesional)
- ✅ `docs/README.md` (index dokumentasi)

---

## 🚀 Next Steps

Setelah cleanup:

1. **Commit perubahan:**
   ```bash
   git add .
   git commit -m "chore: reorganize repository structure and documentation"
   ```

2. **Push ke GitHub:**
   ```bash
   git push origin main
   ```

3. **Deploy ke Vercel:**
   - Set environment variables di Vercel Dashboard
   - Deploy!

---

## 📞 Support

Jika ada masalah saat cleanup:

1. Check apakah file masih ada: `ls -la`
2. Check permission: `chmod +x cleanup-repo.sh`
3. Jalankan manual step-by-step (lihat bagian Manual Cleanup)

---

**Happy coding! 🎉**
