import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalSavings } from '../helpers';
import { Plus, Trash2, PiggyBank } from 'lucide-react';

export default function SavingsTracker() {
  const { settings, savings, addSavings, deleteSavings } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');

  const totalSavings = calculateTotalSavings(savings);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setSource('');
    setNote('');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) return;

    addSavings({
      date,
      amount: parseInt(amount),
      source: source.trim() || 'Umum',
      note: note.trim(),
    });

    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Tracker Tabungan</h2>
          <p className="text-sm text-gray-500 mt-1">Catat semua tabungan untuk pernikahanmu</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg hover:shadow-[#87A878]/20 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Tambah Tabungan
        </button>
      </div>

      {/* Total Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#87A878] via-[#6B8A5E] to-[#4A7040] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank size={20} className="opacity-80" />
            <span className="text-sm opacity-90 font-medium">Total Tabungan Terkumpul</span>
          </div>
          <p className="text-3xl sm:text-4xl font-heading font-bold">
            {formatCurrency(totalSavings, settings.currency)}
          </p>
          <p className="text-sm opacity-75 mt-2">{savings.length} kali menabung</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <h3 className="font-heading text-lg font-semibold text-gray-800">💰 Catat Tabungan Baru</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Sumber Dana</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Contoh: Gaji, Hadiah, dll"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Catatan (opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan tambahan..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              Simpan Tabungan
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

      {/* Savings List */}
      {savings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💵</span>
          </div>
          <p className="text-gray-500 font-medium">Belum ada tabungan tercatat</p>
          <p className="text-sm text-gray-400 mt-1">Mulai catat tabunganmu untuk pernikahan impian</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E0D4] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#F5F0E8]">
            {[...savings].reverse().map((entry) => (
              <div key={entry.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' • '}{entry.source}
                      {entry.note && ` • ${entry.note}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteSavings(entry.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium shrink-0"
                >
                  <Trash2 size={12} />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
