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

// ============================================
// GLOBAL SYNC STATE (lebih reliable dari store state)
// ============================================
let isSyncingToCloud = false;
let isSyncingFromCloud = false;
let lastSyncToCloudTime = 0;
let lastSyncFromCloudTime = 0;

// Expose to window for cross-module access
if (typeof window !== 'undefined') {
  (window as any).__SYNC_STATE__ = {
    isSyncingToCloud: () => isSyncingToCloud,
    isSyncingFromCloud: () => isSyncingFromCloud,
    lastSyncToCloudTime: () => lastSyncToCloudTime,
    lastSyncFromCloudTime: () => lastSyncFromCloudTime,
  };
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  lastSyncTimestamp: null,
  isAutoSyncEnabled: true,
  isSyncing: false,

  syncToCloud: async (showToast = false) => {
    // FIX: Skip jika sedang sync (mencegah concurrent sync)
    if (isSyncingToCloud || isSyncingFromCloud) {

      return false;
    }

    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    
    if (!user || !currentWeddingId || !supabase) {
      return false;
    }

    try {
      isSyncingToCloud = true;
      lastSyncToCloudTime = Date.now();
      set({ status: 'syncing', isSyncing: true });
      
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

      isSyncingToCloud = false;
      set({ 
        status: 'synced', 
        lastSync: new Date(),
        lastSyncTimestamp: now,
        isSyncing: false
      });
      
      if (showToast) {
        useToastStore.getState().addToast('Data berhasil disinkronkan ke cloud', 'success');
      } else {

      }
      
      return true;
    } catch (error: any) {
      console.error('Error syncing to cloud:', error);
      isSyncingToCloud = false;
      set({ status: 'error', isSyncing: false });
      return false;
    }
  },

  syncFromCloud: async (showToast = false) => {
    // FIX: Skip jika sedang sync (mencegah concurrent sync)
    if (isSyncingToCloud || isSyncingFromCloud) {

      return false;
    }

    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    
    if (!user || !currentWeddingId || !supabase) {
      return false;
    }

    try {
      isSyncingFromCloud = true;
      lastSyncFromCloudTime = Date.now();
      set({ status: 'syncing', isSyncing: true });
      
      const { data, error } = await supabase
        .from('wedding_data')
        .select('*')
        .eq('id', currentWeddingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          isSyncingFromCloud = false;
          set({ status: 'synced', isSyncing: false });
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

        isSyncingFromCloud = false;
        set({ 
          status: 'synced', 
          lastSync: new Date(),
          lastSyncTimestamp: data.updated_at || new Date().toISOString(),
          isSyncing: false
        });
        
        if (showToast) {
          useToastStore.getState().addToast('Data berhasil dimuat dari cloud', 'success');
        } else {

        }
        
        return true;
      }
      
      isSyncingFromCloud = false;
      set({ isSyncing: false });
      return false;
    } catch (error: any) {
      console.error('Error syncing from cloud:', error);
      isSyncingFromCloud = false;
      set({ status: 'error', isSyncing: false });
      return false;
    }
  },

  setStatus: (status) => set({ status }),
  setAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),
}));

// ============================================
// AUTO-SYNC TO CLOUD (dengan proper loop prevention)
// ============================================

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_SYNC_DEBOUNCE_MS = 2000; // 2 detik debounce
const SYNC_COOLDOWN_MS = 5000; // 5 detik cooldown setelah sync

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
        const { isSyncing } = useSyncStore.getState();
        
        // FIX 1: Skip jika sedang sync
        if (isSyncingToCloud || isSyncingFromCloud) {

          return;
        }
        
        // FIX 2: Skip jika baru saja sync (cooldown)
        const now = Date.now();
        const timeSinceLastSyncToCloud = now - lastSyncToCloudTime;
        const timeSinceLastSyncFromCloud = now - lastSyncFromCloudTime;
        
        if (timeSinceLastSyncToCloud < SYNC_COOLDOWN_MS || timeSinceLastSyncFromCloud < SYNC_COOLDOWN_MS) {

          return;
        }
        
        // FIX 3: Skip jika sedang syncing
        if (user && currentWeddingId && !isSyncing) {
          if (autoSyncTimer) {
            clearTimeout(autoSyncTimer);
          }

          autoSyncTimer = setTimeout(() => {

            useSyncStore.getState().syncToCloud();
          }, AUTO_SYNC_DEBOUNCE_MS);
        }
      }
    });
  }, 0);
}
