import { useState } from 'react';
import { useWeddingStore, Guest } from '../store';
import { formatCurrency } from '../helpers';

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
      case 'Hadir': return 'bg-green-100 text-green-700';
      case 'Tidak Hadir': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👥 Daftar Tamu</h2>
          <p className="text-sm text-gray-500">Kelola daftar tamu undangan pernikahanmu</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          + Tambah Tamu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 uppercase tracking-wide">Total Tamu</p>
          <p className="text-xl font-bold text-purple-800">{guests.length} orang / {totalPax} pax</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 uppercase tracking-wide">Konfirmasi Hadir</p>
          <p className="text-xl font-bold text-green-800">{confirmedPax} pax</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 uppercase tracking-wide">Estimasi Angpao</p>
          <p className="text-xl font-bold text-blue-800">{formatCurrency(totalEstimatedGift, settings.currency)}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Tamu' : 'Tambah Tamu Baru'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Tamu</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guest['category'])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              >
                {GUEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jumlah Pax</label>
              <input
                type="number"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estimasi Angpao</label>
              <input
                type="number"
                value={estimatedGift}
                onChange={(e) => setEstimatedGift(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status RSVP</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as Guest['rsvpStatus'])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              >
                {RSVP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              {editingId ? 'Update' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span className="text-4xl">📝</span>
          <p className="text-gray-500 mt-3">
            {guests.length === 0 ? 'Belum ada tamu terdaftar. Mulai tambahkan!' : 'Tidak ada tamu di kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{guest.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rsvpBadge(guest.rsvpStatus)}`}>
                      {guest.rsvpStatus}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                      {guest.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {guest.pax} pax
                    {guest.estimatedGift > 0 && (
                      <span className="ml-3">Est. Angpao: {formatCurrency(guest.estimatedGift, settings.currency)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(guest)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGuest(guest.id)}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Hapus
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
