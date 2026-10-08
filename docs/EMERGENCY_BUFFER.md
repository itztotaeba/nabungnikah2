# 🛡️ Fitur Dana Darurat (Emergency Buffer)

## 📋 Ringkasan Fitur

Sistem **Dana Darurat (Emergency Buffer)** telah berhasil diimplementasikan untuk mengalokasikan persentase tertentu dari total anggaran sebagai buffer untuk biaya tak terduga, serta memberikan peringatan visual jika dana darurat sudah tersentuh.

---

## 🎯 Masalah yang Diselesaikan

### Sebelum
- Tidak ada alokasi khusus untuk biaya tak terduga
- User tidak tahu berapa buffer yang tersedia
- Tidak ada peringatan jika buffer sudah terpakai
- Sulit mengontrol pengeluaran mendadak

### Sesudah
- ✅ Buffer 15% otomatis dialokasikan dari total anggaran
- ✅ Visualisasi sisa buffer yang tersedia
- ✅ Warning system jika buffer tersentuh
- ✅ Progress bar untuk penggunaan buffer
- ✅ Color-coded status (hijau/kuning/merah)

---

## 🏗️ Arsitektur Implementasi

### 1. Helper Functions (`src/helpers.ts`)

#### `calculateEmergencyBuffer(totalBudget, percentage)`
Hitung dana darurat berdasarkan persentase.

```typescript
export function calculateEmergencyBuffer(
  totalBudget: number, 
  percentage: number = 15
): {
  bufferAmount: number;
  percentage: number;
  totalWithBuffer: number;
}
```

**Logic:**
- Hitung `bufferAmount = totalBudget * (percentage / 100)`
- Hitung `totalWithBuffer = totalBudget + bufferAmount`
- Return object dengan informasi buffer

**Example:**
```typescript
const result = calculateEmergencyBuffer(100000000, 15);
// {
//   bufferAmount: 15000000,
//   percentage: 15,
//   totalWithBuffer: 115000000
// }
```

#### `checkEmergencyBufferStatus(totalBudget, totalActual, bufferPercentage)`
Cek status dana darurat dan penggunaan buffer.

```typescript
export function checkEmergencyBufferStatus(
  totalBudget: number, 
  totalActual: number, 
  bufferPercentage: number = 15
): {
  bufferAmount: number;
  totalWithBuffer: number;
  remainingSafe: number;
  remainingBuffer: number;
  isBufferTouched: boolean;
  bufferUsagePercentage: number;
}
```

**Logic:**
1. Hitung buffer amount dengan `calculateEmergencyBuffer`
2. Hitung `remainingSafe = totalBudget - totalActual` (dana aman yang tersisa)
3. Hitung `remainingBuffer = totalWithBuffer - totalActual` (dana darurat yang tersisa)
4. Cek `isBufferTouched = totalActual > totalBudget` (jika realisasi > anggaran)
5. Hitung `bufferUsagePercentage` jika buffer tersentuh
6. Return object dengan status lengkap

**Example:**
```typescript
const status = checkEmergencyBufferStatus(100000000, 110000000, 15);
// {
//   bufferAmount: 15000000,
//   totalWithBuffer: 115000000,
//   remainingSafe: 0,
//   remainingBuffer: 5000000,
//   isBufferTouched: true,
//   bufferUsagePercentage: 66.67
// }
```

### 2. UI Component (`src/components/EmergencyBufferAlert.tsx`)

**Features:**
- ✅ Header dengan icon Shield dan status badge
- ✅ 3 Summary cards:
  - Total + Buffer (anggaran + dana darurat)
  - Buffer Amount (jumlah dana darurat)
  - Remaining Buffer (sisa dana darurat)
- ✅ Progress bar untuk buffer usage (jika tersentuh)
- ✅ Warning message dengan level berbeda:
  - 🟢 Hijau: Buffer aman (0% terpakai)
  - 🟡 Kuning: Buffer terbatas (< 50% terpakai)
  - 🔴 Merah: Buffer kritis (≥ 50% terpakai)
