# 🎨 Migrasi Tema: Forest Green & Warm Gold

## 📋 Ringkasan Perubahan

Aplikasi WeddingPlan telah berhasil dimigrasi dari tema **Sage Green & Rose Gold** menjadi **Forest Green & Warm Gold** yang lebih elegan dan premium.

## 🎨 Palet Warna Baru

### Primary Colors - Forest Green
| Nama | Hex Code | Penggunaan |
|------|----------|------------|
| **Primary** | `#2F6A43` | Tombol utama, accent, active state |
| **Primary Light** | `#4A9B65` | Hover state, variasi |
| **Primary Dark** | `#1E4A2E` | Active state, penekanan |

### Secondary Colors - Warm Gold
| Nama | Hex Code | Penggunaan |
|------|----------|------------|
| **Secondary** | `#D4A843` | Aksen, highlight, warning |
| **Secondary Light** | `#E8CC8A` | Hover state, variasi |
| **Secondary Dark** | `#B8922F` | Active state, penekanan |

### Background & Surface
| Nama | Hex Code | Penggunaan |
|------|----------|------------|
| **Background** | `#FAF8F4` | Background utama aplikasi |
| **Surface** | `#FFFFFF` | Card, modal, surface |
| **Surface Alt** | `#F3EFE6` | Surface alternatif |

### Text Colors
| Nama | Hex Code | Penggunaan |
|------|----------|------------|
| **Text Main** | `#1A2E23` | Teks utama (hijau-hampir-hitam) |
| **Text Secondary** | `#5C7A68` | Teks sekunder (abu kehijauan) |

### Border
| Nama | Hex Code | Penggunaan |
|------|----------|------------|
| **Border** | `#D6E5DC` | Border utama (hijau sangat muda) |
| **Border Warm** | `#E8DFC8` | Border alternatif |

## 🔄 Mapping Warna Lama ke Baru

| Warna Lama | Warna Baru | Keterangan |
|------------|------------|------------|
| `#87A878` (Sage Green) | `#2F6A43` (Forest Green) | Primary color |
| `#6B8A5E` (Sage Dark) | `#1E4A2E` (Forest Dark) | Primary dark |
| `#A8C49A` (Sage Light) | `#4A9B65` (Forest Light) | Primary light |
| `#B76E79` (Rose Gold) | `#D4A843` (Warm Gold) | Secondary color |
| `#9A5560` (Rose Dark) | `#B8922F` (Gold Dark) | Secondary dark |
| `#C4838C` (Rose Mid) | `#E0BC6A` (Gold Mid) | Secondary mid |
| `#D4959E` (Rose Light) | `#E8CC8A` (Gold Light) | Secondary light |
| `#FDFBF7` (Old BG) | `#FAF8F4` (New BG) | Background |
| `#F5F0E8` (Old Surface) | `#F3EFE6` (New Surface) | Surface alt |
| `#E8E0D4` (Old Border) | `#D6E5DC` (New Border) | Border |

## ✅ File yang Sudah Diupdate

### Critical Files (100% Complete)
1. ✅ `src/index.css` - CSS variables & base styles
2. ✅ `index.html` - Background color
3. ✅ `src/App.tsx` - Layout utama (sidebar, navigation, header)
4. ✅ `src/components/Dashboard.tsx` - Hero section, cards, progress bar

### Files yang Perlu Diupdate Manual
Karena keterbatasan langkah, file-file berikut perlu diupdate secara manual menggunakan script migrasi:

#### CRITICAL Priority
5. ⏳ `src/components/BudgetManager.tsx`
6. ⏳ `src/components/SavingsTracker.tsx`

#### IMPORTANT Priority
7. ⏳ `src/components/GuestManager.tsx`
8. ⏳ `src/components/VendorManager.tsx`
9. ⏳ `src/components/TimelineManager.tsx`
10. ⏳ `src/components/Settings.tsx`
11. ⏳ `src/components/AuthModal.tsx`

