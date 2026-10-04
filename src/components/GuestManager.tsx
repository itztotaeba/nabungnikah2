import { useState } from 'react';
import { useWeddingStore, Guest } from '../store';
import { formatCurrency } from '../helpers';
import { useToastStore } from '../toastStore';
import Modal from './Modal';
import { Plus, Pencil, Trash2, Users, Gift, CheckCircle2 } from 'lucide-react';

const GUEST_CATEGORIES: Guest['category'][] = ['Keluarga', 'Teman', 'Rekan Kerja', 'Lainnya'];
const RSVP_OPTIONS: Guest['rsvpStatus'][] = ['Belum Respon', 'Hadir', 'Tidak Hadir'];

export default function GuestManager() {
  const { settings, guests, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const { addToast } = useToastStore();
  
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      addToast('Nama tamu tidak boleh kosong', 'error');
      return;
    }

    const guestData = {
      name: name.trim(),
      category,
      pax: parseInt(pax) || 1,
      estimatedGift: parseInt(estimatedGift) || 0,
      rsvpStatus,
    };

    if (editingId) {
      updateGuest(editingId, guestData);
      addToast('Data tamu berhasil diupdate', 'success');
    } else {
      addGuest(guestData);
      addToast('Tamu berhasil ditambahkan', 'success');
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
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus tamu "${name}"?`)) {
      deleteGuest(id);
      addToast('Tamu berhasil dihapus', 'success');
    }
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
          onClick={() => { resetForm(); setShowModal(true); }}
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
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Konfirmasi Hadir</p>
              <p className="text-lg font-bold text-gray-800">{confirmedPax} <span className="text-sm font-normal text-gray-500">pax</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B76E79]/10 rounded-xl flex items-center justify-center">
              <Gift size={20} className="text-[#B76E79]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Estimasi Angpao</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalEstimatedGift, settings.currency)}</p>
            </div>
          </div>
        </div>
      </div>

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
              {cat !== 'Semua' && (
                <span className="ml-1.5 text-gray-400">
                  ({guests.filter(g => g.category === cat).length})
                </span>
              )}
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
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F0E8]/50 border-b border-[#E8E0D4]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pax</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">RSVP</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Est. Angpao</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{guest.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{guest.category}</td>
                    <td className="px-5 py-4 text-sm text-center text-gray-700">{guest.pax}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${rsvpBadge(guest.rsvpStatus)}`}>
                        {guest.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-right text-gray-700">
                      {guest.estimatedGift > 0 ? formatCurrency(guest.estimatedGift, settings.currency) : '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id, guest.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#F5F0E8]">
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="p-4">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Tamu' : 'Tambah Tamu Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tamu</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pax</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Angpao</label>
            <input
              type="number"
              value={estimatedGift}
              onChange={(e) => setEstimatedGift(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
            />
            {estimatedGift && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(parseInt(estimatedGift) || 0, settings.currency)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status RSVP</label>
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
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
      </Modal>
    </div>
  );
}