- ✅ Info box dengan tips (jika buffer belum tersentuh)
- ✅ Responsive design (mobile & desktop)

**Color Scheme:**

**Aman (Green):**
- Background: `bg-emerald-50`
- Border: `border-emerald-200`
- Text: `text-emerald-700`
- Icon: `text-emerald-600`
- Progress: `bg-gradient-to-r from-emerald-500 to-emerald-600`

**Terbatas (Amber):**
- Background: `bg-amber-50`
- Border: `border-amber-200`
- Text: `text-amber-700`
- Icon: `text-amber-600`
- Progress: `bg-gradient-to-r from-amber-500 to-amber-600`

**Kritis (Red):**
- Background: `bg-red-50`
- Border: `border-red-200`
- Text: `text-red-700`
- Icon: `text-red-600`
- Progress: `bg-gradient-to-r from-red-500 to-red-600`

### 3. Dashboard Integration

**Posisi:** Setelah "Category Breakdown" dan sebelum "Task Assignment Summary"

**Logic:**
- Komponen otomatis hidden jika `budgetItems.length === 0` atau `totalBudget === 0`
- Menggunakan `useMemo` untuk performance optimization
- Safe data access dengan fallback

---

## 📊 Data Flow

```
budgetItems (dari Zustand store)
    ↓
calculateTotalBudget() & calculateTotalActual()
    ↓
checkEmergencyBufferStatus(totalBudget, totalActual, 15)
    ↓
bufferStatus (object dengan status buffer)
    ↓
useMemo (untuk performance)
    ↓
getStatusInfo() → determine color & icon
    ↓
Render UI dengan status yang sesuai
```

### Status Logic

```typescript
if (bufferUsagePercentage === 0) {
  // 🟢 Aman - Buffer belum tersentuh
  color: 'emerald'
  label: 'Dana Darurat Aman'
} else if (bufferUsagePercentage < 50) {
  // 🟡 Terbatas - Buffer mulai terpakai
  color: 'amber'
  label: 'Dana Darurat Terbatas'
} else {
  // 🔴 Kritis - Buffer hampir habis
  color: 'red'
  label: 'Dana Darurat Kritis'
}
```

---

## 🎨 UI Design

### Layout Desktop
```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Dana Darurat (Emergency Buffer)     [Dana Darurat Aman]│
│    Buffer 15% dari total anggaran                       │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Total +      │ │ Dana         │ │ Sisa         │     │
│ │ Buffer       │ │ Darurat      │ │ Buffer       │     │
│ │              │ │              │ │              │     │
│ │ Rp115jt      │ │ Rp15jt       │ │ Rp15jt       │     │
│ │ Anggaran:    │ │ 15% dari     │ │ Belum        │     │
│ │ Rp100jt      │ │ total        │ │ terpakai     │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
├─────────────────────────────────────────────────────────┤
│ 💡 Tips: Dana Darurat                                   │
│ Dana darurat 15% dialokasikan untuk biaya tak terduga   │
│ seperti perubahan vendor, tambahan tamu, atau biaya     │
│ mendadak lainnya. Pertahankan dana ini sampai hari H.   │
└─────────────────────────────────────────────────────────┘
```

### Layout Mobile
```
┌─────────────────────────────┐
│ 🛡️ Dana Darurat             │
│    [Dana Darurat Aman]      │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Total + Buffer          │ │
│ │ Rp115jt                 │ │
│ │ Anggaran: Rp100jt       │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Dana Darurat            │ │
│ │ Rp15jt                  │ │
│ │ 15% dari total          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Sisa Buffer             │ │
│ │ Rp15jt                  │ │
│ │ Belum terpakai          │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 💡 Tips: Dana Darurat       │
│ ...                         │
└─────────────────────────────┘
```

