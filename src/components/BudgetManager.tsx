import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const BUDGET_CATEGORIES = ['Katering', 'Venue', 'MUA', 'Fotografi', 'Dekorasi', 'Entertainment', 'Undangan', 'Souvenir', 'Transportasi', 'Lainnya'];

export default function BudgetManager() {
  const { settings, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [itemName, setItemName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');

  const resetForm = () => {
    setCategory(BUDGET_CATEGORIES[0]);
    setItemName('');
    setEstimatedCost('');
    setActualCost('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !estimatedCost) return;

    const est = parseInt(estimatedCost);
    const act = parseInt(actualCost) || 0;
    const status = act >= est ? 'Lunas' : act > 0 ? 'DP' : 'Belum';

    if (editingId) {
      updateBudgetItem(editingId, { category, itemName: itemName.trim(), estimatedCost: est, actualCost: act, status });
    } else {
      addBudgetItem({ category, itemName: itemName.trim(), estimatedCost: est, actualCost: act, status });
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const item = budgetItems.find((b) => b.id === id);
    if (!item) return;
    setCategory(item.category);
    setItemName(item.itemName);
    setEstimatedCost(item.estimatedCost.toString());
    setActualCost(item.actualCost.toString());
    setEditingId(id);
    setShowForm(true);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-700 border-green-200';
      case 'DP': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Anggaran Pernikahan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola estimasi dan realisasi biaya</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Item
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Anggaran</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalBudget, settings.currency)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Realisasi</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalActual, settings.currency)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Selisih</p>
          <p className={`text-xl font-bold mt-1 ${totalBudget - totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(totalBudget - totalActual), settings.currency)}
          </p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? '✏️ Edit Item' : '✨ Tambah Item Baru'}
            </h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              >
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Item *</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Gedung Serbaguna"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Biaya *</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Aktual</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg text-sm font-medium">
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {budgetItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">Belum ada item anggaran</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan item untuk merencanakan biaya</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Item</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Estimasi</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aktual</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {budgetItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-700">{item.category}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.itemName}</td>
                  <td className="px-5 py-4 text-sm text-right text-gray-700">{formatCurrency(item.estimatedCost, settings.currency)}</td>
                  <td className="px-5 py-4 text-sm text-right text-gray-700">{formatCurrency(item.actualCost, settings.currency)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(item.id)} className="p-2 hover:bg-blue-50 rounded-lg">
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <button onClick={() => deleteBudgetItem(item.id)} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
