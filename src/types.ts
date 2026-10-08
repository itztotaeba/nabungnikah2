// WeddingPlan Types

export interface WeddingSettings {
  weddingDate: string;
  currency: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  itemName: string;
  estimatedCost: number;
  actualCost: number;
  status: 'Belum' | 'DP' | 'Lunas';
  updatedBy?: string;
  updatedAt?: string;
}

export interface SavingsEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  note: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Guest {
  id: string;
  name: string;
  category: 'Keluarga' | 'Teman' | 'Rekan Kerja' | 'Lainnya';
  pax: number;
  circle?: string;
  rsvpStatus: 'Belum Respon' | 'Hadir' | 'Tidak Hadir';
  updatedBy?: string;
  updatedAt?: string;
}

export type VendorType = 'All-in' | 'Satuan';
export type VendorCategory = 'WO' | 'Katering' | 'Venue' | 'MUA' | 'Fotografi' | 'Dekorasi' | 'Entertainment' | 'Busana' | 'MC' | 'Undangan & Souvenir' | 'Lainnya';
export type ContractStatus = 'Belum Kontrak' | 'Sudah DP' | 'Lunas';

export interface VendorPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
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
  remainingBalance: number;
  dueDateDP?: string;
  dueDateFinal?: string;
  contractStatus: ContractStatus;
  notes?: string;
  rating?: number;
  review?: string;
  checklist?: Record<string, { checked: boolean; notes: string }>;
  customChecklist?: Array<{ id: string; question: string; description?: string }>;
  photos?: VendorPhoto[];
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type TaskCategory = 'Administrasi' | 'Vendor' | 'Pakaian' | 'Dekorasi' | 'Undangan' | 'Lainnya';
export type TaskAssignee = 'Pria' | 'Wanita' | 'Bersama';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  monthsBefore: number;
  isCompleted: boolean;
  completedAt?: string;
  isDefault: boolean;
  assignee: TaskAssignee;
  updatedBy?: string;
  updatedAt?: string;
}

export interface WeddingData {
  settings: WeddingSettings;
  budgetItems: BudgetItem[];
  savings: SavingsEntry[];
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];
}
