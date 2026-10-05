/**
 * helpers.ts
 * 
 * File ini berisi SEMUA logika perhitungan/formula terkunci.
 * Tidak boleh ada kalkulasi bisnis di dalam komponen UI.
 * User hanya mengontrol input data, sistem mengontrol perhitungan.
 */

import { BudgetItem, SavingsEntry, WeddingSettings } from './types';

// ============================================
// 1. SISA WAKTU (BULAN)
// Formula: Math.ceil((weddingDate - Today) / (1000 * 60 * 60 * 24 * 30))
// ============================================
export function calculateRemainingMonths(weddingDate: string): number {
  // Handle empty or invalid date
  if (!weddingDate || weddingDate.trim() === '') {
    return 0;
  }

  const wedding = new Date(weddingDate).getTime();
  
  // Check if date is valid
  if (isNaN(wedding)) {
    return 0;
  }

  const today = new Date().getTime();
  const diffMs = wedding - today;

  if (diffMs <= 0) return 0;

  const monthsRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
  
  // Ensure we don't return NaN
  if (isNaN(monthsRemaining)) {
    return 0;
  }
  
  return Math.max(0, monthsRemaining);
}

// ============================================
// 2. TOTAL ANGGARAN
// Formula: SUM(BudgetItem.estimatedCost)
// ============================================
export function calculateTotalBudget(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.estimatedCost, 0);
}

// ============================================
// 3. TOTAL REALISASI
// Formula: SUM(BudgetItem.actualCost)
// ============================================
export function calculateTotalActual(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.actualCost, 0);
}

// ============================================
// 4. TOTAL TABUNGAN
// Formula: SUM(SavingsEntry.amount)
// ============================================
export function calculateTotalSavings(savings: SavingsEntry[]): number {
  return savings.reduce((total, entry) => total + entry.amount, 0);
}

// ============================================
// 5. KEKURANGAN DANA
// Formula: Total Anggaran - Total Tabungan (Jika minus, tampilkan 0)
// ============================================
export function calculateFundingGap(totalBudget: number, totalSavings: number): number {
  const gap = totalBudget - totalSavings;
  return Math.max(0, gap);
}

// ============================================
// 6. TARGET TABUNGAN BULANAN
// Formula: Kekurangan Dana / Sisa Waktu (Bulan)
// ============================================
export function calculateMonthlyTarget(fundingGap: number, remainingMonths: number): number {
  // Handle invalid inputs
  if (isNaN(fundingGap) || isNaN(remainingMonths)) {
    return 0;
  }

  // Handle zero or negative remaining months
  if (remainingMonths <= 0) {
    return fundingGap > 0 ? fundingGap : 0; // Harus lunas sekarang atau tidak ada kekurangan
  }

  const target = Math.ceil(fundingGap / remainingMonths);
  
  // Ensure we don't return NaN or Infinity
  if (isNaN(target) || !isFinite(target)) {
    return 0;
  }
  
  return target;
}

// ============================================
// 7. PROGRESS PERSENTASE
// Formula: (Total Tabungan / Total Anggaran) * 100 (Maksimal 100%)
// ============================================
export function calculateProgressPercentage(totalSavings: number, totalBudget: number): number {
  // Handle invalid inputs
  if (isNaN(totalSavings) || isNaN(totalBudget)) {
    return 0;
  }

  // Handle division by zero
  if (totalBudget === 0) return 0;
  
  const percentage = (totalSavings / totalBudget) * 100;
  
  // Ensure we don't return NaN or Infinity
  if (isNaN(percentage) || !isFinite(percentage)) {
    return 0;
  }
  
  return Math.min(100, Math.round(percentage * 100) / 100); // Round to 2 decimal places, max 100
}

