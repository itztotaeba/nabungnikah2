'use client';

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
import { generateFullReport } from '../helpers/pdfGenerator';
import { useToastStore } from '../toastStore';
import { Calendar, TrendingUp, Wallet, Target, Users, Clock, FileText } from 'lucide-react';
import BudgetPieChart from './BudgetPieChart';
import SavingsLineChart from './SavingsLineChart';
import DeadlineCalendar from './DeadlineCalendar';

export default function Dashboard() {
  const { settings, budgetItems, savings, guests } = useWeddingStore();
  const { addToast } = useToastStore();

  // Semua perhitungan menggunakan helper functions
  const totalBudget = calculateTotalBudget(budgetItems);
  const totalActual = calculateTotalActual(budgetItems);
  const totalSavings = calculateTotalSavings(savings);
  const fundingGap = calculateFundingGap(totalBudget, totalSavings);
  const remainingMonths = calculateRemainingMonths(settings.weddingDate);
  const monthlyTarget = calculateMonthlyTarget(fundingGap, remainingMonths);
  const progress = calculateProgressPercentage(totalSavings, totalBudget);
  const totalGuests = guests.reduce((sum, g) => sum + g.pax, 0);

  const formattedDate = settings.weddingDate
    ? new Date(settings.weddingDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Handle Export PDF
  const handleExportPDF = () => {
    try {
      if (budgetItems.length === 0 && guests.length === 0) {
        addToast('Data masih kosong, tidak ada yang bisa di-export', 'warning');
        return;
      }
      generateFullReport(budgetItems, guests, settings);
      addToast('PDF berhasil dibuat!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      addToast('Gagal membuat PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Countdown */}
      {settings.weddingDate && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#B76E79] via-[#C4838C] to-[#87A878] p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgxNnYtMmgyMHptMC00djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="opacity-80" />
              <span className="text-sm opacity-90 font-medium">Menuju Hari Bahagiamu</span>
            </div>
            <p className="text-3xl sm:text-4xl font-heading font-bold mb-1">
              {formatRemainingTime(settings.weddingDate)}
            </p>
            <p className="text-sm opacity-80">
              {formattedDate}
            </p>
          </div>
        </div>
      )}

      {/* Export PDF Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg hover:shadow-[#87A878]/20 transition-all text-sm font-medium"
        >
          <FileText size={16} />
          Cetak Laporan Lengkap (PDF)
        </button>
      </div>

      {/* Welcome Message (no date set) */}
      {!settings.weddingDate && (
        <div className="bg-white rounded-2xl p-8 border border-[#E8E0D4] text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#B76E79]/20 to-[#87A878]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💒</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang di WeddingPlan
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Mulai rencanakan pernikahan impianmu. Atur tanggal pernikahan di menu Pengaturan untuk melihat countdown.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Anggaran */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Anggaran</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-[#87A878]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{budgetItems.length} item anggaran</p>
        </div>

        {/* Total Realisasi */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Realisasi</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalActual, settings.currency)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}% dari anggaran
          </p>
        </div>

        {/* Total Tabungan */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Tabungan</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalSavings, settings.currency)}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{savings.length} kali menabung</p>
        </div>

        {/* Kekurangan Dana */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Kekurangan Dana</p>
              <p className={`text-xl font-bold mt-1 ${fundingGap > 0 ? 'text-[#B76E79]' : 'text-emerald-600'}`}>
                {formatCurrency(fundingGap, settings.currency)}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#B76E79]/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">{fundingGap > 0 ? '⚠️' : '✅'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {fundingGap > 0 ? 'Masih perlu ditabung' : 'Anggaran terpenuhi!'}
          </p>
        </div>

        {/* Target Bulanan */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Target/Bulan</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(monthlyTarget, settings.currency)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{remainingMonths} bulan tersisa</p>
        </div>

        {/* Total Tamu */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Tamu</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{totalGuests} <span className="text-sm font-normal text-gray-500">pax</span></p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{guests.length} orang diundang</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E0D4]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-gray-800">Progress Tabungan</h3>
          <span className="text-2xl font-bold text-[#87A878]">{progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-[#F5F0E8] rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Progress markers */}
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{formatCurrency(0, settings.currency)}</span>
            <span className="text-xs text-gray-400">{formatCurrency(totalBudget / 2, settings.currency)}</span>
            <span className="text-xs text-gray-400">{formatCurrency(totalBudget, settings.currency)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#87A878]" />
            <span className="text-gray-600">Terkumpul: {formatCurrency(totalSavings, settings.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F5F0E8] border border-gray-200" />
            <span className="text-gray-600">Sisa: {formatCurrency(fundingGap, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {budgetItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#E8E0D4]">
          <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">Ringkasan per Kategori</h3>
          <div className="space-y-3">
            {Object.entries(
              budgetItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = { estimated: 0, actual: 0 };
                acc[item.category].estimated += item.estimatedCost;
                acc[item.category].actual += item.actualCost;
                return acc;
              }, {} as Record<string, { estimated: number; actual: number }>)
            ).map(([category, data]) => {
              const percentage = totalBudget > 0 ? (data.estimated / totalBudget) * 100 : 0;
              return (
                <div key={category} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(data.estimated, settings.currency)}
                      </span>
                      {data.actual > 0 && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({formatCurrency(data.actual, settings.currency)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-[#F5F0E8] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B76E79] to-[#D4959E] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visualisasi Data Section */}
      <div className="space-y-6">
        <h2 className="font-heading text-xl font-bold text-gray-800">Visualisasi Data</h2>
        
        {/* Desktop: 2 kolom, Mobile: 1 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri: Pie Chart & Area Chart */}
          <div className="space-y-6">
            <BudgetPieChart />
            <SavingsLineChart />
          </div>

          {/* Kolom Kanan: Deadline Calendar */}
          <div className="lg:row-span-2">
            <DeadlineCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
