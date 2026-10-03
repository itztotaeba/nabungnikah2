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
  const wedding = new Date(weddingDate).getTime();
  const today = new Date().getTime();
  const diffMs = wedding - today;

  if (diffMs <= 0) return 0;

  const monthsRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
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
  if (remainingMonths <= 0) return fundingGap; // Harus lunas sekarang
  return Math.ceil(fundingGap / remainingMonths);
}

// ============================================
// 7. PROGRESS PERSENTASE
// Formula: (Total Tabungan / Total Anggaran) * 100 (Maksimal 100%)
// ============================================
export function calculateProgressPercentage(totalSavings: number, totalBudget: number): number {
  if (totalBudget === 0) return 0;
  const percentage = (totalSavings / totalBudget) * 100;
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
  const wedding = new Date(weddingDate).getTime();
  const today = new Date().getTime();
  const diffMs = wedding - today;

  if (diffMs <= 0) return 'Hari H telah lewat';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

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
