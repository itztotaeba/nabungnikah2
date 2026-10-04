# 📅 Fitur Timeline & To-Do List - WeddingPlan

## 📋 Ringkasan Fitur

Fitur **Timeline & To-Do List** telah berhasil diimplementasikan dengan lengkap, mencakup:
- ✅ Checklist tugas pernikahan standar Indonesia (23 item default)
- ✅ Progress bar visual
- ✅ Timeline grouping berdasarkan bulan sebelum pernikahan
- ✅ Custom checkbox dengan animasi
- ✅ Badge kategori dengan warna berbeda
- ✅ Indikator bulan yang sedang berjalan
- ✅ Tambah tugas custom
- ✅ Toggle selesai/belum selesai
- ✅ Hapus tugas custom
- ✅ Integrasi dengan Supabase Cloud Sync
- ✅ Toast notifications

---

## 🗄️ Database Setup

### SQL Script untuk Supabase

Jalankan script berikut di **Supabase SQL Editor**:

```sql
-- Tambah kolom tasks ke table wedding_data
ALTER TABLE wedding_data 
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]';
```

**File SQL:** `sql/add_tasks_column.sql`

---

## 📊 Struktur Data Task

### Interface TypeScript

```typescript
export type TaskCategory = 'Administrasi' | 'Vendor' | 'Pakaian' | 'Dekorasi' | 'Undangan' | 'Lainnya';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  monthsBefore: number; // Berapa bulan sebelum pernikahan (misal: 3, 1, 0)
  isCompleted: boolean;
  completedAt?: string; // ISO Date
  isDefault: boolean; // True untuk template bawaan, False untuk custom user
}
```

---

## 🎯 Fitur Utama

### 1. **Progress Bar**

**Tampilan:**
- Progress bar besar di atas halaman
- Teks: "X dari Y tugas selesai"
- Persentase progress
- Gradient warna Sage Green

**Perhitungan:**
```typescript
completedTasks = tasks.filter(t => t.isCompleted).length
totalTasks = tasks.length
progressPercentage = (completedTasks / totalTasks) * 100
```

### 2. **Current Month Indicator**

**Tampilan:**
- Banner gradient dengan icon Clock
- Teks: "Saat ini: X Bulan Sebelum"
- Menggunakan helper `calculateRemainingMonths`

### 3. **Timeline Grouping**

**Struktur:**
```
┌─────────────────────────────────────┐
│ 📅 12 Bulan Sebelum                 │
│ ─────────────────────────────────── │
│ ○ Tentukan tanggal pernikahan       │
│ ○ Buat anggaran awal                │
│ ○ Booking venue/gedung              │
│ ○ Tentukan konsep pernikahan        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 9 Bulan Sebelum                  │
│ ─────────────────────────────────── │
│ ○ Booking WO atau paket All-in      │
│ ○ Booking MUA (Makeup Artist)       │
│ ○ Booking fotografer & videografer  │
│ ○ Buat daftar tamu awal             │
└─────────────────────────────────────┘
```

**Badge "SEDANG BERJALAN":**
- Muncul pada grup bulan yang sedang aktif
- Background gradient rose gold → sage green
- Badge merah dengan teks putih

### 4. **Task Item**

**Tampilan:**
- ✅ Custom checkbox (bukan default browser)
  - Belum selesai: Circle icon (abu-abu)
  - Sudah selesai: CheckCircle2 icon (Sage Green)
- ✅ Judul tugas
  - Belum selesai: Normal text
  - Sudah selesai: Strikethrough + opacity 60%
- ✅ Deskripsi (jika ada)
- ✅ Badge kategori dengan warna berbeda
- ✅ Tombol hapus (hanya untuk tugas custom)

**Animasi:**
- Checkbox: Transisi halus saat toggle
- Text: Fade-in strikethrough
- Opacity: Transisi saat selesai

### 5. **Tambah Tugas Custom**

