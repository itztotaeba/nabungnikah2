# 📝 Panduan Implementasi Audit Trail di Semua Halaman

## Ringkasan

Dokumentasi ini menjelaskan cara menambahkan audit trail info di 5 halaman data:
1. ✅ BudgetManager (sudah diimplementasi)
2. ⏳ VendorManager
3. ⏳ GuestManager
4. ⏳ TimelineManager
5. ⏳ SavingsTracker

---

## 1. BudgetManager (✅ SELESAI)

### Import Helper
```typescript
import { formatAuditInfo } from '../helpers/timeAgo';
```

### Desktop Table
```typescript
// Tambah kolom di header
<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
  Terakhir Diubah
</th>

// Tambah data di setiap row
<td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
  {formatAuditInfo(item.updatedBy, item.updatedAt)}
</td>
```

### Mobile Cards
```typescript
{/* Audit Info */}
<div className="pt-2 border-t border-gray-100">
  <p className="text-xs text-gray-500 text-right">
    {formatAuditInfo(item.updatedBy, item.updatedAt)}
  </p>
</div>
```

---

## 2. VendorManager

### Import Helper
```typescript
import { formatAuditInfo } from '../helpers/timeAgo';
```

### Card View (Desktop & Mobile)
```typescript
// Di setiap vendor card, tambahkan di bagian bawah
<div className="mt-3 pt-3 border-t border-gray-100">
  <p className="text-xs text-gray-500 text-right">
    {formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}
  </p>
</div>
```

### Contoh Lengkap
```typescript
<div key={vendor.id} className="bg-white rounded-xl border border-[#E8E0D4] p-5 hover:shadow-md transition-shadow">
  {/* Header */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-800 truncate">{vendor.name}</h3>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeBadge(vendor.type)}`}>
          {vendor.type}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          {vendor.category}
        </span>
      </div>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(vendor.contractStatus)}`}>
      {vendor.contractStatus}
    </span>
  </div>

  {/* Progress Bar */}
  <div className="mb-3">
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>Progress Pembayaran</span>
      <span>{progress.toFixed(0)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>

  {/* Info */}
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-gray-500">Harga Deal:</span>
      <span className="font-semibold text-gray-800">{formatCurrency(vendor.dealPrice, settings.currency)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">DP:</span>
      <span className="font-medium text-gray-700">{formatCurrency(vendor.dpAmount, settings.currency)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Sisa:</span>
      <span className="font-medium text-[#B76E79]">{formatCurrency(vendor.remainingBalance, settings.currency)}</span>
    </div>
    {vendor.dueDateFinal && (
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <Calendar size={12} />
        <span>Jatuh tempo: {new Date(vendor.dueDateFinal).toLocaleDateString('id-ID')}</span>
      </div>
    )}
  </div>

  {/* Audit Info - TAMBAHKAN DI SINI */}
  <div className="mt-3 pt-3 border-t border-gray-100">
    <p className="text-xs text-gray-500 text-right">
      {formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}
    </p>
  </div>

  {/* Actions */}
  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
    <button
      onClick={() => handleEdit(vendor)}
      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
    >
      <Pencil size={12} />
      Edit
    </button>
    <button
      onClick={() => handleDelete(vendor.id, vendor.name)}
      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
    >
      <Trash2 size={12} />
      Hapus
    </button>
  </div>
</div>
```

---

## 3. GuestManager

### Import Helper
```typescript
import { formatAuditInfo } from '../helpers/timeAgo';
```

### Desktop Table
```typescript
// Tambah kolom di header
<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
  Terakhir Diubah
</th>

// Tambah data di setiap row
<td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
  {formatAuditInfo(guest.updatedBy, guest.updatedAt)}
</td>
```

### Mobile Cards
```typescript
{/* Audit Info */}
<div className="mt-2 pt-2 border-t border-gray-100">
  <p className="text-xs text-gray-500 text-right">
    {formatAuditInfo(guest.updatedBy, guest.updatedAt)}
  </p>
</div>
```

