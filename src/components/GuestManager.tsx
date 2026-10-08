import { useState } from 'react';
import { useWeddingStore } from '../store';
import { Guest } from '../types';
import { formatCurrency } from '../helpers';
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react';

const GUEST_CATEGORIES: Guest['category'][] = ['Keluarga', 'Teman', 'Rekan Kerja', 'Lainnya'];
const RSVP_OPTIONS: Guest['rsvpStatus'][] = ['Belum Respon', 'Hadir', 'Tidak Hadir'];

export default function GuestManager() {
  const { settings, guests, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Guest['category']>('Keluarga');
  const [pax, setPax] = useState('1');
  const [circle, setCircle] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<Guest['rsvpStatus']>('Belum Respon');

  const resetForm = () => {
    setName('');
    setCategory('Keluarga');
    setPax('1');
    setCircle('');
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
      circle: circle.trim() || undefined,
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
    setCircle(guest.circle || '');
    setRsvpStatus(guest.rsvpStatus);
    setEditingId(guest.id);
    setShowForm(true);
  };

  const rsvpBadge = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-700 border-green-200';
      case 'Tidak Hadir': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const totalPax = guests.reduce((sum, g) => sum + g.pax, 0);
  const confirmedPax = guests.filter(g => g.rsvpStatus === 'Hadir').reduce((sum, g) => sum + g.pax, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Daftar Tamu</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar tamu undangan</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Tamu
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Tamu</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{totalPax}</p>
          <p className="text-xs text-gray-400">{guests.length} orang</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">✅</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Hadir</p>
          <p className="text-xl font-bold text-green-600 mt-0.5">{confirmedPax}</p>
          <p className="text-xs text-gray-400">pax konfirmasi</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">🎁</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Circle</p>
          <p className="text-xl font-bold text-pink-600 mt-0.5">{guests.filter(g => g.circle).length}</p>
          <p className="text-xs text-gray-400">tamu dengan circle</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? '✏️ Edit Tamu' : '✨ Tambah Tamu Baru'}
            </h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tamu *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guest['category'])}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Circle</label>
              <input
                type="text"
                value={circle}
                onChange={(e) => setCircle(e.target.value)}
                placeholder="Contoh: Kantor A, SMA 5, dll"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Kelompok/komunitas tamu (opsional)</p>
            </div>

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
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg text-sm font-medium">
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {guests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Belum ada tamu</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan tamu untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {guests.map((guest) => (
              <div key={guest.id} className="p-4 flex items-start justify-between gap-3">
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
                    {guest.circle && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                        {guest.circle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(guest)} className="p-2 hover:bg-blue-50 rounded-lg">
                    <Pencil size={16} className="text-blue-600" />
                  </button>
                  <button onClick={() => deleteGuest(guest.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} className="text-red-600" />
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