**Form Fields:**
- Judul Tugas (wajib)
- Kategori (dropdown: Administrasi, Vendor, Pakaian, Dekorasi, Undangan, Lainnya)
- Bulan Sebelum Pernikahan (dropdown: 12, 9, 6, 3, 1, 0)
- Deskripsi (opsional)

**Validasi:**
- Judul wajib diisi
- Toast notification saat berhasil/gagal

---

## 📝 Template Tugas Default

### **23 Item Tugas Standar Indonesia:**

#### **12 Bulan Sebelum (4 tugas):**
1. Tentukan tanggal pernikahan
2. Buat anggaran awal
3. Booking venue/gedung
4. Tentukan konsep pernikahan

#### **9 Bulan Sebelum (4 tugas):**
5. Booking WO atau paket All-in
6. Booking MUA (Makeup Artist)
7. Booking fotografer & videografer
8. Buat daftar tamu awal

#### **6 Bulan Sebelum (4 tugas):**
9. Pilih gaun/jas pengantin
10. Pilih gaun bridesmaid & jas groomsmen
11. Booking dekorasi & bunga
12. Booking entertainment

#### **3 Bulan Sebelum (4 tugas):**
13. Desain & cetak undangan
14. Pilih cincin pernikahan
15. Booking katering
16. Pilih souvenir

#### **1 Bulan Sebelum (4 tugas):**
17. Sebar undangan
18. Final fitting pakaian
19. Meeting teknis dengan vendor
20. Siapkan dokumen administrasi

#### **Hari H / 0 Bulan (3 tugas):**
21. Konfirmasi kehadiran tamu
22. Siapkan amplop & angpao
23. Gladi bersih
24. Istirahat cukup

---

## 🎨 UI/UX Design

### Color Scheme

**Badge Kategori:**
- Administrasi: `bg-blue-50 text-blue-700 border-blue-200`
- Vendor: `bg-purple-50 text-purple-700 border-purple-200`
- Pakaian: `bg-pink-50 text-pink-700 border-pink-200`
- Dekorasi: `bg-amber-50 text-amber-700 border-amber-200`
- Undangan: `bg-emerald-50 text-emerald-700 border-emerald-200`
- Lainnya: `bg-gray-100 text-gray-600 border-gray-200`

**Progress Bar:**
- Gradient: `from-[#87A878] to-[#A8C49A]` (Sage Green)

**Current Month Indicator:**
- Gradient: `from-[#B76E79]/10 to-[#87A878]/10` (Rose Gold → Sage Green)
- Badge: `bg-[#B76E79] text-white` (Rose Gold)

**Checkbox:**
- Belum selesai: `text-gray-300 hover:text-[#87A878]`
- Sudah selesai: `text-[#87A878]` (Sage Green)

---

## 🔄 State Management

### Zustand Store Actions

```typescript
// Add task
addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'completedAt'>) => void;

// Toggle task completion
toggleTask: (id: string) => void;

// Delete task
deleteTask: (id: string) => void;
```

**Auto-calculation:**
- `isCompleted` di-toggle saat `toggleTask` dipanggil
- `completedAt` di-set otomatis saat task selesai
- `completedAt` di-undefined saat task belum selesai

### Default Tasks Initialization

```typescript
const initialState = {
  // ... other states
  tasks: defaultTasks.map(task => ({
    ...task,
    id: generateId(),
    isCompleted: false,
  })),
};
```

**Logic:**
- Saat pertama kali load, jika array `tasks` kosong
- Otomatis isi dengan `defaultTasks` dari `src/data/defaultTasks.ts`
- Generate unique ID untuk setiap task
- Set `isCompleted: false` untuk semua task

### Supabase Sync

Data tasks otomatis sync ke Supabase:
- **syncToCloud:** Include tasks array di JSONB
- **syncFromCloud:** Load tasks dari cloud
- **LocalStorage:** Fallback jika offline

---

## 📁 Struktur File