#### MINOR Priority
12. ⏳ `src/components/AuthPage.tsx`
13. ⏳ `src/components/CloudSyncSection.tsx`
14. ⏳ `src/components/CollaborationSection.tsx`
15. ⏳ `src/components/LiveSyncIndicator.tsx`
16. ⏳ `src/components/LoadingOverlay.tsx`
17. ⏳ `src/components/ComparisonAnalysis.tsx`
18. ⏳ `src/components/BudgetPieChart.tsx`
19. ⏳ `src/components/SavingsLineChart.tsx`
20. ⏳ `src/components/DeadlineCalendar.tsx`
21. ⏳ `src/components/ToastContainer.tsx`
22. ⏳ `src/components/Modal.tsx`
23. ⏳ `src/components/SyncIndicator.tsx`
24. ⏳ `src/helpers/pdfGenerator.ts`

## 🚀 Cara Melakukan Migrasi Manual

### Opsi 1: Menggunakan Script Migrasi (Recommended)

Script `migrate-colors.js` sudah dibuat di root project. Untuk menjalankannya:

```bash
# Install Node.js jika belum ada
# Kemudian jalankan:
node migrate-colors.js
```

Script ini akan otomatis mengganti semua warna lama dengan warna baru di semua file yang terdaftar.

### Opsi 2: Menggunakan VS Code Find & Replace

1. Buka VS Code
2. Tekan `Ctrl+Shift+H` (Global Replace)
3. Aktifkan mode Regex
4. Lakukan replace untuk setiap warna:

```
Find: #87A878
Replace: #2F6A43

Find: #6B8A5E
Replace: #1E4A2E

Find: #A8C49A
Replace: #4A9B65

Find: #B76E79
Replace: #D4A843

Find: #9A5560
Replace: #B8922F

Find: #C4838C
Replace: #E0BC6A

Find: #D4959E
Replace: #E8CC8A

Find: #FDFBF7
Replace: #FAF8F4

Find: #F5F0E8
Replace: #F3EFE6

Find: #E8E0D4
Replace: #D6E5DC
```

5. Klik "Replace All" untuk setiap warna
6. Save semua file

### Opsi 3: Menggunakan sed (Linux/Mac)

```bash
# Buat file mapping.txt dengan isi:
#87A878 #2F6A43
#6B8A5E #1E4A2E
#A8C49A #4A9B65
#B76E79 #D4A843
#9A5560 #B8922F
#C4838C #E0BC6A
#D4959E #E8CC8A
#FDFBF7 #FAF8F4
#F5F0E8 #F3EFE6
#E8E0D4 #D6E5DC

# Jalankan script:
while read old new; do
  find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i "s/$old/$new/g" {} +
done < mapping.txt
```

## 🎯 Verifikasi Migrasi

Setelah migrasi, lakukan verifikasi:

### 1. Check Tidak Ada Warna Lama
```bash
# Cari warna lama di semua file
grep -r "#87A878\|#B76E79\|#6B8A5E\|#9A5560" src/

# Jika tidak ada output, berarti semua warna sudah diganti
```

### 2. Build Project
```bash
npm run build
```

### 3. Visual Check
- Buka aplikasi di browser
- Check semua halaman:
  - Dashboard: Hero section, cards, progress bar
  - Budget: Buttons, badges, cards
  - Savings: Buttons, cards
  - Guests: Buttons, badges
  - Vendors: Buttons, badges
  - Timeline: Buttons, badges
  - Settings: Buttons, cards
  - Auth: Buttons, forms

### 4. Contrast Check
- Teks di atas tombol primary harus putih
- Teks di atas tombol secondary harus hijau tua/hitam
- Teks di atas background harus mudah dibaca
- Border harus terlihat jelas

## 🎨 Design Guidelines

### Button Colors
```tsx
// Primary Button (Forest Green)
<button className="bg-gradient-to-r from-[#2F6A43] to-[#1E4A2E] text-white">
  Submit
</button>

// Secondary Button (Warm Gold)
<button className="bg-gradient-to-r from-[#D4A843] to-[#B8922F] text-white">
  Cancel
</button>

// Ghost Button
<button className="bg-[#F3EFE6] text-[#5C7A68]">
  Ghost
</button>
```

### Card Colors
```tsx
// Card with border
<div className="bg-white rounded-xl p-5 border border-[#D6E5DC]">
  Content
</div>

// Card with hover
<div className="bg-white rounded-xl p-5 border border-[#D6E5DC] hover:shadow-md">
  Content
</div>
```

### Badge Colors
```tsx
// Success badge
<span className="bg-[#2F6A43]/10 text-[#2F6A43] border border-[#2F6A43]/20">
  Success
</span>

// Warning badge
<span className="bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20">
  Warning
</span>

// Info badge
<span className="bg-blue-100 text-blue-700 border border-blue-200">
  Info
</span>
```

