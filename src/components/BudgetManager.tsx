import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalBudget, calculateTotalActual } from '../helpers';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';

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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DP': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Anggaran Pernikahan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola estimasi dan realisasi biaya pernikahanmu</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/20 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Tambah Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center">
              <Receipt size={20} className="text-[#87A878]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Anggaran</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">🧾</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Realisasi</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalActual, settings.currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <h3 className="font-heading text-lg font-semibold text-gray-800">
            {editingId ? '✏️ Edit Item Anggaran' : '✨ Tambah Item Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              >
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {category === 'Lainnya' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Masukkan kategori..."
                  className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nama Item</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Gedung Serbaguna"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Estimasi Biaya</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Biaya Aktual (Realisasi)</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              {editingId ? 'Update Item' : 'Simpan Item'}
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

      {/* Budget Items List */}
      {budgetItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-gray-500 font-medium">Belum ada item anggaran</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan item untuk merencanakan biaya pernikahanmu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-2xl border border-[#E8E0D4] overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-[#F5F0E8]/50 border-b border-[#E8E0D4]">
                <h4 className="font-medium text-gray-700 text-sm">{cat}</h4>
              </div>
              <div className="divide-y divide-[#F5F0E8]">
                {items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800">{item.itemName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Estimasi: <span className="font-medium text-gray-700">{formatCurrency(item.estimatedCost, settings.currency)}</span>
                        {item.actualCost > 0 && (
                          <span className="ml-3">Realisasi: <span className="font-medium text-gray-700">{formatCurrency(item.actualCost, settings.currency)}</span></span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBudgetItem(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 size={12} />
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
