/**
 * types.ts
 * 
 * Semua type definitions untuk aplikasi Mahes&Aira Wedding Plan.
 * Dipisahkan untuk menghindari circular dependency.
 */

export interface WeddingSettings {
  weddingDate: string; // ISO String
  currency: string; // default 'IDR'
}

export interface BudgetItem {
  id: string;
  category: string;
  itemName: string;
  estimatedCost: number;
  actualCost: number;
  status: 'Belum' | 'DP' | 'Lunas'; // Auto-calculated based on costs
  updatedBy?: string; // Email user yang terakhir mengubah
  updatedAt?: string; // ISO timestamp
}

export interface SavingsEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  note: string;
  updatedBy?: string; // Email user yang terakhir mengubah
  updatedAt?: string; // ISO timestamp
}

export interface Guest {
  id: string;
  name: string;
  category: 'Keluarga' | 'Teman' | 'Rekan Kerja' | 'Lainnya';
  pax: number;
  circle?: string; // Circle/kelompok tamu (manual input)
  rsvpStatus: 'Belum Respon' | 'Hadir' | 'Tidak Hadir';
  updatedBy?: string; // Email user yang terakhir mengubah
  updatedAt?: string; // ISO timestamp
}

// ============================================
// VENDOR TYPES
// ============================================
export type VendorType = 'All-in' | 'Satuan';
export type VendorCategory = 'WO' | 'Katering' | 'Venue' | 'MUA' | 'Fotografi' | 'Dekorasi' | 'Entertainment' | 'Busana' | 'MC' | 'Undangan & Souvenir' | 'Lainnya';
export type ContractStatus = 'Belum Kontrak' | 'Sudah DP' | 'Lunas';

export interface CustomChecklistItem {
  id: string;
  question: string;
  description?: string;
}

// Foto contoh hasil kerja vendor (max 5 per vendor) - disimpan di Supabase Storage,
// fallback ke base64 data URL jika cloud sync tidak dikonfigurasi
export interface VendorPhoto {
  id: string;
  url: string; // public URL Supabase Storage atau data:image/...;base64,...
  fileName?: string;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  category: VendorCategory;
  contactWA: string;
  email?: string;
  address?: string;
  dealPrice: number;
  dpAmount: number;
  remainingBalance: number; // Auto-calculated: dealPrice - dpAmount
  dueDateDP?: string;
  dueDateFinal?: string;
  contractStatus: ContractStatus;
  notes?: string;
  rating?: number; // 1-5
  review?: string;
  checklist?: Record<string, { checked: boolean; notes: string }>; // Checklist detail per kategori dengan notes
  customChecklist?: CustomChecklistItem[]; // Checklist custom yang ditambahkan user
  photos?: VendorPhoto[]; // Foto contoh hasil kerja vendor (maksimal 5)
  createdAt: string;
  updatedBy?: string; // Email user yang terakhir mengubah
  updatedAt?: string; // ISO timestamp
}

// ============================================
// TASK TYPES
// ============================================
export type TaskCategory = 'Administrasi' | 'Vendor' | 'Pakaian' | 'Dekorasi' | 'Undangan' | 'Lainnya';
export type TaskAssignee = 'Pria' | 'Wanita' | 'Bersama';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  monthsBefore: number; // Berapa bulan sebelum pernikahan (misal: 3, 1, 0)
  isCompleted: boolean;
  completedAt?: string; // ISO Date
  isDefault: boolean; // True untuk template bawaan, False untuk custom user
  assignee: TaskAssignee; // Pembagian tugas: Pria, Wanita, atau Bersama
  updatedBy?: string; // Email user yang terakhir mengubah
  updatedAt?: string; // ISO timestamp
}

export interface AppState {
  settings: WeddingSettings;
  budgetItems: BudgetItem[];
  savings: SavingsEntry[];
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];

  // Settings Actions
  updateSettings: (settings: Partial<WeddingSettings>) => void;

  // Budget Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'status'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Savings Actions
  addSavings: (entry: Omit<SavingsEntry, 'id'>) => void;
  deleteSavings: (id: string) => void;

  // Guest Actions
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  // Vendor Actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'remainingBalance'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'completedAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Reset
  resetData: () => void;

  // Import/Export
  importData: (data: {
    settings: WeddingSettings;
    budgetItems: BudgetItem[];
    savings: SavingsEntry[];
    guests: Guest[];
    vendors: Vendor[];
    tasks: Task[];
  }) => void;
}
