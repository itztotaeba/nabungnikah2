import { useState } from 'react';
import { useWeddingStore } from '../store';
import {
  formatCurrency,
  calculateTotalSavings,
  calculateTotalBudget,
  calculateFundingGap,
  calculateRemainingMonths,
  calculateMonthlyTarget,
  calculateProgressPercentage,
} from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { useToastStore } from '../toastStore';
import { Plus, Trash2, PiggyBank, Target, TrendingUp, Calendar, X, Banknote, Wallet } from 'lucide-react';

const SAVINGS_SOURCES = ['Gaji', 'Bonus', 'Hadiah', 'Tabungan Lama', 'Lainnya'];

export default function SavingsTracker() {
  const { settings, savings, budgetItems, addSavings, deleteSavings } = useWeddingStore();
  const { addToast } = useToastStore();
  
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState(SAVINGS_SOURCES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Calculations from helpers
  const totalSavings = calculateTotalSavings(savings);
  const totalBudget = calculateTotalBudget(budgetItems);
  const fundingGap = calculateFundingGap(totalBudget, totalSavings);
  const remainingMonths = calculateRemainingMonths(settings.weddingDate);
  const monthlyTarget = calculateMonthlyTarget(fundingGap, remainingMonths);
  const progress = calculateProgressPercentage(totalSavings, totalBudget);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setSource(SAVINGS_SOURCES[0]);
    setAmount('');
    setNote('');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const amt = parseInt(amount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Nominal harus angka positif', 'error');
      return;
    }

    addSavings({
      date,
      source,
      amount: amt,
      note: note.trim(),
    });
    
    addToast('Tabungan berhasil ditambahkan', 'success');
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan tabungan ini?')) {
      deleteSavings(id);
      addToast('Catatan tabungan berhasil dihapus', 'success');
    }
  };

  // Sort by date descending
  const sortedSavings = [...savings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Tracker Tabungan</h2>
          <p className="text-sm text-gray-500 mt-1">Catat semua tabungan untuk pernikahanmu</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#87A878] text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Tabungan
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Savings */}
        <div className="bg-[#87A878] rounded-md p-5 text-white border border-[#E5DED0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
              <PiggyBank size={20} />
            </div>
            <div>
              <p className="text-xs opacity-90 uppercase tracking-wider">Total Tabungan</p>
              <p className="text-xl font-bold">{formatCurrency(totalSavings, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
              <Target size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Target/Bulan</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(monthlyTarget, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B76E79]/10 rounded-md flex items-center justify-center">
              <TrendingUp size={20} className="text-[#B76E79]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Progress</p>
              <p className="text-xl font-bold text-[#B76E79]">{progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-md p-6 border border-[#E8E0D4]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg font-semibold text-gray-800">Progress Menuju Target</h3>
          <span className="text-sm text-gray-500">
            {formatCurrency(totalSavings, settings.currency)} / {formatCurrency(totalBudget, settings.currency)}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-[#F5F0E8] rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#87A878] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {totalBudget > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        )}
      </div>

      {/* Inline Form - DIPINDAH KE ATAS */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              Tambah Tabungan Baru
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Dana</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              >
                {SAVINGS_SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nominal</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
              {amount && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseInt(amount) || 0, settings.currency)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tambahkan catatan..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-md hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-[#87A878] text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {sortedSavings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-md flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl"></span>
          </div>
          <p className="text-gray-500 font-medium">Belum ada tabungan</p>
          <p className="text-sm text-gray-400 mt-1">Mulai catat setoran pertamamu!</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-[#E8E0D4] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F0E8]/50 border-b border-[#E8E0D4]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sumber Dana</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Nominal</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Terakhir Diubah</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {sortedSavings.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(entry.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{entry.source}</td>
                    <td className="px-5 py-4 text-sm text-right font-semibold text-gray-800">
                      {formatCurrency(entry.amount, settings.currency)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{entry.note || '-'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
                      {formatAuditInfo(entry.updatedBy, entry.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:bg-red-50 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#F5F0E8]">
            {sortedSavings.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F0E8] text-gray-600 font-medium">
                        {entry.source}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
                    {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
                {/* Audit Info */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-right">
                    {formatAuditInfo(entry.updatedBy, entry.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
