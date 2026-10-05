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
  lastSyncTimestamp: string | null;
  lastRemoteSyncTime: number | null; // Timestamp saat terakhir syncFromCloud berhasil
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  
  // Actions
  syncToCloud: (showToast?: boolean) => Promise<boolean>;
  syncFromCloud: (showToast?: boolean) => Promise<boolean>;
  setStatus: (status: SyncStatus) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTimestamp: (timestamp: string | null) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  lastSyncTimestamp: null,
  lastRemoteSyncTime: null,
  isAutoSyncEnabled: true,
  isSyncing: false,

  syncToCloud: async (showToast = false) => {
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

  syncFromCloud: async (showToast = false) => {
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
      set({ status: 'syncing' });
      
      const { data, error } = await supabase
        .from('wedding_data')
        .select('*')
        .eq('id', currentWeddingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          set({ status: 'synced' });
          return false;
        }
        throw error;
      }

      if (data) {
        // REPLACE data lokal dengan data dari cloud
        const { importData } = useWeddingStore.getState();
        
        importData({
          settings: data.settings || {},
          budgetItems: Array.isArray(data.budget_items) ? data.budget_items : [],
          savings: Array.isArray(data.savings) ? data.savings : [],
          guests: Array.isArray(data.guests) ? data.guests : [],
          vendors: Array.isArray(data.vendors) ? data.vendors : [],
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
        });

        // FIX: Update lastRemoteSyncTime untuk mencegah auto-sync loop
        set({ 
          status: 'synced', 
          lastSync: new Date(),
          lastSyncTimestamp: data.updated_at || new Date().toISOString(),
          lastRemoteSyncTime: Date.now() // ← KUNCI: Track kapan terakhir terima dari remote
        });
        
        if (showToast) {
          useToastStore.getState().addToast(
            'Data berhasil dimuat dari cloud',
            'success'
          );
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error syncing from cloud:', error);
      
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
// AUTO-SYNC TO CLOUD (Debounce dengan Throttle)
// ============================================

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
const REMOTE_SYNC_THROTTLE_MS = 5000; // 5 detik throttle setelah syncFromCloud
const AUTO_SYNC_DEBOUNCE_MS = 1500; // 1.5 detik debounce untuk auto-sync

// Defer subscription to avoid circular dependency
if (typeof window !== 'undefined') {
  setTimeout(() => {
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
        const { isSyncing, syncToCloud, lastRemoteSyncTime } = useSyncStore.getState();
        
        // FIX 1: Skip auto-sync jika baru saja terima update dari remote (mencegah loop)
        const now = Date.now();
        const timeSinceLastRemoteSync = lastRemoteSyncTime 
          ? now - lastRemoteSyncTime 
          : Infinity;
        
        if (timeSinceLastRemoteSync < REMOTE_SYNC_THROTTLE_MS) {
          console.log(`⏭️ Skipping auto-sync (recent remote sync ${timeSinceLastRemoteSync}ms ago)`);
          return;
        }
        
        // FIX 2: Skip auto-sync jika sedang syncing
        if (user && currentWeddingId && !isSyncing) {
          if (autoSyncTimer) {
            clearTimeout(autoSyncTimer);
          }

          autoSyncTimer = setTimeout(() => {
            console.log('🔄 Auto-syncing to cloud...');
            syncToCloud();
          }, AUTO_SYNC_DEBOUNCE_MS);
        }
      }
    });
  }, 0);
}
