import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useCollaborationStore } from '../collaborationStore';
import { Wifi, WifiOff, Circle } from 'lucide-react';

export default function LiveSyncIndicator() {
  const { currentWeddingId } = useCollaborationStore();
  const { isConnected } = useRealtimeSync(currentWeddingId);

  // Jangan tampilkan jika tidak ada wedding
  if (!currentWeddingId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
      isConnected ? 'bg-emerald-50' : 'bg-gray-100'
    }`}>
      {isConnected ? (
        <>
          <div className="relative">
            <Wifi size={14} className="text-emerald-600" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-medium text-emerald-700">
            Live Sync
          </span>
        </>
      ) : (
        <>
          <WifiOff size={14} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            Offline
          </span>
        </>
      )}
    </div>
  );
}
