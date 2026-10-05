import { useState, useMemo } from 'react';
import { useWeddingStore, Guest } from '../store';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { generateGuestPDF } from '../helpers/pdfGenerator';
import { useToastStore } from '../toastStore';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Gift,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  UserCheck,
  UserX,
  UserPlus,
  X,
  FileText,
} from 'lucide-react';

const GUEST_CATEGORIES: Guest['category'][] = ['Keluarga', 'Teman', 'Rekan Kerja', 'Lainnya'];
const RSVP_OPTIONS: Guest['rsvpStatus'][] = ['Belum Respon', 'Hadir', 'Tidak Hadir'];

// Badge warna per kategori
const categoryBadge = (category: string) => {
  switch (category) {
    case 'Keluarga':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Teman':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Rekan Kerja':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Badge warna per RSVP
const rsvpBadge = (status: string) => {
  switch (status) {
    case 'Hadir':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Tidak Hadir':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
};

export default function GuestManager() {
  const { settings, guests, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const { addToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterRsvp, setFilterRsvp] = useState<string>('Semua');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Guest['category']>('Keluarga');
  const [pax, setPax] = useState('1');
  const [estimatedGift, setEstimatedGift] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<Guest['rsvpStatus']>('Belum Respon');

  // ============================================
  // STATISTIK (dihitung dari data store)
  // ============================================
  const stats = useMemo(() => {
    const totalPax = guests.reduce((sum, g) => sum + g.pax, 0);
    const confirmedPax = guests
      .filter((g) => g.rsvpStatus === 'Hadir')
      .reduce((sum, g) => sum + g.pax, 0);
    const declinedPax = guests
      .filter((g) => g.rsvpStatus === 'Tidak Hadir')
      .reduce((sum, g) => sum + g.pax, 0);
    const pendingPax = guests
      .filter((g) => g.rsvpStatus === 'Belum Respon')
      .reduce((sum, g) => sum + g.pax, 0);
    const totalEstimatedGift = guests.reduce((sum, g) => sum + g.estimatedGift, 0);

    return {
      totalPax,
      confirmedPax,
      declinedPax,
      pendingPax,
      totalEstimatedGift,
      totalGuests: guests.length,
    };
  }, [guests]);

  // ============================================
  // FILTERED & SORTED GUESTS
  // ============================================
  const filteredGuests = useMemo(() => {
    let result = [...guests];

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(query));
    }

    // Filter by category
    if (filterCategory !== 'Semua') {
      result = result.filter((g) => g.category === filterCategory);
    }

    // Filter by RSVP
    if (filterRsvp !== 'Semua') {
      result = result.filter((g) => g.rsvpStatus === filterRsvp);
    }

    // Sort by name A-Z
    result.sort((a, b) => a.name.localeCompare(b.name, 'id'));

    return result;
  }, [guests, searchQuery, filterCategory, filterRsvp]);

  // ============================================
  // FORM HANDLERS
  // ============================================
  const resetForm = () => {
    setName('');
    setCategory('Keluarga');
    setPax('1');
    setEstimatedGift('');
    setRsvpStatus('Belum Respon');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      addToast('Nama tamu tidak boleh kosong', 'error');
      return;
    }

    const paxNum = parseInt(pax);
    if (isNaN(paxNum) || paxNum < 1) {
      addToast('Jumlah pax minimal 1', 'error');
      return;
    }

    const giftNum = parseInt(estimatedGift) || 0;
    if (giftNum < 0) {
      addToast('Estimasi amplop harus angka positif', 'error');
      return;
    }

    const guestData = {
      name: name.trim(),
      category,
      pax: paxNum,
      estimatedGift: giftNum,
      rsvpStatus,
    };

    if (editingId) {
      updateGuest(editingId, guestData);
      addToast(`Data tamu "${name.trim()}" berhasil diupdate`, 'success');
    } else {
      addGuest(guestData);
      addToast(`Tamu "${name.trim()}" berhasil ditambahkan`, 'success');
    }

    resetForm();
  };

  const handleEdit = (guest: Guest) => {
    setName(guest.name);
    setCategory(guest.category);
    setPax(guest.pax.toString());
    setEstimatedGift(guest.estimatedGift.toString());
    setRsvpStatus(guest.rsvpStatus);
    setEditingId(guest.id);
    setShowForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, guestName: string) => {
    if (window.confirm(`Hapus tamu "${guestName}" dari daftar?`)) {
      deleteGuest(id);
      addToast(`Tamu "${guestName}" berhasil dihapus`, 'success');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('Semua');
    setFilterRsvp('Semua');
  };

  const hasActiveFilters = searchQuery || filterCategory !== 'Semua' || filterRsvp !== 'Semua';

  // Handle Export PDF
  const handleExportPDF = () => {
    try {
      if (guests.length === 0) {
        addToast('Data tamu masih kosong, tidak ada yang bisa di-export', 'warning');
        return;
      }
      generateGuestPDF(guests, settings);
      addToast('PDF berhasil dibuat!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      addToast('Gagal membuat PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Daftar Tamu</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar tamu undangan pernikahanmu</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg hover:shadow-[#87A878]/20 transition-all text-sm font-medium"
            >
              <FileText size={16} />
              Export PDF
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/20 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Tamu
            </button>
          </div>
        )}
      </div>

      {/* ============================================
          STATISTIK CARDS (5 cards)
          ============================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Tamu */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Tamu</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.totalPax}</p>
          <p className="text-xs text-gray-400">{stats.totalGuests} orang</p>
        </div>

        {/* Konfirmasi Hadir */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCheck size={16} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Hadir</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{stats.confirmedPax}</p>
          <p className="text-xs text-gray-400">pax konfirmasi</p>
        </div>

        {/* Tidak Hadir */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX size={16} className="text-red-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Tidak Hadir</p>
          <p className="text-xl font-bold text-red-600 mt-0.5">{stats.declinedPax}</p>
          <p className="text-xs text-gray-400">pax menolak</p>
        </div>

        {/* Belum Respon */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Belum Respon</p>
          <p className="text-xl font-bold text-amber-600 mt-0.5">{stats.pendingPax}</p>
          <p className="text-xs text-gray-400">pax menunggu</p>
        </div>

        {/* Estimasi Amplop */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4] col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#B76E79]/10 rounded-lg flex items-center justify-center">
              <Gift size={16} className="text-[#B76E79]" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Est. Pemasukan</p>
          <p className="text-lg font-bold text-[#B76E79] mt-0.5">
            {formatCurrency(stats.totalEstimatedGift, settings.currency)}
          </p>
          <p className="text-xs text-gray-400">dari amplop tamu</p>
        </div>
      </div>

      {/* ============================================
          INLINE FORM
          ============================================ */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              {editingId ? '✏️ Edit Tamu' : '✨ Tambah Tamu Baru'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Tamu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guest['category'])}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              >
                {GUEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Pax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pax</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPax((prev) => String(Math.max(1, parseInt(prev) - 1)))}
                  className="w-10 h-10 rounded-xl border border-[#E8E0D4] flex items-center justify-center hover:bg-[#F5F0E8] transition-colors text-gray-600 font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={pax}
                  onChange={(e) => setPax(e.target.value)}
                  min="1"
                  max="10"
                  className="w-20 text-center px-3 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setPax((prev) => String(Math.min(10, parseInt(prev) + 1)))}
                  className="w-10 h-10 rounded-xl border border-[#E8E0D4] flex items-center justify-center hover:bg-[#F5F0E8] transition-colors text-gray-600 font-bold"
                >
                  +
                </button>
                <span className="text-xs text-gray-400 ml-2">orang</span>
              </div>
            </div>

            {/* Estimasi Amplop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Amplop</label>
              <input
                type="number"
                value={estimatedGift}
                onChange={(e) => setEstimatedGift(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
              {estimatedGift && parseInt(estimatedGift) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseInt(estimatedGift), settings.currency)}
                </p>
              )}
            </div>

            {/* RSVP Status */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status RSVP</label>
              <div className="flex gap-2 flex-wrap">
                {RSVP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRsvpStatus(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      rsvpStatus === opt
                        ? rsvpBadge(opt) + ' border-current'
                        : 'border-[#E8E0D4] bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt === 'Hadir' && '✅ '}
                    {opt === 'Tidak Hadir' && '❌ '}
                    {opt === 'Belum Respon' && '⏳ '}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-xl hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              {editingId ? 'Update Tamu' : 'Simpan Tamu'}
            </button>
          </div>
        </form>
      )}

      {/* ============================================
          FILTER & SEARCH BAR
          ============================================ */}
      <div className="bg-white rounded-xl p-4 border border-[#E8E0D4] space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filter & Cari</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-[#B76E79] hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tamu..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] text-sm"
            />
          </div>

          {/* Filter Kategori */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] text-sm"
          >
            <option value="Semua">Semua Kategori</option>
            {GUEST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Filter RSVP */}
          <select
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] text-sm"
          >
            <option value="Semua">Semua Status RSVP</option>
            {RSVP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        {hasActiveFilters && (
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{filteredGuests.length}</span> dari{' '}
            <span className="font-semibold text-gray-700">{guests.length}</span> tamu
          </p>
        )}
      </div>

      {/* ============================================
          TABEL DAFTAR TAMU
          ============================================ */}
      {guests.length === 0 ? (
        /* Empty State - belum ada tamu sama sekali */
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada daftar tamu</p>
          <p className="text-sm text-gray-400 mt-1">Yuk mulai tambahkan tamu pertamamu!</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            + Tambah Tamu Pertama
          </button>
        </div>
      ) : filteredGuests.length === 0 ? (
        /* Empty State - filter tidak cocok */
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-14 h-14 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Tidak ada tamu yang cocok</p>
          <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-[#B76E79] hover:underline font-medium"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E0D4] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F0E8]/50 border-b border-[#E8E0D4]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Tamu
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pax
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Est. Amplop
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status RSVP
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-800">{guest.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${categoryBadge(guest.category)}`}
                      >
                        {guest.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700">{guest.pax}</td>
                    <td className="px-5 py-4 text-sm text-right text-gray-700">
                      {guest.estimatedGift > 0
                        ? formatCurrency(guest.estimatedGift, settings.currency)
                        : '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${rsvpBadge(guest.rsvpStatus)}`}
                      >
                        {guest.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(guest)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id, guest.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer - Total */}
              <tfoot className="bg-[#F5F0E8]/30 border-t-2 border-[#E8E0D4]">
                <tr>
                  <td colSpan={2} className="px-5 py-3 text-sm font-bold text-gray-800">
                    TOTAL ({filteredGuests.length} tamu)
                  </td>
                  <td className="px-5 py-3 text-sm text-center font-bold text-gray-800">
                    {filteredGuests.reduce((sum, g) => sum + g.pax, 0)} pax
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-[#B76E79]">
                    {formatCurrency(
                      filteredGuests.reduce((sum, g) => sum + g.estimatedGift, 0),
                      settings.currency
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#F5F0E8]">
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{guest.name}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryBadge(guest.category)}`}
                      >
                        {guest.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${rsvpBadge(guest.rsvpStatus)}`}
                      >
                        {guest.rsvpStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(guest)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id, guest.name)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {guest.pax} pax
                  </span>
                  {guest.estimatedGift > 0 && (
                    <span className="flex items-center gap-1">
                      <Gift size={12} />
                      {formatCurrency(guest.estimatedGift, settings.currency)}
                    </span>
                  )}
                </div>
                {/* Audit Info */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-right">
                    {formatAuditInfo(guest.updatedBy, guest.updatedAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Mobile Footer Total */}
            <div className="px-4 py-3 bg-[#F5F0E8]/30 border-t-2 border-[#E8E0D4]">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-800">
                  Total ({filteredGuests.length} tamu)
                </span>
                <span className="font-bold text-[#B76E79]">
                  {formatCurrency(
                    filteredGuests.reduce((sum, g) => sum + g.estimatedGift, 0),
                    settings.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