```
src/
├── types.ts                          # Task interface & types
├── store.ts                          # Zustand store dengan task actions
├── syncStore.ts                      # Supabase sync (include tasks)
├── data/
│   └── defaultTasks.ts               # 23 item tugas default
├── components/
│   ├── TimelineManager.tsx           # Halaman utama timeline
│   └── Modal.tsx                     # Reusable modal component
├── App.tsx                           # Tab navigation (added timeline tab)
└── sql/
    └── add_tasks_column.sql          # SQL script untuk Supabase
```

---

## 🚀 Cara Penggunaan

### **1. Setup Database**
```bash
# Jalankan di Supabase SQL Editor
ALTER TABLE wedding_data 
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]';
```

### **2. Lihat Timeline**
- Buka tab **Timeline**
- Lihat progress bar di atas
- Lihat indikator bulan yang sedang berjalan
- Lihat semua tugas dikelompokkan berdasarkan bulan

### **3. Toggle Tugas**
- Klik checkbox untuk toggle selesai/belum selesai
- Task selesai akan muncul dengan strikethrough
- Progress bar otomatis update

### **4. Tambah Tugas Custom**
1. Klik tombol **"Tambah Tugas Custom"** di bawah
2. Isi form:
   - Judul Tugas (wajib)
   - Kategori
   - Bulan Sebelum Pernikahan
   - Deskripsi (opsional)
3. Klik **"Tambah Tugas"**

### **5. Hapus Tugas Custom**
- Klik tombol **Hapus** (icon trash) di task custom
- Konfirmasi di dialog
- Tugas dihapus

**Catatan:** Tugas default tidak bisa dihapus (hanya tugas custom)

---

## 💡 Tips Penggunaan

### **Untuk Pemula:**
1. Buka tab Timeline
2. Lihat checklist default yang sudah tersedia
3. Mulai centang tugas yang sudah selesai
4. Lihat progress bar update otomatis

### **Untuk Advanced User:**
1. Tambah tugas custom sesuai kebutuhan
2. Gunakan kategori untuk organisasi yang lebih baik
3. Set bulan yang sesuai untuk timeline yang akurat
4. Tambah deskripsi untuk detail tugas

### **Best Practices:**
- ✅ Review timeline secara berkala
- ✅ Update progress saat tugas selesai
- ✅ Tambah tugas custom jika ada yang tidak ada di default
- ✅ Gunakan kategori untuk filter dan organisasi
- ✅ Backup data secara berkala (Export JSON)

---

## 📊 Contoh Use Case

### **Use Case 1: Tracking Progress Pernikahan**

**Scenario:** User ingin tracking progress persiapan pernikahan

**Steps:**
1. Buka tab Timeline
2. Lihat progress bar: 30% (7 dari 23 tugas selesai)
3. Lihat bulan yang sedang berjalan: "3 Bulan Sebelum"
4. Centang tugas yang sudah selesai
5. Progress bar update otomatis: 35% (8 dari 23)

### **Use Case 2: Tambah Tugas Custom**

**Scenario:** User ingin tambah tugas yang tidak ada di default

**Steps:**
1. Klik "Tambah Tugas Custom"
2. Isi form:
   - Judul: "Beli sepatu pengantin"
   - Kategori: "Pakaian"
   - Bulan: "2 Bulan"
   - Deskripsi: "Coba di toko dan beli yang nyaman"
3. Klik "Tambah Tugas"
4. Tugas muncul di grup "2 Bulan Sebelum"

### **Use Case 3: Review Timeline Mingguan**

**Scenario:** User ingin review timeline setiap minggu

**Steps:**
1. Buka tab Timeline
2. Lihat progress bar
3. Scroll ke bulan yang sedang berjalan
4. Centang tugas yang sudah selesai minggu ini
5. Lihat tugas apa yang perlu dikerjakan minggu depan

---

## 🐛 Troubleshooting

