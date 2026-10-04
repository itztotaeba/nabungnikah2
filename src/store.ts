/**
 * store.ts
 * 
 * Zustand store dengan middleware persist untuk menyimpan data di LocalStorage.
 * Semua logika perhitungan menggunakan fungsi dari helpers.ts.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateItemStatus, generateId, getDefaultSettings } from './helpers';
import { AppState } from './types';

// Re-export types for convenience
export type { WeddingSettings, BudgetItem, SavingsEntry, Guest, AppState } from './types';

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  settings: getDefaultSettings(),
  budgetItems: [],
  savings: [],
  guests: [],
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
        set((state) => ({
          budgetItems: [
            ...state.budgetItems,
            {
              ...item,
              id: generateId(),
              status: calculateItemStatus(item.estimatedCost, item.actualCost),
            },
          ],
        })),

      updateBudgetItem: (id, updates) =>
        set((state) => ({
          budgetItems: state.budgetItems.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            // Auto-calculate status based on costs
            updated.status = calculateItemStatus(updated.estimatedCost, updated.actualCost);
            return updated;
          }),
        })),

      deleteBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id),
        })),

      // ---- Savings ----
      addSavings: (entry) =>
        set((state) => ({
          savings: [
            ...state.savings,
            {
              ...entry,
              id: generateId(),
            },
          ],
        })),

      deleteSavings: (id) =>
        set((state) => ({
          savings: state.savings.filter((entry) => entry.id !== id),
        })),

      // ---- Guests ----
      addGuest: (guest) =>
        set((state) => ({
          guests: [
            ...state.guests,
            {
              ...guest,
              id: generateId(),
            },
          ],
        })),

      updateGuest: (id, updates) =>
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updates } : guest
          ),
        })),

      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        })),

      // ---- Reset ----
      resetData: () => set({ ...initialState }),

      // ---- Import Data ----
      importData: (data) =>
        set({
          settings: data.settings,
          budgetItems: data.budgetItems,
          savings: data.savings,
          guests: data.guests,
        }),
    }),
    {
      name: 'weddingplan-storage', // LocalStorage key
      partialize: (state) => ({
        settings: state.settings,
        budgetItems: state.budgetItems,
        savings: state.savings,
        guests: state.guests,
      }),
    }
  )
);
