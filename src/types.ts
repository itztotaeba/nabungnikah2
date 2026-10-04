/**
 * types.ts
 * 
 * Semua type definitions untuk aplikasi WeddingPlan.
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
}

export interface SavingsEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  note: string;
}

export interface Guest {
  id: string;
  name: string;
  category: 'Keluarga' | 'Teman' | 'Rekan Kerja' | 'Lainnya';
  pax: number;
  estimatedGift: number;
  rsvpStatus: 'Belum Respon' | 'Hadir' | 'Tidak Hadir';
}

export interface AppState {
  settings: WeddingSettings;
  budgetItems: BudgetItem[];
  savings: SavingsEntry[];
  guests: Guest[];

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

  // Reset
  resetData: () => void;

  // Import/Export
  importData: (data: {
    settings: WeddingSettings;
    budgetItems: BudgetItem[];
    savings: SavingsEntry[];
    guests: Guest[];
  }) => void;
}
