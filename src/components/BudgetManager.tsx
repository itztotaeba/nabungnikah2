import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalBudget, calculateTotalActual, calculateItemStatus } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { generateBudgetPDF } from '../helpers/pdfGenerator';
import { useToastStore } from '../toastStore';
import { Plus, Pencil, Trash2, Receipt, TrendingUp, Minus, X, FileText, ClipboardList, Sparkles } from 'lucide-react';

const BUDGET_CATEGORIES = [
  'Katering',
  'Venue',
  'MUA',
  'Dekorasi',
  'Dokumentasi',
  'Undangan',
  'Cincin',
  'Hiburan',
  'Transportasi',
  'Lainnya',
];

export default function BudgetManager() {
  const { settings, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWeddingStore();
  const { addToast } = useToastStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [itemName, setItemName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');

  // Calculations from helpers
  const totalBudget = calculateTotalBudget(budgetItems);
  const totalActual = calculateTotalActual(budgetItems);
  const totalDifference = totalBudget - totalActual;

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
    
    // Validation
    if (!itemName.trim()) {
      addToast('Nama item tidak boleh kosong', 'error');
      return;
    }
    
    const est = parseInt(estimatedCost);
    const act = parseInt(actualCost) || 0;
    
    if (isNaN(est) || est < 0) {
      addToast('Estimasi biaya harus angka positif', 'error');
      return;
    }
    
    if (act < 0) {
      addToast('Biaya aktual harus angka positif', 'error');
      return;
    }

    if (editingId) {
      updateBudgetItem(editingId, {
        category,
        itemName: itemName.trim(),
        estimatedCost: est,
        actualCost: act,
      });
      addToast('Item anggaran berhasil diupdate', 'success');
    } else {
      addBudgetItem({
        category,
        itemName: itemName.trim(),
        estimatedCost: est,
        actualCost: act,
      });
      addToast('Item anggaran berhasil ditambahkan', 'success');
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

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`Hapus item "${itemName}"?`)) {
      deleteBudgetItem(id);
      addToast('Item anggaran berhasil dihapus', 'success');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DP': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Handle Export PDF
  const handleExportPDF = () => {
    try {
      if (budgetItems.length === 0) {
        addToast('Data anggaran masih kosong, tidak ada yang bisa di-export', 'warning');
        return;
      }
      generateBudgetPDF(budgetItems, settings);
      addToast('PDF berhasil dibuat!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      addToast('Gagal membuat PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Anggaran Pernikahan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola estimasi dan realisasi biaya pernikahanmu</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2F6A43] text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
            >
              <FileText size={16} />
              Export PDF
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Item
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-md flex items-center justify-center">
              <Receipt size={20} className="text-[#87A878]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Estimasi</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Aktual</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalActual, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <Minus size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Selisih</p>
              <p className={`text-xl font-bold ${totalDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalDifference), settings.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              {editingId ? 'Edit Item Anggaran' : 'Tambah Item Baru'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-[#F5F0E8] rounded-md transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              >
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Item</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Gedung Serbaguna"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Biaya</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
              {estimatedCost && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseInt(estimatedCost) || 0, settings.currency)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Aktual</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
              {actualCost && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseInt(actualCost) || 0, settings.currency)}
                </p>
              )}
            </div>
          </div>

          {/* Preview Status */}
          {estimatedCost && (
            <div className="bg-[#F5F0E8] rounded-md p-4">
              <p className="text-xs text-gray-600 mb-2">Preview Status:</p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge(
                calculateItemStatus(parseInt(estimatedCost) || 0, parseInt(actualCost) || 0)
              )}`}>
                {calculateItemStatus(parseInt(estimatedCost) || 0, parseInt(actualCost) || 0)}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-md hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-[#87A878] text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
            >
              {editingId ? 'Update Item' : 'Simpan Item'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {budgetItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-md flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl"></span>
          </div>
          <p className="text-gray-500 font-medium">Belum ada anggaran</p>
          <p className="text-sm text-gray-400 mt-1">Yuk mulai tambah item pertama!</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-[#E8E0D4] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F0E8]/50 border-b border-[#E8E0D4]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Item</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Estimasi</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktual</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Selisih</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Terakhir Diubah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {budgetItems.map((item) => {
                  const difference = item.estimatedCost - item.actualCost;
                  return (
                    <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-700">{item.category}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.itemName}</td>
                      <td className="px-5 py-4 text-sm text-right text-gray-700">{formatCurrency(item.estimatedCost, settings.currency)}</td>
                      <td className="px-5 py-4 text-sm text-right text-gray-700">{formatCurrency(item.actualCost, settings.currency)}</td>
                      <td className={`px-5 py-4 text-sm text-right font-medium ${difference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(difference), settings.currency)}
                        {difference >= 0 ? ' (sisa)' : ' (lebih)'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.itemName)}
                            className="p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
                        {formatAuditInfo(item.updatedBy, item.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#F5F0E8]/30 border-t-2 border-[#E8E0D4]">
                <tr>
                  <td colSpan={2} className="px-5 py-4 text-sm font-bold text-gray-800">GRAND TOTAL</td>
                  <td className="px-5 py-4 text-sm text-right font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</td>
                  <td className="px-5 py-4 text-sm text-right font-bold text-gray-800">{formatCurrency(totalActual, settings.currency)}</td>
                  <td className={`px-5 py-4 text-sm text-right font-bold ${totalDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(totalDifference), settings.currency)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#F5F0E8]">
            {budgetItems.map((item) => {
              const difference = item.estimatedCost - item.actualCost;
              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F0E8] text-gray-600 font-medium">
                          {item.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.itemName)}
                        className="p-2 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Estimasi</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(item.estimatedCost, settings.currency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aktual</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(item.actualCost, settings.currency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selisih</p>
                      <p className={`font-semibold ${difference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(difference), settings.currency)}
                      </p>
                    </div>
                  </div>
                  {/* Audit Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-right">
                      {formatAuditInfo(item.updatedBy, item.updatedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
