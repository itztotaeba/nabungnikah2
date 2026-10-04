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
  
  // Actions
  syncToCloud: () => Promise<boolean>;
  syncFromCloud: () => Promise<boolean>;
  setStatus: (status: SyncStatus) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  isAutoSyncEnabled: true,

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

  syncFromCloud: async () => {
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
      useToastStore.getState().addToast(
        'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.',
        'error'
      );
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
          // No data found in cloud
          set({ status: 'synced' });
          return false;
        }
        throw error;
      }

      if (data) {
        const { importData } = useWeddingStore.getState();
        
        importData({
          settings: data.settings || {},
          budgetItems: data.budget_items || [],
          savings: data.savings || [],
          guests: data.guests || [],
          vendors: data.vendors || [],
          tasks: data.tasks || [],
        });

        set({ 
          status: 'synced', 
          lastSync: new Date() 
        });
        
        // Jangan tampilkan toast saat auto-sync dari realtime
        // useToastStore.getState().addToast(
        //   'Data berhasil dimuat dari cloud',
        //   'success'
        // );
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error syncing from cloud:', error);
      
      if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
        set({ status: 'offline' });
        useToastStore.getState().addToast(
          'Gagal memuat data dari cloud (offline)',
          'warning'
        );
      } else {
        set({ status: 'error' });
        useToastStore.getState().addToast(
          'Gagal memuat data dari cloud: ' + (error.message || 'Unknown error'),
          'error'
        );
      }
      
      return false;
    }
  },

  setStatus: (status) => set({ status }),
  setAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),
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
