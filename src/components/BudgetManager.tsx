import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalBudget, calculateTotalActual } from '../helpers';

const BUDGET_CATEGORIES = [
  'Gedung & Venue',
  'Katering',
  'Dokumentasi',
  'Dekorasi & Bunga',
  'Busana & Makeup',
  'Entertainment',
  'Undangan',
  'Souvenir',
  'Transportasi',
  'Lainnya',
];

export default function BudgetManager() {
  const { settings, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');

  const totalBudget = calculateTotalBudget(budgetItems);
  const totalActual = calculateTotalActual(budgetItems);

  const resetForm = () => {
    setCategory(BUDGET_CATEGORIES[0]);
    setCustomCategory('');
    setItemName('');
    setEstimatedCost('');
    setActualCost('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !estimatedCost) return;

    const finalCategory = category === 'Lainnya' ? customCategory || 'Lainnya' : category;
    const est = parseInt(estimatedCost) || 0;
    const act = parseInt(actualCost) || 0;

    if (editingId) {
      updateBudgetItem(editingId, {
        category: finalCategory,
        itemName: itemName.trim(),
        estimatedCost: est,
        actualCost: act,
      });
    } else {
      addBudgetItem({
        category: finalCategory,
        itemName: itemName.trim(),
        estimatedCost: est,
        actualCost: act,
      });
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const item = budgetItems.find((b) => b.id === id);
    if (!item) return;

    if (BUDGET_CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Lainnya');
      setCustomCategory(item.category);
    }

    setItemName(item.itemName);
    setEstimatedCost(item.estimatedCost.toString());
    setActualCost(item.actualCost.toString());
    setEditingId(id);
    setShowForm(true);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-700';
      case 'DP': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Group by category
  const groupedItems = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof budgetItems>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">💰 Anggaran Pernikahan</h2>
          <p className="text-sm text-gray-500">Kelola estimasi dan realisasi biaya pernikahanmu</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
        >
          + Tambah Item
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 uppercase tracking-wide">Total Anggaran</p>
          <p className="text-xl font-bold text-blue-800">{formatCurrency(totalBudget, settings.currency)}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-orange-600 uppercase tracking-wide">Total Realisasi</p>
          <p className="text-xl font-bold text-orange-800">{formatCurrency(totalActual, settings.currency)}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Item' : 'Tambah Item Baru'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              >
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {category === 'Lainnya' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Masukkan kategori..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Item</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Gedung Serbaguna"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estimasi Biaya</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Biaya Aktual (Realisasi)</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
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

      {/* Budget Items List */}
      {budgetItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span className="text-4xl">📋</span>
          <p className="text-gray-500 mt-3">Belum ada item anggaran. Mulai tambahkan!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h4 className="font-medium text-gray-700">{cat}</h4>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.itemName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Estimasi: {formatCurrency(item.estimatedCost, settings.currency)}
                        {item.actualCost > 0 && (
                          <span className="ml-3">Realisasi: {formatCurrency(item.actualCost, settings.currency)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBudgetItem(item.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