### Layout Saat Buffer Tersentuh (Warning)
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Dana Darurat (Emergency Buffer)   [Dana Darurat Kritis]│
│    Buffer 15% dari total anggaran                       │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Total +      │ │ Dana         │ │ Sisa         │     │
│ │ Buffer       │ │ Darurat      │ │ Buffer       │     │
│ │              │ │              │ │              │     │
│ │ Rp115jt      │ │ Rp15jt       │ │ Rp5jt        │     │
│ │ Anggaran:    │ │ 15% dari     │ │ 66.7%        │     │
│ │ Rp100jt      │ │ total        │ │ terpakai     │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
├─────────────────────────────────────────────────────────┤
│ Penggunaan Dana Darurat                    [66.7%]      │
│ [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] │
│ 0%                    50%                    100%       │
├─────────────────────────────────────────────────────────┤
│ ⚠️ Peringatan: Dana Darurat Hampir Habis!               │
│ Anda telah menggunakan 66.7% dari dana darurat. Segera  │
│ evaluasi pengeluaran dan pertimbangkan untuk menambah   │
│ anggaran.                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### Scenario 1: Buffer Aman (0% terpakai)
**Data:**
- Total Anggaran: Rp100.000.000
- Total Realisasi: Rp90.000.000
- Buffer: Rp15.000.000 (15%)

**Expected:**
- ✅ Status: "Dana Darurat Aman" (green)
- ✅ Icon: CheckCircle (green)
- ✅ Sisa Buffer: Rp15.000.000
- ✅ Progress bar: tidak muncul
- ✅ Info box: Tips dana darurat

### Scenario 2: Buffer Terbatas (< 50% terpakai)
**Data:**
- Total Anggaran: Rp100.000.000
- Total Realisasi: Rp105.000.000
- Buffer: Rp15.000.000 (15%)
- Terpakai: Rp5.000.000 (33.3%)

**Expected:**
- ✅ Status: "Dana Darurat Terbatas" (amber)
- ✅ Icon: AlertTriangle (amber)
- ✅ Sisa Buffer: Rp10.000.000
- ✅ Progress bar: 33.3% (amber)
- ✅ Warning: "Dana Darurat Sudah Tersentuh"

### Scenario 3: Buffer Kritis (≥ 50% terpakai)
**Data:**
- Total Anggaran: Rp100.000.000
- Total Realisasi: Rp110.000.000
- Buffer: Rp15.000.000 (15%)
- Terpakai: Rp10.000.000 (66.7%)

**Expected:**
- ✅ Status: "Dana Darurat Kritis" (red)
- ✅ Icon: AlertTriangle (red)
- ✅ Sisa Buffer: Rp5.000.000
- ✅ Progress bar: 66.7% (red)
- ✅ Warning: "⚠️ Peringatan: Dana Darurat Hampir Habis!"

### Scenario 4: Buffer Habis (100% terpakai)
**Data:**
- Total Anggaran: Rp100.000.000
- Total Realisasi: Rp115.000.000
- Buffer: Rp15.000.000 (15%)
- Terpakai: Rp15.000.000 (100%)

**Expected:**
- ✅ Status: "Dana Darurat Kritis" (red)
- ✅ Sisa Buffer: Rp0
- ✅ Progress bar: 100% (red)
- ✅ Warning: "⚠️ Peringatan: Dana Darurat Hampir Habis!"

### Scenario 5: Empty State
**Data:**
- budgetItems = []

**Expected:**
- ✅ Komponen tidak di-render (return null)

### Scenario 6: Mobile Responsive
**Device:** Mobile (375px)

**Expected:**
- ✅ Summary cards: stack vertikal (1 kolom)
- ✅ Progress bar: full width
- ✅ Warning message: responsive
- ✅ Touch-friendly card size

---

## 💡 Use Cases

### Use Case 1: Planning dengan Buffer
**Scenario:** User ingin planning anggaran dengan buffer

**Steps:**
1. Tambah semua budget items
2. Total anggaran: Rp100.000.000
3. Lihat Emergency Buffer Alert
4. Buffer otomatis: Rp15.000.000 (15%)
5. Total dengan buffer: Rp115.000.000
6. User tahu harus siapkan dana minimal Rp115jt

