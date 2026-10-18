/**
 * SeserahanManager.tsx
 *
 * Fitur "Daftar Seserahan" — terinspirasi dari konsep halaman seserahan
 * amarawedding.id/seserahan:
 * - Barang dicatat per baki/kategori (Alat Sholat, Masakan & Buah, dll)
 * - Estimasi biaya per barang + status sudah dibeli / belum
 * - Brand/merek, tautan belanja, label (misal "Rekomendasi"), catatan
 *
 * Mengikuti pola store & UI yang sudah ada (VendorManager/GuestManager):
 * Zustand store + audit trail + toast + styling hijau-emas Mahes & Aira.
 */

import { useState, useMemo } from 'react';
import {
  useWeddingStore,
  SeserahanItem,
  SeserahanCategory,
} from '../store';
import { SESERAHAN_CATEGORIES } from '../types/seserahan';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { useToastStore } from '../toastStore';
import {
  Plus,
  Pencil,
  Trash2,
  Gift,
  Check,
  Square,
  Link2,
  Tag,
  Search,
} from 'lucide-react';

type StatusFilter = 'Semua' | 'Belum Dibeli' | 'Sudah Dibeli';

const INPUT_CLASS =
  'w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]';
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-1';

export default function SeserahanManager() {
  const settings = useWeddingStore((s) => s.settings);
  const seserahanItems = useWeddingStore((s) => s.seserahanItems);
  const addSeserahanItem = useWeddingStore((s) => s.addSeserahanItem);
  const updateSeserahanItem = useWeddingStore((s) => s.updateSeserahanItem);
  const deleteSeserahanItem = useWeddingStore((s) => s.deleteSeserahanItem);
  const toggleSeserahanBought = useWeddingStore((s) => s.toggleSeserahanBought);
  const { addToast } = useToastStore();

  // ---- Form state ----
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SeserahanCategory>('Alat Sholat');
  const [brand, setBrand] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isBought, setIsBought] = useState(false);
  const [link, setLink] = useState('');
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');

  // ---- Filter state ----
  const [filterCategory, setFilterCategory] = useState<'Semua' | SeserahanCategory>('Semua');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('Semua');
  const [search, setSearch] = useState('');

  // ---- Statistik ----
  const totalEstimate = useMemo(
    () => seserahanItems.reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
    [seserahanItems]
  );
  const boughtCount = useMemo(
    () => seserahanItems.filter((i) => i.isBought).length,
    [seserahanItems]
  );
  const boughtEstimate = useMemo(
    () => seserahanItems.filter((i) => i.isBought).reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
    [seserahanItems]
  );
  const progressPct = totalEstimate > 0 ? Math.round((boughtEstimate / totalEstimate) * 100) : 0;

  // ---- Data terfilter, dikelompokkan per kategori ----
  const groupedByCategory = useMemo(() => {
    const filtered = seserahanItems.filter((item) => {
      if (filterCategory !== 'Semua' && item.category !== filterCategory) return false;
      if (filterStatus === 'Sudah Dibeli' && !item.isBought) return false;
      if (filterStatus === 'Belum Dibeli' && item.isBought) return false;
      const q = search.trim().toLowerCase();
      if (q && !`${item.title} ${item.brand || ''} ${item.label || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const groups: Record<string, SeserahanItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    // Urutkan sesuai urutan SESERAHAN_CATEGORIES
    return SESERAHAN_CATEGORIES.filter((c) => groups[c]).map((c) => ({
      category: c,
      items: groups[c],
    }));
  }, [seserahanItems, filterCategory, filterStatus, search]);

  const resetForm = () => {
    setTitle('');
    setCategory('Alat Sholat');
    setBrand('');
    setEstimatedCost('');
    setIsBought(false);
    setLink('');
    setLabel('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Nama barang seserahan wajib diisi', 'error');
      return;
    }
    if (!estimatedCost || parseInt(estimatedCost) < 0) {
      addToast('Estimasi biaya wajib diisi (boleh 0)', 'error');
      return;
    }

    const itemData: Omit<SeserahanItem, 'id'> = {
      title: title.trim(),
      category,
      brand: brand.trim() || undefined,
      estimatedCost: parseInt(estimatedCost) || 0,
      isBought,
      link: link.trim() || undefined,
      label: label.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingId) {
      updateSeserahanItem(editingId, itemData);
      addToast('Item seserahan berhasil diupdate', 'success');
    } else {
      addSeserahanItem(itemData);
      addToast('Item seserahan berhasil ditambahkan', 'success');
    }

    resetForm();
  };

  const handleEdit = (item: SeserahanItem) => {
    setTitle(item.title);
    setCategory(item.category);
    setBrand(item.brand || '');
    setEstimatedCost(item.estimatedCost.toString());
    setIsBought(item.isBought);
    setLink(item.link || '');
    setLabel(item.label || '');
    setNotes(item.notes || '');
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`Hapus "${itemName}" dari daftar seserahan?`)) {
      deleteSeserahanItem(id);
      if (editingId === id) resetForm();
      addToast('Item seserahan berhasil dihapus', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-gray-900 flex items-center gap-2">
            <Gift className="text-[#D4A843]" size={26} />
            Daftar Seserahan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Catat barang seserahan per baki/kategori beserta estimasi biaya dan progres belanjanya.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2F6A43] text-white rounded-md hover:bg-[#1E4A2E] transition-colors font-medium shadow-sm self-start sm:self-auto"
          >
            <Plus size={18} /> Tambah Barang
          </button>
        )}
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E0D4] p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Item</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {seserahanItems.length}{' '}
            <span className="text-sm font-normal text-gray-500">({boughtCount} terbeli)</span>
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E0D4] p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Estimasi Total</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatCurrency(totalEstimate, settings.currency)}
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E0D4] p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Progres Terbeli</p>
          <p className="text-xl font-bold text-[#2F6A43] mt-1">{progressPct}%</p>
          <div className="mt-2 h-2 rounded-full bg-[#E8F0EA] overflow-hidden">
            <div
              className="h-full bg-[#2F6A43] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur rounded-xl border border-[#E8E0D4] p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold text-gray-900">
              {editingId ? 'Edit Item Seserahan' : 'Tambah Item Seserahan'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Nama Barang *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Contoh: "Mukena bordir"'
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Kategori / Baki</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SeserahanCategory)}
                className={INPUT_CLASS}
              >
                {SESERAHAN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Brand / Merek</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder='Opsional, contoh: "Watukensha"'
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Estimasi Biaya (Rp) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Label / Badge</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder='Opsional, contoh: "Rekomendasi"'
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Link Belanja</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://shopee.co.id/..."
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder='Contoh: "Warna sage green, ukuran M"'
              className={INPUT_CLASS}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={isBought}
              onChange={(e) => setIsBought(e.target.checked)}
              className="w-4 h-4 accent-[#2F6A43]"
            />
            Sudah dibeli
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2F6A43] text-white rounded-md hover:bg-[#1E4A2E] transition-colors font-medium"
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Item'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 border border-[#E8E0D4] text-gray-600 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white/60 backdrop-blur rounded-xl border border-[#E8E0D4] p-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang, brand, atau label..."
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-white text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as 'Semua' | SeserahanCategory)}
          className="md:w-48 px-3 py-2 border border-[#E8E0D4] rounded-md bg-white text-sm outline-none focus:border-[#87A878]"
        >
          <option value="Semua">Semua Kategori</option>
          {SESERAHAN_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
          className="md:w-40 px-3 py-2 border border-[#E8E0D4] rounded-md bg-white text-sm outline-none focus:border-[#87A878]"
        >
          <option value="Semua">Semua Status</option>
          <option value="Belum Dibeli">Belum Dibeli</option>
          <option value="Sudah Dibeli">Sudah Dibeli</option>
        </select>
      </div>

      {/* Daftar per Kategori */}
      {seserahanItems.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-xl border border-dashed border-[#E8E0D4]">
          <Gift size={40} className="mx-auto text-[#D4A843]/60 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada item seserahan</p>
          <p className="text-sm text-gray-400 mt-1">
            Klik "Tambah Barang" untuk mulai mencatat daftar seserahan.
          </p>
        </div>
      ) : groupedByCategory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Tidak ada item yang cocok dengan filter.</div>
      ) : (
        <div className="space-y-6">
          {groupedByCategory.map(({ category: cat, items }) => {
            const catTotal = items.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
            const catBought = items.filter((i) => i.isBought).length;
            return (
              <div key={cat} className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E0D4] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E8E0D4] bg-[#FDFBF7] flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-gray-800">{cat}</h3>
                  <span className="text-xs text-gray-500">
                    {catBought}/{items.length} terbeli · {formatCurrency(catTotal, settings.currency)}
                  </span>
                </div>
                <ul className="divide-y divide-[#F0EBE1]">
                  {items.map((item) => (
                    <li key={item.id} className="px-5 py-3 flex items-start gap-3 hover:bg-[#FDFBF7] transition-colors">
                      {/* Toggle sudah dibeli */}
                      <button
                        onClick={() => toggleSeserahanBought(item.id)}
                        title={item.isBought ? 'Tandai belum dibeli' : 'Tandai sudah dibeli'}
                        className="mt-0.5 shrink-0"
                      >
                        {item.isBought ? (
                          <Check size={20} className="text-[#2F6A43]" strokeWidth={2.5} />
                        ) : (
                          <Square size={20} className="text-gray-300" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-medium ${
                              item.isBought ? 'text-gray-400 line-through' : 'text-gray-800'
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.label && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF3D6] text-[#9A7420] text-[11px] font-medium border border-[#D4A843]/30">
                              <Tag size={11} /> {item.label}
                            </span>
                          )}
                          {item.isBought && (
                            <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2F6A43] text-[11px] font-medium">
                              Sudah Dibeli
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {item.brand && <span>Merek: {item.brand}</span>}
                          <span className="font-semibold text-gray-700">
                            {formatCurrency(item.estimatedCost, settings.currency)}
                          </span>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#2F6A43] hover:underline"
                            >
                              <Link2 size={13} /> Link Belanja
                            </a>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>
                        )}
                        {(item.updatedBy || item.updatedAt) && (
                          <p className="text-[11px] text-gray-300 mt-1">
                            {formatAuditInfo(item.updatedBy, item.updatedAt)}
                          </p>
                        )}
                      </div>

                      {/* Aksi */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-[#2F6A43] rounded-md hover:bg-[#E8F0EA] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