### **Problem: Tugas default tidak muncul**
**Solusi:**
1. Check console untuk error
2. Clear LocalStorage dan refresh browser
3. Check file `defaultTasks.ts` ada dan benar
4. Restart development server

### **Problem: Progress bar tidak update**
**Solusi:**
1. Check apakah task sudah di-toggle
2. Refresh browser
3. Check console untuk error
4. Clear cache dan hard refresh

### **Problem: Tugas custom tidak bisa dihapus**
**Solusi:**
1. Pastikan tugas bukan tugas default (isDefault: false)
2. Check console untuk error
3. Refresh browser
4. Check permission di Supabase

### **Problem: Data tidak sync ke cloud**
**Solusi:**
1. Check Supabase credentials di `.env.local`
2. Pastikan kolom `tasks` sudah ditambahkan di database
3. Check console untuk error sync
4. Manual sync di Settings

---

## 🔒 Security & Privacy

- ✅ Data tersimpan di LocalStorage (browser)
- ✅ Sync ke Supabase (encrypted)
- ✅ Row Level Security (RLS) enabled
- ✅ User hanya bisa akses data sendiri
- ✅ Tidak ada data sensitif yang di-expose

---

## 🎯 Future Enhancements

### **Phase 2 (Optional):**
- [ ] Reminder/notifikasi untuk deadline tugas
- [ ] Priority level (High, Medium, Low)
- [ ] Assignee (siapa yang bertanggung jawab)
- [ ] Due date spesifik (bukan hanya bulan)
- [ ] Attachment/file untuk setiap tugas
- [ ] Sub-tasks (tugas bertingkat)
- [ ] Recurring tasks (tugas berulang)
- [ ] Export timeline ke PDF
- [ ] Template timeline berbeda (adat, modern, outdoor)
- [ ] Collaboration (share timeline dengan partner)

### **Phase 3 (Advanced):**
- [ ] AI recommendation untuk tugas yang terlambat
- [ ] Integration dengan Google Calendar
- [ ] Push notification untuk deadline
- [ ] Timeline visualization (Gantt chart)
- [ ] Progress analytics & insights
- [ ] Template marketplace
- [ ] Multi-language support

---

## ✅ Checklist Implementasi

### **Database:**
- [x] SQL script untuk tambah kolom tasks
- [x] JSONB data type
- [x] Default value array kosong

### **TypeScript:**
- [x] Interface Task
- [x] Type definitions (TaskCategory)
- [x] Update AppState interface
- [x] Export types dari store.ts

### **State Management:**
- [x] Zustand store dengan task actions
- [x] Default tasks initialization
- [x] Toggle task completion
- [x] Auto-set completedAt
- [x] LocalStorage persistence
- [x] Supabase sync integration

### **UI Components:**
- [x] TimelineManager (halaman utama)
- [x] Progress bar
- [x] Current month indicator
- [x] Timeline grouping
- [x] Custom checkbox
- [x] Badge kategori
- [x] Inline form (tambah tugas)
- [x] Toast notifications
- [x] Empty state
- [x] Animasi transisi

### **Features:**
- [x] 23 item tugas default
- [x] Toggle selesai/belum selesai
- [x] Tambah tugas custom
- [x] Hapus tugas custom
- [x] Progress tracking
- [x] Timeline grouping
- [x] Current month highlight
- [x] Badge "SEDANG BERJALAN"
- [x] Validasi form
- [x] Responsive design

### **Integration:**
- [x] Tab navigation di App.tsx
- [x] Supabase sync (syncToCloud, syncFromCloud)
- [x] Import/Export JSON (include tasks)
- [x] LocalStorage fallback

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check console browser untuk error
2. Check Supabase Dashboard → Logs
3. Review dokumentasi ini
4. Check file `TIMELINE_TODO.md` untuk detail teknis

---

**Implementasi selesai! 🎉**

Fitur Timeline & To-Do List telah berhasil diimplementasikan dengan lengkap, mencakup 23 item tugas default, progress tracking, timeline grouping, dan integrasi cloud sync.