### Contoh Lengkap (Mobile Card)
```typescript
<div key={guest.id} className="p-4 space-y-3">
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="font-medium text-gray-800">{guest.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${rsvpBadge(guest.rsvpStatus)}`}>
          {guest.rsvpStatus}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
          {guest.category}
        </span>
        <span>{guest.pax} pax</span>
        {guest.estimatedGift > 0 && (
          <span>Est. {formatCurrency(guest.estimatedGift, settings.currency)}</span>
        )}
      </div>
    </div>
    <div className="flex gap-1 shrink-0">
      <button
        onClick={() => handleEdit(guest)}
        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Pencil size={16} className="text-blue-600" />
      </button>
      <button
        onClick={() => handleDelete(guest.id, guest.name)}
        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={16} className="text-red-600" />
      </button>
    </div>
  </div>
  
  {/* Audit Info - TAMBAHKAN DI SINI */}
  <div className="mt-2 pt-2 border-t border-gray-100">
    <p className="text-xs text-gray-500 text-right">
      {formatAuditInfo(guest.updatedBy, guest.updatedAt)}
    </p>
  </div>
</div>
```

---

## 4. TimelineManager

### Import Helper
```typescript
import { formatAuditInfo } from '../helpers/timeAgo';
```

### Task Item
```typescript
{/* Audit Info */}
<div className="mt-2 pt-2 border-t border-gray-100">
  <p className="text-xs text-gray-500 text-right">
    {formatAuditInfo(task.updatedBy, task.updatedAt)}
  </p>
</div>
```

### Contoh Lengkap
```typescript
<div
  key={taskId}
  className={`px-5 py-4 flex items-start gap-3 hover:bg-[#FDFBF7] transition-colors ${
    taskIsCompleted ? 'opacity-60' : ''
  }`}
