import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import { useAuthStore } from '../authStore';

/**
 * Hook untuk Supabase Realtime subscription
 * Mendengarkan perubahan data wedding_data secara real-time
 * 
 * FIX: Menggunakan timestamp comparison untuk filter own updates
 */
export function useRealtimeSync(weddingId: string | null, enabled: boolean = true) {
  const { syncFromCloud, lastSyncTimestamp } = useSyncStore();
  const { addToast } = useToastStore();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!weddingId || !enabled || !supabase) {
      return;
    }

    console.log('🔌 Connecting to realtime channel for wedding:', weddingId);

    const channel = supabase
      .channel(`wedding-room-${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wedding_data',
          filter: `id=eq.${weddingId}`,
        },
        async (payload) => {
          console.log('🔄 Realtime update received');

          if (!payload || !payload.new) {
            console.warn('⚠️ Invalid realtime payload');
            return;
          }

          const payloadNew = payload.new as any;
          const remoteUpdatedAt = payloadNew?.updated_at;

          // FIX: Filter berdasarkan timestamp
          // Jika remote updated_at sama dengan lastSyncTimestamp kita, ini dari diri sendiri
          if (remoteUpdatedAt && remoteUpdatedAt === lastSyncTimestamp) {
            console.log('⏭️ Skipping own update (same timestamp)');
            return;
          }

          // FIX: Threshold check - jika timestamp sangat dekat (dalam 3 detik), kemungkinan dari diri sendiri
          if (remoteUpdatedAt && lastSyncTimestamp) {
            const remoteTime = new Date(remoteUpdatedAt).getTime();
            const localTime = new Date(lastSyncTimestamp).getTime();
            const diff = Math.abs(remoteTime - localTime);
            
            if (diff < 3000) {
              console.log(`⏭️ Skipping recent update (${diff}ms threshold)`);
              return;
            }
          }

          // Process update dari user lain
          try {
            const success = await syncFromCloud(false);
            
            if (success) {
              addToast('Data diperbarui oleh pasangan Anda', 'info');
            }
          } catch (error) {
            console.error('❌ Error during realtime sync:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Disconnecting from realtime channel');
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [weddingId, enabled, syncFromCloud, addToast, lastSyncTimestamp]);

  return {
    isConnected: channelRef.current !== null,
  };
}
