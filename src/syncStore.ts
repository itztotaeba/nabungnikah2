import { create } from 'zustand';
import { supabase } from './lib/supabase';
import { useAuthStore } from './authStore';
import { useWeddingStore } from './store';
import { useToastStore } from './toastStore';
import { useCollaborationStore } from './collaborationStore';

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  isAutoSyncEnabled: boolean;
  isSyncing: boolean; // Loading state saat auto-sync setelah login
  
  // Actions
  syncToCloud: () => Promise<boolean>;
  syncFromCloud: (showToast?: boolean) => Promise<boolean>;
  setStatus: (status: SyncStatus) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  isAutoSyncEnabled: true,
  isSyncing: false,

  syncToCloud: async () => {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    
    if (!user) {
      console.log('No user logged in, skipping sync');
      return false;
    }

    if (!currentWeddingId) {
      console.log('No wedding ID, skipping sync');
      return false;
    }

    if (!supabase) {
      console.warn('Supabase not configured, cannot sync to cloud');
      useToastStore.getState().addToast(
        'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.',
        'error'
      );
      return false;
    }

    try {
      set({ status: 'syncing' });
      
      const { settings, budgetItems, savings, guests, vendors, tasks } = useWeddingStore.getState();
      
      const data = {
        id: currentWeddingId,
        user_id: user.id,
        settings,
        budget_items: budgetItems,
        savings,
        guests,
        vendors,
        tasks,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('wedding_data')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      set({ 
        status: 'synced', 
        lastSync: new Date() 
      });
      
      return true;
    } catch (error: any) {
      console.error('Error syncing to cloud:', error);
      
      // Check if offline
      if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
        set({ status: 'offline' });
        useToastStore.getState().addToast(
          'Gagal sync ke cloud, data disimpan lokal',
          'warning'
        );
      } else {
        set({ status: 'error' });
        useToastStore.getState().addToast(
          'Gagal sync ke cloud: ' + (error.message || 'Unknown error'),
          'error'
        );
      }
      
      return false;
    }
  },

  syncFromCloud: async (showToast = false) => {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    
    if (!user) {
      console.log('No user logged in, skipping sync');
      return false;
    }

    if (!currentWeddingId) {
      console.warn('Cannot sync: No currentWeddingId');
      return false;
    }

    if (!supabase) {
      console.warn('Supabase not configured, cannot sync from cloud');
      if (showToast) {
        useToastStore.getState().addToast(
          'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.',
          'error'
        );
      }
      return false;
    }

    try {
      set({ status: 'syncing' });
      
      // Fetch data dari Supabase menggunakan currentWeddingId yang sudah pasti ada
      const { data, error } = await supabase
        .from('wedding_data')
        .select('*')
        .eq('id', currentWeddingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found in cloud - ini normal untuk user baru
          set({ status: 'synced' });
          return false;
        }
        throw error;
      }

      if (data) {
        // Validasi data structure sebelum update state
        try {
          // Validasi required fields
          if (!data.settings || typeof data.settings !== 'object') {
            console.warn('⚠️ Invalid settings data, using default');
            data.settings = {};
          }

          // Validasi arrays
          const safeBudgetItems = Array.isArray(data.budget_items) ? data.budget_items : [];
          const safeSavings = Array.isArray(data.savings) ? data.savings : [];
          const safeGuests = Array.isArray(data.guests) ? data.guests : [];
          const safeVendors = Array.isArray(data.vendors) ? data.vendors : [];
          const safeTasks = Array.isArray(data.tasks) ? data.tasks : [];

          // PENTING: Update state SETELAH data berhasil divalidasi
          const { importData } = useWeddingStore.getState();
          
          importData({
            settings: data.settings,
            budgetItems: safeBudgetItems,
            savings: safeSavings,
            guests: safeGuests,
            vendors: safeVendors,
            tasks: safeTasks,
          });

          set({ 
            status: 'synced', 
            lastSync: new Date()
          });
          
          // Tampilkan toast hanya jika showToast true (untuk manual sync)
          if (showToast) {
            useToastStore.getState().addToast(
              'Data berhasil dimuat dari cloud',
              'success'
            );
          }
          
          return true;
        } catch (validationError) {
          console.error('❌ Data validation error:', validationError);
          set({ status: 'error' });
          
          if (showToast) {
            useToastStore.getState().addToast(
              'Data dari cloud tidak valid. Menggunakan data lokal.',
              'warning'
            );
          }
          
          return false;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error('Sync error:', error);
      
      if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
        set({ status: 'offline' });
        if (showToast) {
          useToastStore.getState().addToast(
            'Gagal memuat data dari cloud (offline)',
            'warning'
          );
        }
      } else {
        set({ status: 'error' });
        if (showToast) {
          useToastStore.getState().addToast(
            'Gagal memuat data dari cloud: ' + (error.message || 'Unknown error'),
            'error'
          );
        }
      }
      
      // Lempar error agar Provider bisa catch dan tampilkan toast gagal
      throw error;
    }
  },

  setStatus: (status) => set({ status }),
  setAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
}));

// Auto-sync hook with debounce
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function triggerAutoSync() {
  const { isAutoSyncEnabled, syncToCloud } = useSyncStore.getState();
  const { user } = useAuthStore.getState();
  
  if (!isAutoSyncEnabled || !user) {
    return;
  }

  // Clear previous timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // Debounce: wait 2 seconds before syncing
  syncTimeout = setTimeout(() => {
    syncToCloud();
  }, 2000);
}
