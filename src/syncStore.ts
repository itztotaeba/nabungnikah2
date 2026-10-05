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
  lastSyncTimestamp: string | null; // ISO timestamp untuk filter realtime
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  isRemoteUpdate: boolean; // Flag untuk mencegah sync loop
  
  // Actions
  syncToCloud: (showToast?: boolean) => Promise<boolean>;
  syncFromCloud: (showToast?: boolean, isRealtime?: boolean) => Promise<boolean>;
  setStatus: (status: SyncStatus) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTimestamp: (timestamp: string | null) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  lastSyncTimestamp: null,
  isAutoSyncEnabled: true,
  isSyncing: false,
  isRemoteUpdate: false,

  syncToCloud: async (showToast = false) => {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    const { isRemoteUpdate } = get();
    
    // FIX: Skip sync jika ini adalah update dari remote (mencegah loop)
    if (isRemoteUpdate) {
      console.log('⏭️ Skipping syncToCloud (remote update in progress)');
      return false;
    }
    
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
      
      const { settings, budgetItems, savings, guests, vendors, tasks } = useWeddingStore.getState();
      
      // Generate unique timestamp untuk update ini
      const now = new Date().toISOString();
      
      const data = {
        id: currentWeddingId,
        user_id: user.id,
        settings,
        budget_items: budgetItems,
        savings,
        guests,
        vendors,
        tasks,
        updated_at: now,
      };

      const { error } = await supabase
        .from('wedding_data')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // FIX: Simpan timestamp untuk filter realtime
      set({ 
        status: 'synced', 
        lastSync: new Date(),
        lastSyncTimestamp: now
      });
      
      if (showToast) {
        useToastStore.getState().addToast(
          'Data berhasil disinkronkan ke cloud',
          'success'
        );
      } else {
        console.log('✅ Auto-sync to cloud successful');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error syncing to cloud:', error);
      
      if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
        set({ status: 'offline' });
        if (showToast) {
          useToastStore.getState().addToast(
            'Gagal sync ke cloud, data disimpan lokal',
            'warning'
          );
        }
      } else {
        set({ status: 'error' });
        if (showToast) {
          useToastStore.getState().addToast(
            'Gagal sync ke cloud: ' + (error.message || 'Unknown error'),
            'error'
          );
        }
      }
      
      return false;
    }
  },

  syncFromCloud: async (showToast = false, isRealtime = false) => {
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
      set({ status: 'syncing', isRemoteUpdate: true }); // Set flag untuk mencegah loop
      
      const { data, error } = await supabase
        .from('wedding_data')
        .select('*')
        .eq('id', currentWeddingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          set({ status: 'synced', isRemoteUpdate: false });
          return false;
        }
        throw error;
      }

      if (data) {
        // FIX: Langsung REPLACE data lokal, jangan merge
        // Ini memastikan data yang dihapus di cloud juga terhapus di lokal
        const { importData } = useWeddingStore.getState();
        
        importData({
          settings: data.settings || {},
          budgetItems: Array.isArray(data.budget_items) ? data.budget_items : [],
          savings: Array.isArray(data.savings) ? data.savings : [],
          guests: Array.isArray(data.guests) ? data.guests : [],
          vendors: Array.isArray(data.vendors) ? data.vendors : [],
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
        });

        set({ 
          status: 'synced', 
          lastSync: new Date(),
          lastSyncTimestamp: data.updated_at || new Date().toISOString(),
          isRemoteUpdate: false // Reset flag
        });
        
        if (showToast) {
          useToastStore.getState().addToast(
            'Data berhasil dimuat dari cloud',
            'success'
          );
        }
        
        return true;
      }
      
      set({ isRemoteUpdate: false });
      return false;
    } catch (error: any) {
      console.error('Error syncing from cloud:', error);
      set({ isRemoteUpdate: false });
      
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
      
      return false;
    }
  },

  setStatus: (status) => set({ status }),
  setAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),
}));

// ============================================
// AUTO-SYNC TO CLOUD (Debounce)
// ============================================

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;

useWeddingStore.subscribe((state, prevState) => {
  const hasDataChanged = 
    state.budgetItems !== prevState.budgetItems ||
    state.savings !== prevState.savings ||
    state.guests !== prevState.guests ||
    state.vendors !== prevState.vendors ||
    state.tasks !== prevState.tasks ||
    state.settings !== prevState.settings;

  if (hasDataChanged) {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    const { isSyncing, syncToCloud, isRemoteUpdate } = useSyncStore.getState();

    // FIX: Skip auto-sync jika ini adalah update dari remote
    if (user && currentWeddingId && !isSyncing && !isRemoteUpdate) {
      if (autoSyncTimer) {
        clearTimeout(autoSyncTimer);
      }

      autoSyncTimer = setTimeout(() => {
        console.log('🔄 Auto-syncing to cloud...');
        syncToCloud();
      }, 2000);
    }
  }
});
