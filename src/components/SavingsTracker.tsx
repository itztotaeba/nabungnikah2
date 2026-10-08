import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { Plus, Trash2, X, PiggyBank, Target, TrendingUp } from 'lucide-react';

export default function SavingsTracker() {
  const { settings, savings, addSavings, deleteSavings } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('Gaji');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setSource('Gaji');
    setAmount('');
    setNote('');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) return;
    addSavings({ date, source, amount: parseInt(amount), note: note.trim() });
    resetForm();
  };

  const totalSavings = savings.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Tracker Tabungan</h2>
          <p className="text-sm text-gray-500 mt-1">Catat semua tabungan untuk pernikahanmu</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Tabungan
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <PiggyBank size={24} />
          </div>
          <div>
            <p className="text-sm opacity-90">Total Tabungan Terkumpul</p>
            <p className="text-3xl font-bold">{formatCurrency(totalSavings, settings.currency)}</p>
            <p className="text-sm opacity-75 mt-1">{savings.length} kali menabung</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">💰 Tambah Tabungan Baru</h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Dana</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
              >
                <option value="Gaji">Gaji</option>
                <option value="Bonus">Bonus</option>
                <option value="Hadiah">Hadiah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nominal *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tambahkan catatan..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg text-sm font-medium">
              Simpan
            </button>
          </div>
        </form>
      )}

      {savings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <PiggyBank size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Belum ada tabungan</p>
          <p className="text-sm text-gray-400 mt-1">Mulai catat setoran pertamamu!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {[...savings].reverse().map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('id-ID')} • {entry.source}
                      {entry.note && ` • ${entry.note}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteSavings(entry.id)} className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