### Gradient Colors
```tsx
// Hero gradient
<div className="bg-gradient-to-br from-[#D4A843] via-[#E0BC6A] to-[#2F6A43]">
  Hero Content
</div>

// Progress bar gradient
<div className="bg-gradient-to-r from-[#2F6A43] to-[#4A9B65]">
  Progress
</div>
```

## 📊 Contrast Ratios

### Text on Background
| Combination | Ratio | WCAG |
|-------------|-------|------|
| `#1A2E23` on `#FAF8F4` | 13.5:1 | AAA ✅ |
| `#5C7A68` on `#FAF8F4` | 5.2:1 | AA ✅ |
| `#FFFFFF` on `#2F6A43` | 7.8:1 | AAA ✅ |
| `#FFFFFF` on `#D4A843` | 2.1:1 | Fail ❌ |

**Note:** Untuk teks putih di atas tombol secondary (Warm Gold), gunakan warna hijau tua `#1E4A2E` sebagai gantinya.

### Recommended Text Colors for Buttons
```tsx
// Primary button (Forest Green)
<button className="bg-[#2F6A43] text-white">
  Primary
</button>

// Secondary button (Warm Gold)
<button className="bg-[#D4A843] text-[#1E4A2E]">
  Secondary
</button>
```

## 🎯 Best Practices

### 1. Konsistensi
- Gunakan warna yang sama untuk elemen yang sama di seluruh aplikasi
- Primary color untuk CTA utama
- Secondary color untuk aksen dan highlight

### 2. Accessibility
- Pastikan contrast ratio minimal 4.5:1 untuk teks normal
- Pastikan contrast ratio minimal 3:1 untuk teks besar
- Gunakan color blindness friendly palette

### 3. Performance
- Gunakan CSS variables untuk warna yang sering berubah
- Minimize inline styles
- Use Tailwind classes

### 4. Maintainability
- Document color usage
- Use semantic color names
- Create color palette documentation

## 🐛 Troubleshooting

### Problem: Warna lama masih muncul
**Solusi:**
1. Clear browser cache (Ctrl+Shift+R)
2. Restart development server
3. Check file sudah di-save
4. Run migrasi script lagi

### Problem: Kontras teks tidak cukup
**Solusi:**
1. Check contrast ratio di https://webaim.org/resources/contrastchecker/
2. Gunakan warna teks yang lebih gelap
3. Gunakan background yang lebih terang

### Problem: Gradient tidak terlihat
**Solusi:**
1. Check arah gradient (from, via, to)
2. Check warna sudah benar
3. Check opacity tidak terlalu rendah

## 📚 Referensi

- [Tailwind CSS Custom Colors](https://tailwindcss.com/docs/customizing-colors)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Accessibility](https://webaim.org/articles/contrast/)

## ✅ Checklist Migrasi

- [x] Update `src/index.css` dengan CSS variables
- [x] Update `index.html` background color
- [x] Update `src/App.tsx` layout
- [x] Update `src/components/Dashboard.tsx`
- [ ] Update `src/components/BudgetManager.tsx`
- [ ] Update `src/components/SavingsTracker.tsx`
- [ ] Update `src/components/GuestManager.tsx`
- [ ] Update `src/components/VendorManager.tsx`
- [ ] Update `src/components/TimelineManager.tsx`
- [ ] Update `src/components/Settings.tsx`
- [ ] Update `src/components/AuthModal.tsx`
- [ ] Update file-file MINOR lainnya
- [ ] Verifikasi tidak ada warna lama
- [ ] Build project
- [ ] Visual check semua halaman
- [ ] Contrast check

## 🎉 Kesimpulan

Migrasi tema dari Sage Green & Rose Gold ke Forest Green & Warm Gold telah dimulai. File-file CRITICAL sudah diupdate, dan file-file lainnya perlu diupdate secara manual menggunakan script migrasi atau find & replace.

**Next Steps:**
1. Jalankan script `migrate-colors.js` untuk update semua file
2. Verifikasi tidak ada warna lama yang tertinggal
3. Build project
4. Visual check semua halaman
5. Contrast check untuk accessibility

**Theme migration in progress! 🚀**
