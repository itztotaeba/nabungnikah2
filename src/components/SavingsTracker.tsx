import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalSavings } from '../helpers';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏦 Tracker Tabungan</h2>
          <p className="text-sm text-gray-500">Catat semua tabungan untuk pernikahanmu</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          + Tambah Tabungan
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
        <p className="text-sm opacity-90">Total Tabungan Terkumpul</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalSavings, settings.currency)}</p>
        <p className="text-sm opacity-75 mt-1">{savings.length} kali menabung</p>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-700">Catat Tabungan Baru</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sumber Dana</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Contoh: Gaji, Hadiah, dll"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catatan (opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan tambahan..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              Simpan
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

      {/* Savings List */}
      {savings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span className="text-4xl">💵</span>
          <p className="text-gray-500 mt-3">Belum ada tabungan tercatat. Mulai menabung!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[...savings].reverse().map((entry) => (
              <div key={entry.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' • '}{entry.source}
                        {entry.note && ` • ${entry.note}`}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteSavings(entry.id)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
