import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeddingData, BudgetItem, SavingsEntry, Guest, Vendor, Task, WeddingSettings } from './types';

export type { Vendor } from './types';

interface WeddingStore extends WeddingData {
  // Settings actions
  updateSettings: (settings: Partial<WeddingSettings>) => void;
  
  // Budget actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  
  // Savings actions
  addSavings: (entry: Omit<SavingsEntry, 'id'>) => void;
  deleteSavings: (id: string) => void;
  
  // Guest actions
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  
  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'remainingBalance'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // Import/Export
  importData: (data: WeddingData) => void;
  
  // Reset
  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWeddingStore = create<WeddingStore>()(
  persist(
    (set) => ({
      // Initial state
      settings: {
        weddingDate: '',
        currency: 'IDR',
      },
      budgetItems: [],
      savings: [],
      guests: [],
      vendors: [],
      tasks: [],
      
      // Settings actions
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      // Budget actions
      addBudgetItem: (item) =>
        set((state) => ({
          budgetItems: [
            ...state.budgetItems,
            { ...item, id: generateId() },
          ],
        })),
      updateBudgetItem: (id, updates) =>
        set((state) => ({
          budgetItems: state.budgetItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      deleteBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id),
        })),
      
      // Savings actions
      addSavings: (entry) =>
        set((state) => ({
          savings: [
            ...state.savings,
            { ...entry, id: generateId() },
          ],
        })),
      deleteSavings: (id) =>
        set((state) => ({
          savings: state.savings.filter((entry) => entry.id !== id),
        })),
      
      // Guest actions
      addGuest: (guest) =>
        set((state) => ({
          guests: [
            ...state.guests,
            { ...guest, id: generateId() },
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
      
      // Vendor actions
      addVendor: (vendor) =>
        set((state) => {
          const dealPrice = vendor.dealPrice;
          const dpAmount = vendor.dpAmount;
          return {
            vendors: [
              ...state.vendors,
              {
                ...vendor,
                id: generateId(),
                remainingBalance: dealPrice - dpAmount,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      updateVendor: (id, updates) =>
        set((state) => ({
          vendors: state.vendors.map((vendor) => {
            if (vendor.id === id) {
              const updatedVendor = { ...vendor, ...updates };
              if (updates.dealPrice !== undefined || updates.dpAmount !== undefined) {
                updatedVendor.remainingBalance = updatedVendor.dealPrice - updatedVendor.dpAmount;
              }
              return updatedVendor;
            }
            return vendor;
          }),
        })),
      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
        })),
      
      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: generateId() },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, isCompleted: !task.isCompleted, completedAt: !task.isCompleted ? new Date().toISOString() : undefined }
              : task
          ),
        })),
      
      // Import data
      importData: (data) =>
        set({
          settings: data.settings,
          budgetItems: data.budgetItems,
          savings: data.savings,
          guests: data.guests,
          vendors: data.vendors,
          tasks: data.tasks,
        }),
      
      // Reset
      resetData: () =>
        set({
          settings: { weddingDate: '', currency: 'IDR' },
          budgetItems: [],
          savings: [],
          guests: [],
          vendors: [],
          tasks: [],
        }),
    }),
    {
      name: 'weddingplan-storage',
    }
  )
);
