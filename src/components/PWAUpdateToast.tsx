import { usePWAUpdate } from '../hooks/usePWAUpdate';
import { RefreshCw, X } from 'lucide-react';

/**
 * Komponen Toast untuk notifikasi update PWA
 * 
 * Features:
 * - Muncul saat update tersedia
 * - Tombol "Update Sekarang" untuk trigger update
 * - Tombol close untuk dismiss
 * - Position fixed di pojok kanan bawah
 * - Tidak menutupi Bottom Navigation Bar
 */
export default function PWAUpdateToast() {
  const { needRefresh, isUpdateAvailable, updatePWA } = usePWAUpdate();

  // Jangan tampilkan jika tidak ada update
  if (!needRefresh && !isUpdateAvailable) {
    return null;
  }

  const handleUpdate = async () => {
    await updatePWA();
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-[#D6E5DC] p-4 max-w-xs">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2F6A43] rounded-md flex items-center justify-center">
              <RefreshCw size={20} className="text-white animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Update Tersedia</h3>
              <p className="text-xs text-gray-500">Versi baru aplikasi</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
          Ada versi baru dari M&A Wedding Plan. Update sekarang untuk mendapatkan fitur terbaru!
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2F6A43] text-white rounded-md hover:shadow-sm transition-all text-sm font-medium"
          >
            <RefreshCw size={14} />
            <span>Update Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
