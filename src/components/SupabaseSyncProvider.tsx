import { useEffect } from 'react';
import { useAuthStore } from '../authStore';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import { useWeddingStore } from '../store';
import { useCollaborationStore } from '../collaborationStore';
import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * SupabaseSyncProvider - Komponen Provider untuk menangani Auth State Change
 * 
 * Komponen ini mendengarkan perubahan auth state dari Supabase dan menangani:
 * - SIGNED_IN: Auto-sync data dari cloud dengan loading state
 * - SIGNED_OUT: Reset semua data store
 * 
 * PENTING: Toast notification dipanggil SETELAH data berhasil dimuat,
 * bukan di dalam store, untuk menghindari race condition.
 */
export default function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
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



    // Setup listener untuk mendeteksi perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {


        if (event === 'SIGNED_IN' && session) {
          // User berhasil login

          setUser(session.user);
          setSession(session);

          // Tampilkan toast notification awal
          addToast('Berhasil login! Memuat data dari cloud...', 'success');

          // Set loading state
          setIsSyncing(true);

          try {
            // LANGKAH 1: Inisialisasi wedding session dulu (dapatkan currentWeddingId)
            const initializeWeddingSession = useCollaborationStore.getState().initializeWeddingSession;
            
            try {
              await initializeWeddingSession();
            } catch (initError: any) {
              console.error('❌ Initialize wedding session failed:', initError);
              addToast('Gagal menginisialisasi wedding: ' + (initError.message || 'Unknown error'), 'error');
              setIsSyncing(false);
              return;
            }

            // Cek apakah user sudah punya wedding
            const { currentWeddingId } = useCollaborationStore.getState();
            if (!currentWeddingId) {

              addToast('Selamat datang! Buat wedding baru atau tunggu di-invite untuk mulai kolaborasi.', 'info');
              setIsSyncing(false);
              return;
            }

            // LANGKAH 2: Baru tarik data dari cloud
            const success = await syncFromCloud(false); // showToast = false

            if (success) {
              // LANGKAH 3: BARU tampilkan toast SETELAH data berhasil dimuat
              addToast('Data berhasil disinkronkan dari cloud', 'success');
            } else {
              // Jika sync gagal, tampilkan toast warning
              addToast('Gagal memuat data dari cloud. Silakan coba sync manual.', 'warning');
            }
          } catch (error: any) {
            console.error('❌ Gagal inisialisasi wedding:', error);

            
            // Tampilkan toast warning jika error
            addToast('Terjadi kesalahan saat memuat data. Data lokal tetap tersedia.', 'warning');
          } finally {
            // Set loading state ke false SETELAH semua proses selesai
            setIsSyncing(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // User logout

          setUser(null);
          setSession(null);

          // Reset semua data store
          resetWeddingStore();
          resetCollaborationStore();

          // Tampilkan toast notification
          addToast('Anda telah logout', 'success');
        } else if (event === 'TOKEN_REFRESHED') {
          // Token di-refresh, update session

          if (session) {
            setSession(session);
            setUser(session.user);
          }
        } else if (event === 'USER_UPDATED') {
          // User data di-update

          if (session) {
            setUser(session.user);
          }
        }
      }
    );

    // Cleanup function untuk unsubscribe saat component unmount
    return () => {

      subscription.unsubscribe();
    };
  }, [setUser, setSession, syncFromCloud, setIsSyncing, addToast, resetWeddingStore, resetCollaborationStore]);

  return <>{children}</>;
}
