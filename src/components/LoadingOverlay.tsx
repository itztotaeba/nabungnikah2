import { useSyncStore } from '../syncStore';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
  const { isSyncing } = useSyncStore();

  if (!isSyncing) return null;

  return (
    <div className="fixed inset-0 bg-white/80 z-40 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-md p-8 border border-[#E5DED0] shadow-sm border border-[#E8E0D4] max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-[#87A878]" />
          <div className="text-center">
            <h3 className="font-heading text-lg font-semibold text-gray-800 mb-1">
              Memuat Data
            </h3>
            <p className="text-sm text-gray-500">
              Sedang menyinkronkan data dari cloud...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
