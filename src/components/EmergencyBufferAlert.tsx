'use client';

import { useMemo } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalBudget, calculateTotalActual, checkEmergencyBufferStatus } from '../helpers';
import { AlertTriangle, Shield, TrendingUp, CheckCircle } from 'lucide-react';

export default function EmergencyBufferAlert() {
  const { budgetItems, settings } = useWeddingStore();

  // Safe data access
  const safeBudgetItems = Array.isArray(budgetItems) ? budgetItems : [];
  const safeSettings = settings || { weddingDate: '', currency: 'IDR' };

  // Calculate totals
  const totalBudget = calculateTotalBudget(safeBudgetItems);
  const totalActual = calculateTotalActual(safeBudgetItems);

  // Check emergency buffer status
  const bufferStatus = useMemo(() => {
    return checkEmergencyBufferStatus(totalBudget, totalActual, 15);
  }, [totalBudget, totalActual]);

  // Jangan tampilkan jika tidak ada data
  if (safeBudgetItems.length === 0 || totalBudget === 0) {
    return null;
  }

  // Determine status color dan icon
  const getStatusInfo = () => {
    if (bufferStatus.bufferUsagePercentage === 0) {
      return {
        color: 'emerald',
        icon: CheckCircle,
        label: 'Dana Darurat Aman',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        iconColor: 'text-emerald-600',
        progressColor: 'bg-[#2F6A43] from-emerald-500 to-emerald-600'
      };
    } else if (bufferStatus.bufferUsagePercentage < 50) {
      return {
        color: 'amber',
        icon: AlertTriangle,
        label: 'Dana Darurat Terbatas',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-600',
        progressColor: 'bg-[#2F6A43] from-amber-500 to-amber-600'
      };
    } else {
      return {
        color: 'red',
        icon: AlertTriangle,
        label: 'Dana Darurat Kritis',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
        progressColor: 'bg-[#2F6A43] from-red-500 to-red-600'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`rounded-lg p-6 border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${statusInfo.bgColor}`}>
            <Shield size={20} className={statusInfo.iconColor} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              Dana Darurat (Emergency Buffer)
            </h3>
            <p className="text-xs text-gray-500">
              Buffer 15% dari total anggaran untuk biaya tak terduga
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
          <StatusIcon size={14} />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Anggaran + Buffer */}
        <div className="bg-white rounded-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">Total + Buffer</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(bufferStatus.totalWithBuffer, safeSettings.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Anggaran: {formatCurrency(totalBudget, safeSettings.currency)}
          </p>
        </div>

        {/* Buffer Amount */}
        <div className="bg-white rounded-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">Dana Darurat</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(bufferStatus.bufferAmount, safeSettings.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            15% dari total anggaran
          </p>
        </div>

        {/* Remaining Buffer */}
        <div className={`rounded-md p-4 border ${
          bufferStatus.isBufferTouched 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className={
              bufferStatus.isBufferTouched ? 'text-red-600' : 'text-gray-600'
            } />
            <span className="text-xs text-gray-600 font-medium">Sisa Buffer</span>
          </div>
          <p className={`text-2xl font-bold ${
            bufferStatus.isBufferTouched ? 'text-red-700' : 'text-gray-800'
          }`}>
            {formatCurrency(bufferStatus.remainingBuffer, safeSettings.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bufferStatus.isBufferTouched 
              ? `${bufferStatus.bufferUsagePercentage.toFixed(1)}% terpakai`
              : 'Belum terpakai'
            }
          </p>
        </div>
      </div>

      {/* Buffer Usage Progress */}
      {bufferStatus.isBufferTouched && (
        <div className="bg-white rounded-md p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Penggunaan Dana Darurat
            </span>
            <span className={`text-sm font-bold ${statusInfo.textColor}`}>
              {bufferStatus.bufferUsagePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusInfo.progressColor}`}
              style={{ width: `${bufferStatus.bufferUsagePercentage}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {bufferStatus.isBufferTouched && (
        <div className={`mt-4 p-4 rounded-md border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className={statusInfo.iconColor} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${statusInfo.textColor} mb-1`}>
                {bufferStatus.bufferUsagePercentage >= 75 
                  ? '⚠️ Peringatan: Dana Darurat Hampir Habis!'
                  : '⚠️ Dana Darurat Sudah Tersentuh'
                }
              </p>
              <p className="text-xs text-gray-600">
                {bufferStatus.bufferUsagePercentage >= 75
                  ? `Anda telah menggunakan ${bufferStatus.bufferUsagePercentage.toFixed(1)}% dari dana darurat. Segera evaluasi pengeluaran dan pertimbangkan untuk menambah anggaran.`
                  : `Realisasi pengeluaran telah melebihi anggaran sebesar ${formatCurrency(totalActual - totalBudget, safeSettings.currency)}. Dana darurat digunakan untuk menutupi kekurangan ini.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!bufferStatus.isBufferTouched && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                💡 Tips: Dana Darurat
              </p>
              <p className="text-xs text-blue-800">
                Dana darurat 15% dialokasikan untuk biaya tak terduga seperti perubahan vendor, tambahan tamu, atau biaya mendadak lainnya. Pertahankan dana ini sampai hari H.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
