import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalBudget, calculateTotalSavings, calculateFundingGap, calculateMonthlyTarget, calculateProgressPercentage, calculateRemainingMonths } from '../helpers';
import { Calendar, TrendingUp, Wallet, Target, Users, Clock } from 'lucide-react';

export default function Dashboard() {
  const { settings, budgetItems, savings, guests } = useWeddingStore();

  const totalBudget = calculateTotalBudget(budgetItems);
  const totalSavings = calculateTotalSavings(savings);
  const fundingGap = calculateFundingGap(totalBudget, totalSavings);
  const remainingMonths = calculateRemainingMonths(settings.weddingDate);
  const monthlyTarget = calculateMonthlyTarget(fundingGap, remainingMonths);
  const progress = calculateProgressPercentage(totalSavings, totalBudget);
  const totalGuests = guests.reduce((sum, g) => sum + g.pax, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">WeddingPlan Dashboard</h1>
        <p className="text-gray-500 mt-1">Pantau perencanaan pernikahanmu di satu tempat</p>
      </div>

      {settings.weddingDate && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center shadow-lg">
          <p className="text-sm opacity-90">Menuju Hari Bahagiamu</p>
          <p className="text-2xl font-bold mt-1">{calculateRemainingMonths(settings.weddingDate)} bulan lagi</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Anggaran</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tabungan</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalSavings, settings.currency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Kekurangan Dana</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(fundingGap, settings.currency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Target/Bulan</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(monthlyTarget, settings.currency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tamu</p>
              <p className="text-lg font-bold text-gray-800">{totalGuests} orang</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
              <p className="text-lg font-bold text-gray-800">{progress}%</p>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
