import * as XLSX from 'xlsx';
import { WeddingSettings, BudgetItem, SavingsEntry, Guest, Vendor, Task } from '../types';

interface AppData {
  settings: WeddingSettings;
  budgetItems: BudgetItem[];
  savings: SavingsEntry[];
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];
}

/**
 * Generate dan download file Excel dengan multiple sheets
 * @param data - Semua data dari Zustand store
 */
export function exportToExcel(data: AppData): void {
  try {
    const { settings, budgetItems, savings, guests, vendors, tasks } = data;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // ============================================
    // SHEET 1: Ringkasan
    // ============================================
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
    const totalSavings = savings.reduce((sum, entry) => sum + entry.amount, 0);
    const remainingBudget = totalBudget - totalActual;
    const totalGuests = guests.reduce((sum, guest) => sum + guest.pax, 0);
    const totalVendors = vendors.length;

    const summaryData = [
      { 'Item': 'Tanggal Pernikahan', 'Value': settings.weddingDate ? new Date(settings.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum diatur' },
      { 'Item': 'Mata Uang', 'Value': settings.currency || 'IDR' },
      { 'Item': '', 'Value': '' },
      { 'Item': 'Total Anggaran', 'Value': totalBudget },
      { 'Item': 'Total Realisasi', 'Value': totalActual },
      { 'Item': 'Sisa Anggaran', 'Value': remainingBudget },
      { 'Item': 'Total Tabungan', 'Value': totalSavings },
      { 'Item': '', 'Value': '' },
      { 'Item': 'Total Tamu (Pax)', 'Value': totalGuests },
      { 'Item': 'Total Tamu (Orang)', 'Value': guests.length },
      { 'Item': 'Total Vendor', 'Value': totalVendors },
      { 'Item': 'Total Tugas', 'Value': tasks.length },
      { 'Item': 'Tugas Selesai', 'Value': tasks.filter(t => t.isCompleted).length },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    
    // Set column widths
    wsSummary['!cols'] = [
      { wch: 25 }, // Item
      { wch: 40 }, // Value
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // ============================================
    // SHEET 2: Anggaran
    // ============================================
    const budgetData = budgetItems.map(item => ({
      'Kategori': item.category,
      'Nama Item': item.itemName,
      'Estimasi Biaya': item.estimatedCost,
      'Biaya Aktual': item.actualCost,
      'Selisih': item.estimatedCost - item.actualCost,
      'Status': item.status,
    }));

    const wsBudget = XLSX.utils.json_to_sheet(budgetData);
    
    // Set column widths
    wsBudget['!cols'] = [
      { wch: 20 }, // Kategori
      { wch: 30 }, // Nama Item
      { wch: 18 }, // Estimasi Biaya
      { wch: 18 }, // Biaya Aktual
      { wch: 18 }, // Selisih
      { wch: 12 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, wsBudget, 'Anggaran');

    // ============================================
    // SHEET 3: Tabungan
    // ============================================
    const savingsData = savings.map(entry => ({
      'Tanggal': new Date(entry.date).toLocaleDateString('id-ID'),
      'Sumber Dana': entry.source,
      'Nominal': entry.amount,
      'Catatan': entry.note || '-',
    }));

    const wsSavings = XLSX.utils.json_to_sheet(savingsData);
    
    // Set column widths
    wsSavings['!cols'] = [
      { wch: 15 }, // Tanggal
      { wch: 20 }, // Sumber Dana
      { wch: 18 }, // Nominal
      { wch: 30 }, // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, wsSavings, 'Tabungan');

    // ============================================
    // SHEET 4: Tamu
    // ============================================
    const guestsData = guests.map(guest => ({
      'Nama Tamu': guest.name,
      'Kategori': guest.category,
      'Jumlah Pax': guest.pax,
      'Circle': guest.circle || '-',
      'Status RSVP': guest.rsvpStatus,
    }));

    const wsGuests = XLSX.utils.json_to_sheet(guestsData);
    
    // Set column widths
    wsGuests['!cols'] = [
      { wch: 30 }, // Nama Tamu
      { wch: 15 }, // Kategori
      { wch: 12 }, // Jumlah Pax
      { wch: 20 }, // Circle
      { wch: 15 }, // Status RSVP
    ];

    XLSX.utils.book_append_sheet(wb, wsGuests, 'Tamu');

    // ============================================
    // SHEET 5: Vendor
    // ============================================
    const vendorsData = vendors.map(vendor => ({
      'Nama Vendor': vendor.name,
      'Tipe': vendor.type,
      'Kategori': vendor.category,
      'Kontak WA': vendor.contactWA,
      'Harga Deal': vendor.dealPrice,
      'DP': vendor.dpAmount,
      'Sisa Pembayaran': vendor.remainingBalance,
      'Status Kontrak': vendor.contractStatus,
      'Jatuh Tempo DP': vendor.dueDateDP ? new Date(vendor.dueDateDP).toLocaleDateString('id-ID') : '-',
      'Jatuh Tempo Pelunasan': vendor.dueDateFinal ? new Date(vendor.dueDateFinal).toLocaleDateString('id-ID') : '-',
    }));

    const wsVendors = XLSX.utils.json_to_sheet(vendorsData);
    
    // Set column widths
    wsVendors['!cols'] = [
      { wch: 30 }, // Nama Vendor
      { wch: 12 }, // Tipe
      { wch: 15 }, // Kategori
      { wch: 18 }, // Kontak WA
      { wch: 18 }, // Harga Deal
      { wch: 18 }, // DP
      { wch: 18 }, // Sisa Pembayaran
      { wch: 15 }, // Status Kontrak
      { wch: 18 }, // Jatuh Tempo DP
      { wch: 18 }, // Jatuh Tempo Pelunasan
    ];

    XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendor');

    // ============================================
    // SHEET 6: Timeline
    // ============================================
    const tasksData = tasks.map(task => ({
      'Judul Tugas': task.title,
      'Kategori': task.category,
      'Bulan Sebelum': task.monthsBefore,
      'Ditugaskan Kepada': task.assignee,
      'Status': task.isCompleted ? 'Selesai' : 'Belum',
    }));

    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    
    // Set column widths
    wsTasks['!cols'] = [
      { wch: 40 }, // Judul Tugas
      { wch: 15 }, // Kategori
      { wch: 15 }, // Bulan Sebelum
      { wch: 20 }, // Ditugaskan Kepada
      { wch: 12 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, wsTasks, 'Timeline');

    // ============================================
    // Download file
    // ============================================
    const today = new Date().toISOString().split('T')[0];
    const filename = `WeddingPlan-MahesAira-${today}.xlsx`;
    
    XLSX.writeFile(wb, filename);

    return;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}
