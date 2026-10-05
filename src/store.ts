/**
 * store.ts
 * 
 * Zustand store dengan middleware persist untuk menyimpan data di LocalStorage.
 * Semua logika perhitungan menggunakan fungsi dari helpers.ts.
 * Auto-sync ke cloud setiap kali ada perubahan data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateItemStatus, generateId, getDefaultSettings } from './helpers';
import { getAuditMetadata } from './helpers/auditTrail';
import { AppState } from './types';
import { defaultTasks } from './data/defaultTasks';

// Re-export types for convenience
export type { 
  WeddingSettings, 
  BudgetItem, 
  SavingsEntry, 
  Guest, 
  Vendor, 
  VendorType,
  VendorCategory,
  ContractStatus,
  Task,
  TaskCategory,
  TaskAssignee,
  AppState 
} from './types';

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  settings: getDefaultSettings(),
  budgetItems: [],
  savings: [],
  guests: [],
  vendors: [],
  tasks: defaultTasks.map(task => ({
    ...task,
    id: generateId(),
    isCompleted: false,
  })),
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useWeddingStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // ---- Settings ----
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // ---- Budget Items ----
      addBudgetItem: (item) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            budgetItems: [
              ...state.budgetItems,
              {
                ...item,
                id: generateId(),
                status: calculateItemStatus(item.estimatedCost, item.actualCost),
                ...audit,
              },
            ],
          };
        }),

      updateBudgetItem: (id, updates) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            budgetItems: state.budgetItems.map((item) => {
              if (item.id !== id) return item;
              const updated = { ...item, ...updates, ...audit };
              // Auto-calculate status based on costs
              updated.status = calculateItemStatus(updated.estimatedCost, updated.actualCost);
              return updated;
            }),
          };
        }),

      deleteBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id),
        })),

      // ---- Savings ----
      addSavings: (entry) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            savings: [
              ...state.savings,
              {
                ...entry,
                id: generateId(),
                ...audit,
              },
            ],
          };
        }),

      deleteSavings: (id) =>
        set((state) => ({
          savings: state.savings.filter((entry) => entry.id !== id),
        })),

      // ---- Guests ----
      addGuest: (guest) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            guests: [
              ...state.guests,
              {
                ...guest,
                id: generateId(),
                ...audit,
              },
            ],
          };
        }),

      updateGuest: (id, updates) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            guests: state.guests.map((guest) =>
              guest.id === id ? { ...guest, ...updates, ...audit } : guest
            ),
          };
        }),

      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        })),

      // ---- Vendors ----
      addVendor: (vendor) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            vendors: [
              ...state.vendors,
              {
                ...vendor,
                id: generateId(),
                remainingBalance: vendor.dealPrice - vendor.dpAmount,
                createdAt: new Date().toISOString(),
                ...audit,
              },
            ],
          };
        }),

      updateVendor: (id, updates) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            vendors: state.vendors.map((vendor) => {
              if (vendor.id !== id) return vendor;
              const updated = { ...vendor, ...updates, ...audit };
              // Auto-calculate remainingBalance
              updated.remainingBalance = updated.dealPrice - updated.dpAmount;
              return updated;
            }),
          };
        }),

      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
        })),

      // ---- Tasks ----
      addTask: (task) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            tasks: [
              ...state.tasks,
              {
                ...task,
                id: generateId(),
                isCompleted: false,
                ...audit,
              },
            ],
          };
        }),

      toggleTask: (id) =>
        set((state) => {
          const audit = getAuditMetadata();
          return {
            tasks: state.tasks.map((task) => {
              if (task.id !== id) return task;
              return {
                ...task,
                isCompleted: !task.isCompleted,
                completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
                ...audit,
              };
            }),
          };
        }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // ---- Reset ----
      resetData: () => set({ ...initialState }),

      // ---- Import Data ----
      importData: (data) => {
        try {
          // Validasi data sebelum import
          const safeSettings = data.settings && typeof data.settings === 'object' 
            ? data.settings 
            : { weddingDate: '', currency: 'IDR' };
          
          const safeBudgetItems = Array.isArray(data.budgetItems) ? data.budgetItems : [];
          const safeSavings = Array.isArray(data.savings) ? data.savings : [];
          const safeGuests = Array.isArray(data.guests) ? data.guests : [];
          const safeVendors = Array.isArray(data.vendors) ? data.vendors : [];
          const safeTasks = Array.isArray(data.tasks) ? data.tasks : [];

          set({
            settings: safeSettings,
            budgetItems: safeBudgetItems,
            savings: safeSavings,
            guests: safeGuests,
            vendors: safeVendors,
            tasks: safeTasks,
          });
        } catch (error) {
          console.error('❌ Import data error:', error);
          // Fallback ke initial state jika import gagal
          set({ ...initialState });
        }
      },
    }),
    {
      name: 'weddingplan-storage', // LocalStorage key
      partialize: (state) => ({
        settings: state.settings,
        budgetItems: state.budgetItems,
        savings: state.savings,
        guests: state.guests,
        vendors: state.vendors,
        tasks: state.tasks,
      }),
      // Safe hydration: handle corrupted LocalStorage data
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('❌ LocalStorage hydration error:', error);
            console.log('🔄 Resetting to default state...');
            
            // Clear corrupted data
            try {
              localStorage.removeItem('weddingplan-storage');
              console.log('✅ Corrupted LocalStorage cleared');
            } catch (clearError) {
              console.error('❌ Failed to clear LocalStorage:', clearError);
            }
          } else if (state) {
            console.log('✅ LocalStorage hydrated successfully');
          }
        };
      },
    }
  )
);

// ============================================
// AUTO-SYNC TO CLOUD (Debounce)
// ============================================

// Import stores untuk auto-sync
import { useSyncStore } from './syncStore';
import { useAuthStore } from './authStore';
import { useCollaborationStore } from './collaborationStore';

// Debounce timer untuk auto-sync
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;

// Subscribe ke perubahan state untuk auto-sync
useWeddingStore.subscribe((state, prevState) => {
  // Cek apakah ada perubahan pada data utama (bukan hanya UI state)
  const hasDataChanged = 
    state.budgetItems !== prevState.budgetItems ||
    state.savings !== prevState.savings ||
    state.guests !== prevState.guests ||
    state.vendors !== prevState.vendors ||
    state.tasks !== prevState.tasks ||
    state.settings !== prevState.settings;

  if (hasDataChanged) {
    // Get auth dan collaboration state
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    const { isSyncing, syncToCloud } = useSyncStore.getState();

    // Auto-sync hanya berjalan jika:
    // 1. User sudah login
    // 2. Ada currentWeddingId
    // 3. Tidak sedang sync dari cloud (mencegah infinite loop)
    if (user && currentWeddingId && !isSyncing) {
      // Clear previous timer
      if (autoSyncTimer) {
        clearTimeout(autoSyncTimer);
      }

      // Set new timer dengan debounce 2 detik
      autoSyncTimer = setTimeout(() => {
        console.log('🔄 Auto-syncing to cloud...');
        syncToCloud();
      }, 2000);
    }
  }
});
