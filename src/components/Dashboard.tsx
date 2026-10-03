import { useWeddingStore } from '../store';
import {
  calculateTotalBudget,
  calculateTotalSavings,
  calculateFundingGap,
  calculateMonthlyTarget,
  calculateProgressPercentage,
  calculateRemainingMonths,
  formatCurrency,
  formatRemainingTime,
  calculateTotalActual,
} from '../helpers';

export default function Dashboard() {
  const { settings, budgetItems, savings, guests } = useWeddingStore();

  const totalBudget = calculateTotalBudget(budgetItems);
  const totalActual = calculateTotalActual(budgetItems);
  const totalSavings = calculateTotalSavings(savings);
  const fundingGap = calculateFundingGap(totalBudget, totalSavings);
  const remainingMonths = calculateRemainingMonths(settings.weddingDate);
  const monthlyTarget = calculateMonthlyTarget(fundingGap, remainingMonths);
  const progress = calculateProgressPercentage(totalSavings, totalBudget);
  const totalGuests = guests.reduce((sum, g) => sum + g.pax, 1); // +1 for couple

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">WeddingPlan Dashboard</h1>
        <p className="text-gray-500 mt-1">Pantau perencanaan pernikahanmu di satu tempat</p>
      </div>

      {/* Countdown */}
      {settings.weddingDate && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center shadow-lg">
          <p className="text-sm opacity-90">Menuju Hari Bahagiamu</p>
          <p className="text-2xl font-bold mt-1">{formatRemainingTime(settings.weddingDate)}</p>
          <p className="text-sm opacity-75 mt-1">
            {new Date(settings.weddingDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Anggaran */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Anggaran</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Total Realisasi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🧾</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Realisasi</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalActual, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Total Tabungan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tabungan</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalSavings, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Kekurangan Dana */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Kekurangan Dana</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(fundingGap, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Target Bulanan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Target Tabungan/Bulan</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(monthlyTarget, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Total Tamu */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tamu (Pax)</p>
              <p className="text-lg font-bold text-gray-800">{totalGuests} orang</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Progress Tabungan</h3>
          <span className="text-sm font-bold text-pink-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {formatCurrency(totalSavings, settings.currency)} dari {formatCurrency(totalBudget, settings.currency)}
        </p>
      </div>

      {/* Summary per Category */}
      {budgetItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Ringkasan per Kategori</h3>
          <div className="space-y-3">
            {Object.entries(
              budgetItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = { estimated: 0, actual: 0 };
                acc[item.category].estimated += item.estimatedCost;
                acc[item.category].actual += item.actualCost;
                return acc;
              }, {} as Record<string, { estimated: number; actual: number }>)
            ).map(([category, data]) => (
              <div key={category} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{category}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(data.estimated, settings.currency)}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    (realisasi: {formatCurrency(data.actual, settings.currency)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!settings.weddingDate && budgetItems.length === 0 && savings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span className="text-5xl">💒</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Selamat Datang di WeddingPlan!</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Mulai rencanakan pernikahan impianmu. Atur tanggal pernikahan, buat anggaran, lacak tabungan, dan kelola daftar tamu.
          </p>
          <p className="text-sm text-pink-500 mt-4">← Mulai dari tab "Pengaturan" untuk mengatur tanggal pernikahan</p>
        </div>
      )}
    </div>
  );
}
