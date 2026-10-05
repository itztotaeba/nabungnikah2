import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';

/**
 * Hook untuk Supabase Realtime subscription
 * Mendengarkan perubahan data wedding_data secara real-time
 * 
 * @param weddingId - ID wedding event yang sedang diakses
 * @param enabled - Apakah realtime sync aktif (default: true)
 */
export function useRealtimeSync(weddingId: string | null, enabled: boolean = true) {
  const { syncFromCloud } = useSyncStore();
  const { addToast } = useToastStore();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Skip jika tidak ada weddingId atau realtime disabled
    if (!weddingId || !enabled || !supabase) {
      return;
    }

    console.log('🔌 Connecting to realtime channel for wedding:', weddingId);

    // Buat channel realtime
    const channel = supabase
      .channel(`wedding-room-${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen semua event: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'wedding_data',
          filter: `id=eq.${weddingId}`, // Hanya untuk wedding ini
        },
        async (payload) => {
          console.log('🔄 Realtime update received:', payload);

          // Validasi payload structure
          if (!payload || !payload.eventType) {
            console.warn('⚠️ Invalid realtime payload:', payload);
            return;
          }

          // Sync data dari cloud dengan error handling
          try {
            const success = await syncFromCloud(false); // showToast = false
            
            if (success) {
              // Tampilkan notifikasi hanya jika sync berhasil
              const eventType = payload.eventType;
              let message = 'Data diperbarui oleh pasangan Anda';

              if (eventType === 'UPDATE') {
                message = 'Data diperbarui oleh pasangan Anda';
              } else if (eventType === 'INSERT') {
                message = 'Data baru ditambahkan oleh pasangan Anda';
              } else if (eventType === 'DELETE') {
                message = 'Data dihapus oleh pasangan Anda';
              }

              addToast(message, 'info');
            } else {
              console.warn('⚠️ Realtime sync failed silently');
            }
          } catch (error) {
            console.error('❌ Error during realtime sync:', error);
            // Jangan tampilkan toast error untuk realtime sync
            // Biarkan user tetap menggunakan data lokal
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully connected to realtime channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
          addToast('Koneksi realtime terputus', 'error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ Realtime subscription timed out');
          addToast('Koneksi realtime timeout', 'warning');
        }
      });

    // Store channel reference
    channelRef.current = channel;

    // Cleanup function saat component unmount
    return () => {
      console.log('🔌 Disconnecting from realtime channel');
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [weddingId, enabled, syncFromCloud, addToast]);

  // Return status koneksi (bisa digunakan untuk UI indicator)
  return {
    isConnected: channelRef.current !== null,
  };
}
