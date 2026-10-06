#!/bin/bash

# ============================================
# Script untuk membersihkan dan merapikan repository
# Nabung Nikah - Wedding Planner
# ============================================

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting repository cleanup...${NC}"

# ============================================
# STEP 1: Buat folder docs/
# ============================================
echo -e "\n${YELLOW}📁 Step 1: Creating docs/ folder...${NC}"
mkdir -p docs
echo -e "${GREEN}✅ docs/ folder created${NC}"

# ============================================
# STEP 2: Pindahkan dokumentasi yang berguna ke docs/
# ============================================
echo -e "\n${YELLOW}📚 Step 2: Moving useful documentation to docs/...${NC}"

# Daftar file dokumentasi yang akan dipindahkan
USEFUL_DOCS=(
  "SETUP_SUPABASE.md"
  "SETUP_SUPABASE_STEP_BY_STEP.md"
  "CLOUD_SYNC_GUIDE.md"
  "CLOUD_SYNC_OPTIONAL.md"
  "MULTI_USER_COLLABORATION.md"
  "UX_IMPROVEMENTS.md"
  "AUDIT_TRAIL_COMPLETE.md"
  "AUDIT_TRAIL_CONFLICT_DETECTION.md"
  "DASHBOARD_VISUALIZATION.md"
  "EMERGENCY_BUFFER.md"
  "EXCEL_EXPORT.md"
  "OVERBUDGET_ALERT.md"
  "TASK_ASSIGNMENT.md"
  "TIMELINE_TODO.md"
  "VENDOR_MANAGEMENT.md"
  "USER_AVATAR_FEATURE.md"
  "USER_AVATAR_SECURITY_UPDATE.md"
  "THEME_MIGRATION.md"
  "FONT_MIGRATION.md"
  "LOGO_PERSONALIZATION.md"
  "COPYWRITING_PERSONALIZATION.md"
  "HEADER_NAVIGATION_UX.md"
  "MOBILE_NAVIGATION_UX.md"
  "COMPARISON_ANALYSIS_INLINE.md"
  "IMPLEMENT_AUDIT_TRAIL_UI.md"
)

for doc in "${USEFUL_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    mv "$doc" docs/
    echo -e "${GREEN}  ✓ Moved: $doc${NC}"
  else
    echo -e "${YELLOW}  ⚠ Not found: $doc${NC}"
  fi
done

echo -e "${GREEN}✅ Documentation moved to docs/${NC}"

# ============================================
# STEP 3: Hapus file FIX_* dan MIGRATION_*
# ============================================
echo -e "\n${YELLOW}🗑️  Step 3: Removing FIX_* and MIGRATION_* files...${NC}"

# Hapus file FIX_*
FIX_FILES=$(ls FIX_*.md 2>/dev/null)
if [ -n "$FIX_FILES" ]; then
  for file in FIX_*.md; do
    if [ -f "$file" ]; then
      rm "$file"
      echo -e "${RED}  ✗ Deleted: $file${NC}"
    fi
  done
else
  echo -e "${YELLOW}  ⚠ No FIX_* files found${NC}"
fi

# Hapus file MIGRATION_*
MIGRATION_FILES=$(ls MIGRATION_*.md 2>/dev/null)
if [ -n "$MIGRATION_FILES" ]; then
  for file in MIGRATION_*.md; do
    if [ -f "$file" ]; then
      rm "$file"
      echo -e "${RED}  ✗ Deleted: $file${NC}"
    fi
  done
else
  echo -e "${YELLOW}  ⚠ No MIGRATION_* files found${NC}"
fi

echo -e "${GREEN}✅ FIX_* and MIGRATION_* files removed${NC}"

# ============================================
# STEP 4: Hapus file temporary lainnya
# ============================================
echo -e "\n${YELLOW}🧹 Step 4: Removing temporary files...${NC}"

# Hapus migrate-colors.js (script temporary)
if [ -f "migrate-colors.js" ]; then
  rm "migrate-colors.js"
  echo -e "${RED}  ✗ Deleted: migrate-colors.js${NC}"
fi

echo -e "${GREEN}✅ Temporary files removed${NC}"

# ============================================
# STEP 5: Rename SQL files dengan penomoran
# ============================================
echo -e "\n${YELLOW}🔢 Step 5: Renaming SQL files with migration numbers...${NC}"

cd sql || exit

# Rename SQL files dengan penomoran migrasi
declare -A SQL_RENAME=(
  ["multi_user_migration.sql"]="001_multi_user_migration.sql"
  ["add_vendors_column.sql"]="002_add_vendors_column.sql"
  ["add_tasks_column.sql"]="003_add_tasks_column.sql"
  ["fix_ambiguous_column.sql"]="004_fix_ambiguous_column.sql"
  ["fix_duplicate_key_constraint.sql"]="005_fix_duplicate_key_constraint.sql"
  ["setup_user_avatar.sql"]="006_setup_user_avatar.sql"
)

for old_name in "${!SQL_RENAME[@]}"; do
  new_name="${SQL_RENAME[$old_name]}"
  if [ -f "$old_name" ]; then
    mv "$old_name" "$new_name"
    echo -e "${GREEN}  ✓ Renamed: $old_name → $new_name${NC}"
  else
    echo -e "${YELLOW}  ⚠ Not found: $old_name${NC}"
  fi
done

cd ..

echo -e "${GREEN}✅ SQL files renamed with migration numbers${NC}"

# ============================================
# STEP 6: Buat README untuk folder docs/
# ============================================
echo -e "\n${YELLOW}📖 Step 6: Creating docs/README.md...${NC}"

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

echo -e "${GREEN}✅ docs/README.md created${NC}"

# ============================================
# SELESAI
# ============================================
echo -e "\n${GREEN}🎉 Repository cleanup completed successfully!${NC}"
echo -e "\n${YELLOW}Summary:${NC}"
echo -e "  • Created docs/ folder"
echo -e "  • Moved useful documentation to docs/"
echo -e "  • Removed FIX_* and MIGRATION_* files"
echo -e "  • Removed temporary files"
echo -e "  • Renamed SQL files with migration numbers"
echo -e "  • Created docs/README.md"
echo -e "\n${GREEN}✅ All done!${NC}"
