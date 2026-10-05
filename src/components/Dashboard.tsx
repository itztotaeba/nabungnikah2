'use client';

import { useMemo } from 'react';
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
import { Calendar, TrendingUp, Wallet, Target, Users, Clock, FileText, User, CheckCircle2 } from 'lucide-react';
import BudgetPieChart from './BudgetPieChart';
import SavingsLineChart from './SavingsLineChart';
import DeadlineCalendar from './DeadlineCalendar';

export default function Dashboard() {
  const { settings, budgetItems, savings, guests, tasks } = useWeddingStore();
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

  // Task assignment statistics
  const taskStats = useMemo(() => {
    const stats = {
      Pria: { total: 0, completed: 0 },
      Wanita: { total: 0, completed: 0 },
      Bersama: { total: 0, completed: 0 },
    };

    tasks.forEach(task => {
      stats[task.assignee].total++;
      if (task.isCompleted) {
        stats[task.assignee].completed++;
      }
    });

    return stats;
  }, [tasks]);

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4A843] via-[#E0BC6A] to-[#2F6A43] p-6 sm:p-8 text-white shadow-lg">
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
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2F6A43] to-[#1E4A2E] text-white rounded-xl hover:shadow-lg hover:shadow-[#2F6A43]/20 transition-all text-sm font-medium"
        >
          <FileText size={16} />
          Cetak Laporan Lengkap (PDF)
        </button>
      </div>

      {/* Welcome Message (no date set) */}
      {!settings.weddingDate && (
        <div className="bg-white rounded-2xl p-8 border border-[#D6E5DC] text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D4A843]/20 to-[#2F6A43]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Anggaran</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
            <div className="w-10 h-10 bg-[#2F6A43]/10 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-[#2F6A43]" />
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
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Kekurangan Dana</p>
              <p className={`text-xl font-bold mt-1 ${fundingGap > 0 ? 'text-[#D4A843]' : 'text-emerald-600'}`}>
                {formatCurrency(fundingGap, settings.currency)}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#D4A843]/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">{fundingGap > 0 ? '⚠️' : '✅'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {fundingGap > 0 ? 'Masih perlu ditabung' : 'Anggaran terpenuhi!'}
          </p>
        </div>

        {/* Target Bulanan */}
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Target/Bulan</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {monthlyTarget > 0 && !isNaN(monthlyTarget) ? (
                  formatCurrency(monthlyTarget, settings.currency)
                ) : (
                  <span className="text-sm font-normal text-gray-400 italic">Belum dihitung</span>
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#D4A843]/10 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-[#D4A843]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {remainingMonths > 0 && !isNaN(remainingMonths) ? (
              `${remainingMonths} bulan tersisa`
            ) : (
              <span className="italic">Atur tanggal di Pengaturan</span>
            )}
          </p>
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
      <div className="bg-white rounded-xl p-6 border border-[#D6E5DC]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-gray-800">Progress Tabungan</h3>
          <span className="text-2xl font-bold text-[#2F6A43]">{progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-[#F3EFE6] rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F6A43] to-[#4A9B65] transition-all duration-700 ease-out"
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
            <div className="w-3 h-3 rounded-full bg-[#2F6A43]" />
            <span className="text-gray-600">Terkumpul: {formatCurrency(totalSavings, settings.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F3EFE6] border border-gray-200" />
            <span className="text-gray-600">Sisa: {formatCurrency(fundingGap, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {budgetItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#D6E5DC]">
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
                  <div className="w-full bg-[#F3EFE6] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-[#E8CC8A] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Assignment Summary */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#E8E0D4]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-[#87A878]" />
            <h3 className="font-heading text-lg font-semibold text-gray-800">Pembagian Tugas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Pria', 'Wanita', 'Bersama'] as const).map((assigneeType) => {
              const stats = taskStats[assigneeType];
              const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              
              return (
                <div key={assigneeType} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      assigneeType === 'Pria' ? 'bg-blue-100' :
                      assigneeType === 'Wanita' ? 'bg-pink-100' : 'bg-purple-100'
                    }`}>
                      {assigneeType === 'Bersama' ? (
                        <Users size={16} className="text-purple-600" />
                      ) : (
                        <User size={16} className={
                          assigneeType === 'Pria' ? 'text-blue-600' : 'text-pink-600'
                        } />
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${
                      assigneeType === 'Pria' ? 'text-blue-700' :
                      assigneeType === 'Wanita' ? 'text-pink-700' : 'text-purple-700'
                    }`}>
                      {assigneeType}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold text-gray-800">
                        {stats.completed}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {stats.total} tugas
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          assigneeType === 'Pria' ? 'bg-blue-500' :
                          assigneeType === 'Wanita' ? 'bg-pink-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{percentage.toFixed(0)}% selesai</p>
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