### Use Case 2: Monitoring Buffer Usage
**Scenario:** User ingin monitor penggunaan buffer

**Steps:**
1. Update actual cost setiap pembayaran
2. Buka Dashboard
3. Lihat Emergency Buffer Alert
4. Cek status buffer:
   - Hijau: Aman
   - Kuning: Terbatas
   - Merah: Kritis
5. Ambil tindakan jika perlu

### Use Case 3: Evaluasi Pengeluaran
**Scenario:** Buffer sudah tersentuh, user ingin evaluasi

**Steps:**
1. Lihat warning message
2. Cek progress bar: 66.7% terpakai
3. Identifikasi kategori yang overbudget
4. Evaluasi pengeluaran:
   - Kurangi pengeluaran di kategori lain
   - Negosiasi dengan vendor
   - Tambah anggaran jika diperlukan
5. Update budget items

### Use Case 4: Decision Making
**Scenario:** User ingin decide apakah perlu tambah anggaran

**Steps:**
1. Lihat Emergency Buffer Alert
2. Cek sisa buffer: Rp5.000.000
3. Cek buffer usage: 66.7%
4. Decision:
   - Jika masih ada buffer → lanjutkan
   - Jika buffer hampir habis → tambah anggaran
   - Jika buffer habis → wajib tambah anggaran

---

## 🎯 Best Practices

### 1. Planning dengan Buffer
- ✅ Selalu alokasikan 15% buffer dari total anggaran
- ✅ Pertimbangkan buffer lebih besar (20-25%) untuk wedding besar
- ✅ Dokumentasikan asumsi buffer di catatan

### 2. Monitoring Buffer
- ✅ Cek Emergency Buffer Alert setiap minggu
- ✅ Update actual cost secara real-time
- ✅ Monitor progress bar buffer usage
- ✅ Ambil tindakan preventif jika buffer < 50%

### 3. Evaluasi Pengeluaran
- ✅ Jika buffer tersentuh, identifikasi penyebab
- ✅ Kategorikan pengeluaran:
  - Necessary (perlu) → pertahankan
  - Optional (opsional) → pertimbangkan hapus
  - Emergency (darurat) → dokumentasikan
- ✅ Update budget items berdasarkan evaluasi

### 4. Communication dengan Pasangan
- ✅ Share screenshot Emergency Buffer Alert
- ✅ Diskusi status buffer secara berkala
- ✅ Buat keputusan bersama untuk kontrol pengeluaran

---

## 🔒 Security & Privacy

- ✅ Data hanya diakses dari Zustand store (LocalStorage)
- ✅ Tidak ada data yang dikirim ke server untuk analisis
- ✅ Analisis dilakukan di client-side
- ✅ Tidak ada data sensitif yang di-expose

---

## 📈 Performance

### Optimization
- ✅ `useMemo` untuk `bufferStatus`
- ✅ Hanya re-calculate saat `totalBudget` atau `totalActual` berubah
- ✅ Conditional rendering (hidden jika tidak ada data)
- ✅ Efficient color calculation

### Bundle Size
- ✅ Komponen terpisah (tree-shaking friendly)
- ✅ Tidak ada dependency baru
- ✅ Menggunakan helper yang sudah ada

---

## 🐛 Troubleshooting

### Problem: Emergency Buffer Alert tidak muncul
**Solusi:**
1. Check apakah ada budget items
2. Check apakah totalBudget > 0
3. Check console untuk error
4. Verify komponen di-import dengan benar
5. Refresh browser

### Problem: Buffer usage tidak update
**Solusi:**
1. Update actual cost di halaman Budget
2. Kembali ke Dashboard
3. Verify data ter-update di Zustand store
4. Refresh jika perlu

### Problem: Status color tidak sesuai
**Solusi:**
1. Check logic `getStatusInfo()` di EmergencyBufferAlert.tsx
2. Verify `bufferUsagePercentage` calculation
3. Check kondisi:
   - 0% → green
   - < 50% → amber
   - ≥ 50% → red
4. Debug dengan console.log

