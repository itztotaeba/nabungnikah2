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

// Expose to window for cross-module access
if (typeof window !== 'undefined') {
  (window as any).__SYNC_STATE__ = {
    isSyncingToCloud: () => isSyncingToCloud,
    isSyncingFromCloud: () => isSyncingFromCloud,
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
      set({ status: 'syncing', isSyncing: true });
      
      const { settings, budgetItems, savings, guests, vendors, tasks, seserahanItems } = useWeddingStore.getState();
      
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
        seserahan_items: seserahanItems,
        updated_at: now,
      };

      // [MONITORING SEMENTARA] Cetak ukuran payload (dalam bytes) yang dikirim ke cloud.
      // Gunakan angka ini untuk memutuskan apakah perlu diff-based sync di masa depan.
      // Hapus baris ini setelah monitoring selesai.
      console.log(`[syncToCloud] payload size: ${JSON.stringify(data).length} bytes`);

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
        
        // FIX: Merge settings, jangan override jika cloud kosong
        const localSettings = useWeddingStore.getState().settings;
        const cloudSettings = data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0
          ? data.settings
          : localSettings; // Gunakan settings lokal jika cloud kosong
        
        importData({
          settings: cloudSettings,
          budgetItems: Array.isArray(data.budget_items) ? data.budget_items : [],
          savings: Array.isArray(data.savings) ? data.savings : [],
          guests: Array.isArray(data.guests) ? data.guests : [],
          vendors: Array.isArray(data.vendors) ? data.vendors : [],
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
          // Fallback: jika kolom seserahan_items belum ada di DB (belum migration),
          // jangan hapus data lokal — pakai data lokal yang ada.
          seserahanItems: Array.isArray(data.seserahan_items)
            ? data.seserahan_items
            : useWeddingStore.getState().seserahanItems,
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
// OPTIMASI: Debounce dipercepat dari 2000ms -> 1000ms agar auto-sync lebih responsif.
const AUTO_SYNC_DEBOUNCE_MS = 1000; // 1 detik debounce

// OPTIMASI: Mekanisme cooldown (SYNC_COOLDOWN_MS = 5000) yang memblokir sync
// sudah DIHAPUS. Race condition & infinite loop dicegah sepenuhnya oleh flag
// `isSyncingToCloud` / `isSyncingFromCloud` di atas — jauh lebih aman dan
// tidak memblokir perubahan data user secara tidak perlu setelah sync selesai.

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
        state.seserahanItems !== prevState.seserahanItems ||
        state.settings !== prevState.settings;
      
      if (hasDataChanged) {
        const { user } = useAuthStore.getState();
        const { currentWeddingId } = useCollaborationStore.getState();
        const { isSyncing } = useSyncStore.getState();
        
        // FIX 1: Skip jika sedang sync
        if (isSyncingToCloud || isSyncingFromCloud) {

          return;
        }
        
        // OPTIMASI (TUGAS 1): Blok "cooldown" yang lama (SYNC_COOLDOWN_MS) DIHAPUS.
        // Sebelumnya, perubahan data user diblokir hingga 5 detik setelah sync,
        // meskipun sync sudah selesai. Perlindungan terhadap race condition &
        // infinite loop kini sepenuhnya ditangani oleh flag isSyncingToCloud /
        // isSyncingFromCloud di atas (FIX 1).

        // Optimistic UI tetap terjaga: state lokal update instan (oleh store),
        // sync ke cloud dijadwalkan di background dengan debounce singkat.
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