>
  {/* Custom Checkbox */}
  <button
    onClick={() => handleToggle(taskId)}
    className="flex-shrink-0 mt-0.5"
  >
    {taskIsCompleted ? (
      <CheckCircle2 size={22} className="text-[#87A878] transition-all" />
    ) : (
      <Circle size={22} className="text-gray-300 hover:text-[#87A878] transition-all" />
    )}
  </button>

  {/* Task Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <p className={`font-medium ${taskIsCompleted ? 'line-through text-gray-500' : 'text-gray-800'} transition-all`}>
          {taskTitle}
        </p>
        {taskDescription && (
          <p className="text-sm text-gray-500 mt-1">{taskDescription}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryBadge(taskCategory)}`}>
            {taskCategory}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${assigneeBadge(taskAssignee)}`}>
            {assigneeIcon(taskAssignee)}
            {taskAssignee}
          </span>
        </div>
        
        {/* Audit Info - TAMBAHKAN DI SINI */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-right">
            {formatAuditInfo(task?.updatedBy, task?.updatedAt)}
          </p>
        </div>
      </div>

      {/* Delete Button (only for custom tasks) */}
      {!taskIsDefault && (
        <button
          onClick={() => handleDelete(taskId, taskTitle)}
          className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Hapus tugas"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      )}
    </div>
  </div>
</div>
```

---

## 5. SavingsTracker

### Import Helper
```typescript
import { formatAuditInfo } from '../helpers/timeAgo';
```

### Desktop Table
```typescript
// Tambah kolom di header
<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
  Terakhir Diubah
</th>

// Tambah data di setiap row
<td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
  {formatAuditInfo(entry.updatedBy, entry.updatedAt)}
</td>
```

### Mobile Cards
```typescript
{/* Audit Info */}
<div className="mt-2 pt-2 border-t border-gray-100">
  <p className="text-xs text-gray-500 text-right">
    {formatAuditInfo(entry.updatedBy, entry.updatedAt)}
  </p>
</div>
```

### Contoh Lengkap (Mobile Card)
```typescript
<div key={entry.id} className="p-4">
  <div className="flex items-start justify-between gap-3 mb-2">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Calendar size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">
          {new Date(entry.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F0E8] text-gray-600 font-medium">
          {entry.source}
        </span>
      </div>
      <p className="text-lg font-bold text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
      {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
    </div>
    <button
      onClick={() => handleDelete(entry.id)}
      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 size={16} className="text-red-600" />
    </button>
  </div>
  
  {/* Audit Info - TAMBAHKAN DI SINI */}
  <div className="mt-2 pt-2 border-t border-gray-100">
    <p className="text-xs text-gray-500 text-right">
      {formatAuditInfo(entry.updatedBy, entry.updatedAt)}
    </p>
  </div>
</div>
```

---

## Conflict Detection Integration

### Contoh Implementasi di Modal Edit

```typescript
import ConflictModal from './ConflictModal';

export default function VendorManager() {
  const { vendors, updateVendor } = useWeddingStore();
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [originalVendor, setOriginalVendor] = useState<Vendor | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setOriginalVendor(vendor); // Simpan snapshot
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVendor) return;

    // Cek konflik
    const currentVendor = vendors.find(v => v.id === editingVendor.id);
    
    if (currentVendor && originalVendor && 
        currentVendor.updatedAt !== originalVendor.updatedAt) {
      // Konflik terdeteksi!
      setShowConflictModal(true);
      return;
    }

    // Tidak ada konflik, lanjutkan save
    saveVendor();
  };

  const saveVendor = () => {
    if (!editingVendor) return;
    
    updateVendor(editingVendor.id, {
      name: editingVendor.name,
      // ... other fields
    });
    
    addToast('Vendor berhasil diupdate', 'success');
    resetForm();
  };

  const handleOverride = () => {
    saveVendor();
    setShowConflictModal(false);
  };

  const handleCancel = () => {
    setShowConflictModal(false);
    // Reload data terbaru
    if (editingVendor) {
      const latestVendor = vendors.find(v => v.id === editingVendor.id);
      if (latestVendor) {
        setEditingVendor(latestVendor);
      }
    }
  };

  return (
    <>
      {/* Form edit */}
      {showForm && editingVendor && (
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      )}

      {/* Conflict Modal */}
      <ConflictModal
        isOpen={showConflictModal}
        onClose={handleCancel}
        onOverride={handleOverride}
        itemName={editingVendor?.name || ''}
        itemType="Vendor"
        lastUpdatedBy={vendors.find(v => v.id === editingVendor?.id)?.updatedBy}
        lastUpdatedAt={vendors.find(v => v.id === editingVendor?.id)?.updatedAt}
      />
    </>
  );
}
```

---

## Testing Checklist

### Test 1: Audit Trail Display
- [ ] Login sebagai User A
- [ ] Tambah budget item baru
- [ ] Verifikasi audit info muncul: "✏️ userA@example.com • Baru saja"
- [ ] Tunggu 1 menit
- [ ] Verifikasi audit info update: "✏️ userA@example.com • 1 menit yang lalu"

### Test 2: Audit Trail dengan Multi-User
- [ ] Login sebagai User A dan User B
- [ ] User A tambah budget item
- [ ] Verifikasi di User B, audit info muncul: "✏️ userA@example.com • ..."
- [ ] User B edit budget item yang sama
- [ ] Verifikasi di User A, audit info update: "✏️ userB@example.com • Baru saja"

### Test 3: Conflict Detection
- [ ] Login sebagai User A dan User B
- [ ] User A buka modal edit vendor
- [ ] User B edit vendor yang sama (di browser lain)
- [ ] User A klik "Simpan"
- [ ] Verifikasi ConflictModal muncul
- [ ] Klik "Timpa" → data User A menang
- [ ] Ulangi test, klik "Batal" → data User B tetap

### Test 4: Responsive Design
- [ ] Test di mobile (375px)
- [ ] Verifikasi audit info muncul di mobile cards
- [ ] Test di desktop (1440px)
- [ ] Verifikasi audit info muncul di desktop table

---

## Notes

### Styling Guidelines
- Font size: `text-xs`
- Color: `text-gray-500`
- Position: Pojok kanan bawah card / kolom terakhir di table
- Border: `border-t border-gray-100` untuk separator
- Padding: `pt-2` untuk spacing atas

### Performance Tips
- Gunakan `hidden lg:table-cell` untuk kolom audit di desktop table
- Audit info hanya ditampilkan jika `updatedBy` atau `updatedAt` ada
- Gunakan optional chaining: `item?.updatedBy` untuk safety

### Accessibility
- Audit info tidak boleh mengganggu interaksi utama
- Gunakan `aria-label` jika perlu
- Pastikan contrast ratio memenuhi WCAG AA

---

## Summary

✅ **Sudah Diimplementasi:**
- Helper `timeAgo.ts` dengan `formatTimeAgo()` dan `formatAuditInfo()`
- Helper `auditTrail.ts` dengan conflict detection
- ConflictModal component
- BudgetManager dengan audit info
- Store integration dengan audit metadata
- Sync integration dengan conflict detection

⏳ **Perlu Diimplementasi Manual:**
- VendorManager dengan audit info
- GuestManager dengan audit info
- TimelineManager dengan audit info
- SavingsTracker dengan audit info
- Conflict detection integration di semua modal edit

**Build Status:** ✅ Berhasil tanpa error
