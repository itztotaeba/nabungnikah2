import { useState } from 'react';
import { useWeddingStore, Guest } from '../store';
import { formatCurrency } from '../helpers';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

const GUEST_CATEGORIES: Guest['category'][] = ['Keluarga', 'Teman', 'Rekan Kerja', 'Lainnya'];
const RSVP_OPTIONS: Guest['rsvpStatus'][] = ['Belum Respon', 'Hadir', 'Tidak Hadir'];

export default function GuestManager() {
  const { settings, guests, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('Semua');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Guest['category']>('Keluarga');
  const [pax, setPax] = useState('1');
  const [estimatedGift, setEstimatedGift] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<Guest['rsvpStatus']>('Belum Respon');

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
    if (!name.trim()) return;

    const guestData = {
      name: name.trim(),
      category,
      pax: parseInt(pax) || 1,
      estimatedGift: parseInt(estimatedGift) || 0,
      rsvpStatus,
    };

    if (editingId) {
      updateGuest(editingId, guestData);
    } else {
      addGuest(guestData);
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
  };

  // Stats
  const totalPax = guests.reduce((sum, g) => sum + g.pax, 0);
  const confirmedPax = guests.filter(g => g.rsvpStatus === 'Hadir').reduce((sum, g) => sum + g.pax, 0);
  const totalEstimatedGift = guests.reduce((sum, g) => sum + g.estimatedGift, 0);

  // Filter
  const filteredGuests = filterCategory === 'Semua'
    ? guests
    : guests.filter(g => g.category === filterCategory);

  const rsvpBadge = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Tidak Hadir': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
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
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/20 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Tambah Tamu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Tamu</p>
              <p className="text-lg font-bold text-gray-800">{guests.length} <span className="text-sm font-normal text-gray-500">/ {totalPax} pax</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Konfirmasi Hadir</p>
              <p className="text-lg font-bold text-gray-800">{confirmedPax} <span className="text-sm font-normal text-gray-500">pax</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">🎁</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Estimasi Angpao</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalEstimatedGift, settings.currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <h3 className="font-heading text-lg font-semibold text-gray-800">
            {editingId ? '✏️ Edit Tamu' : '✨ Tambah Tamu Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nama Tamu</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guest['category'])}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              >
                {GUEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Jumlah Pax</label>
              <input
                type="number"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Estimasi Angpao</label>
              <input
                type="number"
                value={estimatedGift}
                onChange={(e) => setEstimatedGift(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Status RSVP</label>
              <div className="flex gap-2 flex-wrap">
                {RSVP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRsvpStatus(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      rsvpStatus === opt
                        ? opt === 'Hadir'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : opt === 'Tidak Hadir'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-400 bg-gray-50 text-gray-700'
                        : 'border-[#E8E0D4] bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              {editingId ? 'Update Tamu' : 'Simpan Tamu'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-xl hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      {guests.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['Semua', ...GUEST_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                filterCategory === cat
                  ? 'border-[#87A878] bg-[#87A878]/10 text-[#6B8A5E]'
                  : 'border-[#E8E0D4] bg-white text-gray-600 hover:border-[#87A878]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-gray-500 font-medium">
            {guests.length === 0 ? 'Belum ada tamu terdaftar' : 'Tidak ada tamu di kategori ini'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {guests.length === 0 ? 'Mulai tambahkan tamu untuk pernikahanmu' : 'Coba pilih kategori lain'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E0D4] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#F5F0E8]">
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{guest.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${rsvpBadge(guest.rsvpStatus)}`}>
                      {guest.rsvpStatus}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                      {guest.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {guest.pax} pax
                    {guest.estimatedGift > 0 && (
                      <span className="ml-3">Est. Angpao: <span className="font-medium text-gray-700">{formatCurrency(guest.estimatedGift, settings.currency)}</span></span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(guest)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Pencil size={12} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => deleteGuest(guest.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 size={12} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