// ============================================
// 8. AUTO-STATUS ITEM
// Jika actualCost >= estimatedCost => "Lunas"
// Jika actualCost > 0 tapi < estimatedCost => "DP"
// Sisanya => "Belum"
// ============================================
export function calculateItemStatus(estimatedCost: number, actualCost: number): 'Belum' | 'DP' | 'Lunas' {
  if (actualCost >= estimatedCost && estimatedCost > 0) return 'Lunas';
  if (actualCost > 0 && actualCost < estimatedCost) return 'DP';
  return 'Belum';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format angka ke format mata uang
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  // Handle invalid inputs
  if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
    amount = 0;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Hitung sisa waktu dalam format yang lebih readable
 */
export function formatRemainingTime(weddingDate: string): string {
  // Handle empty or invalid date
  if (!weddingDate || weddingDate.trim() === '') {
    return '';
  }

  const wedding = new Date(weddingDate).getTime();
  
  // Check if date is valid
  if (isNaN(wedding)) {
    return '';
  }

  const today = new Date().getTime();
  const diffMs = wedding - today;

  if (diffMs <= 0) return 'Hari H telah lewat';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  // Ensure we don't return NaN
  if (isNaN(days) || isNaN(months) || isNaN(remainingDays)) {
    return '';
  }

  if (months === 0) return `${days} hari lagi`;
  if (remainingDays === 0) return `${months} bulan lagi`;
  return `${months} bulan ${remainingDays} hari lagi`;
}

/**
 * Default settings
 */
export function getDefaultSettings(): WeddingSettings {
  return {
    weddingDate: '',
    currency: 'IDR',
  };
}

// ============================================
// EMERGENCY BUFFER FUNCTIONS
// ============================================

/**
 * Hitung dana darurat (emergency buffer)
 * @param totalBudget - Total anggaran
 * @param percentage - Persentase buffer (default 15%)
 * @returns Object dengan informasi buffer
 */
export function calculateEmergencyBuffer(
  totalBudget: number, 
  percentage: number = 15
): {
  bufferAmount: number;
  percentage: number;
  totalWithBuffer: number;
} {
  // Validasi input
  if (isNaN(totalBudget) || totalBudget < 0) {
    return {
      bufferAmount: 0,
      percentage,
      totalWithBuffer: 0
    };
  }

  const bufferAmount = totalBudget * (percentage / 100);
  
  return {
    bufferAmount,
    percentage,
    totalWithBuffer: totalBudget + bufferAmount
  };
}

/**
 * Cek status dana darurat
 * @param totalBudget - Total anggaran
 * @param totalActual - Total realisasi
 * @param bufferPercentage - Persentase buffer (default 15%)
 * @returns Object dengan status buffer
 */
export function checkEmergencyBufferStatus(
  totalBudget: number, 
  totalActual: number, 
  bufferPercentage: number = 15
): {
  bufferAmount: number;
  totalWithBuffer: number;
  remainingSafe: number;
  remainingBuffer: number;
  isBufferTouched: boolean;
  bufferUsagePercentage: number;
} {
  // Validasi input
  if (isNaN(totalBudget) || isNaN(totalActual)) {
    return {
      bufferAmount: 0,
      totalWithBuffer: 0,
      remainingSafe: 0,
      remainingBuffer: 0,
      isBufferTouched: false,
      bufferUsagePercentage: 0
    };
  }

  const { bufferAmount, totalWithBuffer } = calculateEmergencyBuffer(totalBudget, bufferPercentage);
  
  const remainingSafe = totalBudget - totalActual; // Dana aman yang tersisa
  const remainingBuffer = totalWithBuffer - totalActual; // Dana darurat yang tersisa
  const isBufferTouched = totalActual > totalBudget; // Jika realisasi > anggaran, berarti dana darurat tersentuh
  
  // Hitung persentase penggunaan buffer
  let bufferUsagePercentage = 0;
  if (isBufferTouched && bufferAmount > 0) {
    bufferUsagePercentage = ((totalActual - totalBudget) / bufferAmount) * 100;
  }
  
  return {
    bufferAmount,
    totalWithBuffer,
    remainingSafe: Math.max(0, remainingSafe),
    remainingBuffer: Math.max(0, remainingBuffer),
    isBufferTouched,
    bufferUsagePercentage: Math.min(100, bufferUsagePercentage) // Cap di 100%
  };
}
