import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import AuthModal from './AuthModal';
import { Cloud, Download, LogIn, LogOut } from 'lucide-react';

export default function CloudSyncSection() {
  const { user, signOut } = useAuthStore();
  const { syncToCloud, syncFromCloud } = useSyncStore();
  const { addToast } = useToastStore();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    const success = await syncToCloud(true); // showToast = true untuk manual sync
    setIsSyncing(false);
    // Toast sudah di-handle di syncToCloud jika showToast = true
  };

  const handleSyncFromCloud = async () => {
    setIsSyncing(true);
    const success = await syncFromCloud(true);
    setIsSyncing(false);
    if (success) {
      addToast('Data berhasil dimuat dari cloud', 'success');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin logout?')) {
      return;
    }
    await signOut();
    // Toast "Logout berhasil" sudah di-handle di useAuthSync hook
  };

  // If not logged in, show login button
  if (!user) {
    return (
      <>
        <div className="bg-white rounded-lg p-6 border border-[#E8E0D4] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <Cloud size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-gray-800">Cloud Sync</h3>
              <p className="text-xs text-gray-400">Sinkronkan data Anda dengan cloud untuk akses di mana saja</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#2F6A43] from-blue-500 to-blue-600 text-white rounded-md hover:shadow-sm hover:shadow-blue-500/20 transition-all font-medium"
          >
            <LogIn size={18} />
            <span>Login untuk Cloud Sync</span>
          </button>

          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-xs text-blue-700">
              💡 <strong>Fitur Cloud Sync:</strong> Login untuk menyimpan data Anda di cloud dan akses dari perangkat lain. Data lokal tetap tersimpan di browser.
            </p>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </>
    );
  }

  // If logged in, show sync buttons
  return (
    <div className="bg-white rounded-lg p-6 border border-[#E8E0D4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
            <Cloud size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">Cloud Sync</h3>
            <p className="text-xs text-gray-400">Login sebagai: {user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSyncToCloud}
          disabled={isSyncing}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#2F6A43] from-blue-500 to-blue-600 text-white rounded-md hover:shadow-sm hover:shadow-blue-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Cloud size={18} />
          )}
          <span>Sync ke Cloud</span>
        </button>

        <button
          onClick={handleSyncFromCloud}
          disabled={isSyncing}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#2F6A43] from-purple-500 to-purple-600 text-white rounded-md hover:shadow-sm hover:shadow-purple-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span>Muat dari Cloud</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-xs text-blue-700">
          💡 <strong>Auto-sync aktif:</strong> Data akan otomatis tersinkron setiap kali ada perubahan. Gunakan tombol di atas untuk sync manual.
        </p>
      </div>
    </div>
  );
}
