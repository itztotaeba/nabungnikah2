import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import { useAuthStore } from '../authStore';

/**
 * Hook untuk Supabase Realtime subscription
 * Mendengarkan perubahan data wedding_data secara real-time
 * 
 * FIX: Menggunakan updated_at timestamp untuk filter self-update
 * bukan user_id yang bisa berubah-ubah
 */
export function useRealtimeSync(weddingId: string | null, enabled: boolean = true) {
  const { syncFromCloud, lastSyncTimestamp } = useSyncStore();
  const { addToast } = useToastStore();
  const channelRef = useRef<any>(null);
  const lastProcessedTimestamp = useRef<string | null>(null);

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
          event: 'UPDATE', // Hanya listen UPDATE, bukan INSERT/DELETE
          schema: 'public',
          table: 'wedding_data',
          filter: `id=eq.${weddingId}`,
        },
        async (payload) => {
          console.log('🔄 Realtime update received:', payload);

          // Validasi payload structure
          if (!payload || !payload.new) {
            console.warn('⚠️ Invalid realtime payload:', payload);
            return;
          }

          const payloadNew = payload.new as any;
          const remoteUpdatedAt = payloadNew?.updated_at;

          // FIX 1: Gunakan updated_at untuk filter self-update
          // Jika updated_at sama dengan lastSyncTimestamp kita, ini dari diri sendiri
          if (remoteUpdatedAt && remoteUpdatedAt === lastProcessedTimestamp.current) {
            console.log('⏭️ Skipping own update (same timestamp)');
            return;
          }

          // FIX 2: Cek apakah updated_at sangat dekat dengan lastSync (dalam 2 detik)
          // Ini mencegah echo dari auto-sync kita sendiri
          if (remoteUpdatedAt && lastSyncTimestamp) {
            const remoteTime = new Date(remoteUpdatedAt).getTime();
            const localTime = new Date(lastSyncTimestamp).getTime();
            const diff = Math.abs(remoteTime - localTime);
            
            if (diff < 2000) { // Dalam 2 detik = kemungkinan dari diri sendiri
              console.log('⏭️ Skipping recent update (within 2s threshold)');
              return;
            }
          }

          // Simpan timestamp untuk filter berikutnya
          lastProcessedTimestamp.current = remoteUpdatedAt;

          // FIX 3: Sync dari cloud dengan REPLACE, bukan MERGE
          try {
            const success = await syncFromCloud(false, true); // showToast = false, isRealtime = true
            
            if (success) {
              // Tampilkan notifikasi hanya jika sync berhasil
              addToast('Data diperbarui oleh pasangan Anda', 'info');
            } else {
              console.warn('⚠️ Realtime sync failed silently');
            }
          } catch (error) {
            console.error('❌ Error during realtime sync:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully connected to realtime channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ Realtime subscription timed out');
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
  }, [weddingId, enabled, syncFromCloud, addToast, lastSyncTimestamp]);

  // Return status koneksi
  return {
    isConnected: channelRef.current !== null,
  };
}
