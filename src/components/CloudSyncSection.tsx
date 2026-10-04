import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';
import { Cloud, CloudDownload, LogIn, LogOut, UserPlus } from 'lucide-react';

export default function CloudSyncSection() {
  const { user, signIn, signUp, signOut, isLoading: authLoading } = useAuthStore();
  const { syncToCloud, syncFromCloud } = useSyncStore();
  const { addToast } = useToastStore();
  
  // Debug log untuk memastikan state ter-update
  console.log('🔍 CloudSyncSection - User state:', user ? user.email : 'null');
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('Email dan password harus diisi', 'error');
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      addToast('Password tidak cocok', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password minimal 6 karakter', 'error');
      return;
    }

    try {
      if (isLoginMode) {
        const { error } = await signIn(email, password);
        if (error) {
          addToast(`Login gagal: ${error}`, 'error');
        } else {
          // Toast "Login berhasil" sudah ditampilkan di useAuthSync hook
          // saat event SIGNED_IN terjadi
          setShowLoginModal(false);
          resetForm();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          addToast(`Registrasi gagal: ${error}`, 'error');
        } else {
          addToast('Registrasi berhasil! Silakan login.', 'success');
          setIsLoginMode(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      addToast(`Terjadi kesalahan: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    const success = await syncToCloud();
    setIsSyncing(false);
    if (success) {
      addToast('Data berhasil disinkronkan ke cloud', 'success');
    }
  };

  const handleSyncFromCloud = async () => {
    setIsSyncing(true);
    const success = await syncFromCloud();
    setIsSyncing(false);
    if (success) {
      addToast('Data berhasil dimuat dari cloud', 'success');
    }
  };

  const handleLogout = async () => {
    await signOut();
    addToast('Logout berhasil', 'success');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // If not logged in, show login button
  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Cloud size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">Cloud Sync</h3>
            <p className="text-xs text-gray-400">Sinkronkan data Anda dengan cloud untuk akses di mana saja</p>
          </div>
        </div>

        <button
          onClick={() => setShowLoginModal(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
        >
          <LogIn size={18} />
          <span>Login untuk Cloud Sync</span>
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 <strong>Fitur Cloud Sync:</strong> Login untuk menyimpan data Anda di cloud dan akses dari perangkat lain. Data lokal tetap tersimpan di browser.
          </p>
        </div>

        {/* Login/Register Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-heading font-semibold text-gray-900">
                  {isLoginMode ? 'Login' : 'Daftar'}
                </h2>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleAuth} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                    required
                  />
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : isLoginMode ? (
                    <>
                      <LogIn size={18} />
                      <span>Login</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Daftar</span>
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-600">
                  {isLoginMode ? 'Belum punya akun?' : 'Sudah punya akun?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      resetForm();
                    }}
                    className="ml-2 text-blue-600 hover:underline font-medium"
                  >
                    {isLoginMode ? 'Daftar sekarang' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If logged in, show sync buttons
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
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
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloudDownload size={18} />
          <span>Muat dari Cloud</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700">
          💡 <strong>Auto-sync aktif:</strong> Data akan otomatis tersinkron setiap kali ada perubahan. Gunakan tombol di atas untuk sync manual.
        </p>
      </div>
    </div>
  );
}
