import { useEffect } from 'react';
import { useAuthStore } from '../authStore';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import { useWeddingStore } from '../store';
import { useCollaborationStore } from '../collaborationStore';
import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Custom hook untuk sinkronisasi state autentikasi Supabase dengan Zustand Store
 * Harus dipanggil di root component (App.tsx) untuk memastikan listener aktif
 */
export function useAuthSync() {
  const { setUser, setSession } = useAuthStore();
  const { syncFromCloud, setIsSyncing } = useSyncStore();
  const { addToast } = useToastStore();
  const resetWeddingStore = useWeddingStore((state) => state.resetData);
  const resetCollaborationStore = useCollaborationStore((state) => state.resetData);

  useEffect(() => {
    // Skip jika supabase tidak dikonfigurasi
    if (!supabase) {
      console.warn('Supabase not configured, auth sync disabled');
      return;
    }

    console.log('🔗 Setting up auth state listener...');

    // Setup listener untuk mendeteksi perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔔 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          // User berhasil login
          console.log('✅ User signed in:', session.user.email);
          setUser(session.user);
          setSession(session);

          // Tampilkan toast notification
          addToast('Berhasil login! Memuat data dari cloud...', 'success');

          // Auto-sync data dari cloud dengan loading state
          setIsSyncing(true);
          try {
            await syncFromCloud(true); // showToast = true
          } catch (error) {
            console.error('Error syncing from cloud after login:', error);
          } finally {
            setIsSyncing(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // User logout
          console.log('👋 User signed out');
          setUser(null);
          setSession(null);
          
          // Reset semua data store
          resetWeddingStore();
          resetCollaborationStore();
          
          addToast('Logout berhasil', 'success');
        } else if (event === 'TOKEN_REFRESHED') {
          // Token di-refresh, update session
          console.log('🔄 Token refreshed');
          if (session) {
            setSession(session);
            setUser(session.user);
          }
        } else if (event === 'USER_UPDATED') {
          // User data di-update
          console.log('👤 User updated');
          if (session) {
            setUser(session.user);
          }
        }
      }
    );

    // Cleanup function untuk unsubscribe saat component unmount
    return () => {
      console.log('🧹 Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, syncFromCloud, addToast, setIsSyncing, resetWeddingStore, resetCollaborationStore]);
}