### Problem: Progress bar tidak muncul
**Solusi:**
1. Check kondisi `bufferStatus.isBufferTouched`
2. Progress bar hanya muncul jika buffer tersentuh
3. Verify `totalActual > totalBudget`
4. Check CSS styling

---

## 📚 API Reference

### `calculateEmergencyBuffer(totalBudget, percentage)`

**Parameters:**
- `totalBudget` - Total anggaran (number)
- `percentage` - Persentase buffer (default: 15)

**Returns:**
```typescript
{
  bufferAmount: number;
  percentage: number;
  totalWithBuffer: number;
}
```

**Example:**
```typescript
import { calculateEmergencyBuffer } from './helpers';

const result = calculateEmergencyBuffer(100000000, 15);
console.log(result);
// {
//   bufferAmount: 15000000,
//   percentage: 15,
//   totalWithBuffer: 115000000
// }
```

### `checkEmergencyBufferStatus(totalBudget, totalActual, bufferPercentage)`

**Parameters:**
- `totalBudget` - Total anggaran (number)
- `totalActual` - Total realisasi (number)
- `bufferPercentage` - Persentase buffer (default: 15)

**Returns:**
```typescript
{
  bufferAmount: number;
  totalWithBuffer: number;
  remainingSafe: number;
  remainingBuffer: number;
  isBufferTouched: boolean;
  bufferUsagePercentage: number;
}
```

**Example:**
```typescript
import { checkEmergencyBufferStatus } from './helpers';

const status = checkEmergencyBufferStatus(100000000, 110000000, 15);
console.log(status);
// {
//   bufferAmount: 15000000,
//   totalWithBuffer: 115000000,
//   remainingSafe: 0,
//   remainingBuffer: 5000000,
//   isBufferTouched: true,
//   bufferUsagePercentage: 66.67
// }
```

---

## ✅ Build Status

```
✓ Build berhasil tanpa error
✓ 3136 modules transformed
✓ Semua fitur berfungsi
✓ TypeScript types valid
✓ No runtime errors
```

---

## 🎉 Kesimpulan

Fitur **Dana Darurat (Emergency Buffer)** telah berhasil diimplementasikan dengan:

1. ✅ **Helper Functions** - `calculateEmergencyBuffer` dan `checkEmergencyBufferStatus`
2. ✅ **UI Component** - EmergencyBufferAlert dengan summary cards dan progress bar
3. ✅ **Dashboard Integration** - Posisi yang tepat setelah Category Breakdown
4. ✅ **Color-coded Status** - Visual indicators yang jelas (green/amber/red)
5. ✅ **Warning System** - Peringatan berdasarkan level penggunaan buffer
6. ✅ **Responsive Design** - Mobile-friendly dengan stack layout
7. ✅ **Performance** - Optimized dengan useMemo
8. ✅ **Safe Data Access** - Fallback untuk empty state

**User sekarang bisa:**
- ✅ Lihat alokasi dana darurat 15%
- ✅ Monitor penggunaan buffer secara real-time
- ✅ Terima warning jika buffer tersentuh
- ✅ Ambil tindakan preventif sebelum buffer habis
- ✅ Make informed decisions tentang pengeluaran

**Dana darurat sekarang termonitor dengan baik!** 🛡️

---

## 🚀 Future Enhancements

### Phase 2 (Optional)
- [ ] Customizable buffer percentage (user bisa set 10%, 20%, dll)
- [ ] Buffer recommendation engine (saran persentase berdasarkan total anggaran)
- [ ] Historical buffer usage tracking
- [ ] Export buffer report ke PDF/Excel
- [ ] Notification saat buffer usage mencapai threshold tertentu

### Phase 3 (Advanced)
- [ ] AI-powered buffer optimization
- [ ] Predictive analysis (prediksi buffer usage di masa depan)
- [ ] Integration dengan vendor management
- [ ] Automated alerts via email/WhatsApp
- [ ] Buffer templates berdasarkan jenis wedding

---

**Implementasi selesai! 🎉**
