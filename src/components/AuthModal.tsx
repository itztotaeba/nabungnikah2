import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useToastStore } from '../toastStore';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      addToast('Email dan password harus diisi', 'error');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      addToast('Password tidak cocok', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password minimal 6 karakter', 'error');
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          addToast(`Login gagal: ${error}`, 'error');
        } else {
          // Toast "Berhasil login" sudah di-handle di useAuthSync
          handleClose();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          addToast(`Registrasi gagal: ${error}`, 'error');
        } else {
          addToast('Registrasi berhasil! Silakan login.', 'success');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      addToast(`Terjadi kesalahan: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-scale-in">
        {/* Header dengan tombol close */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-gray-900">
              {isLogin ? 'Masuk' : 'Daftar'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Masuk untuk sinkronisasi data' : 'Buat akun untuk mulai'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#87A878] text-white rounded-md border-[#E5DED0] shadow-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Memproses...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  <span>Masuk</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Daftar</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-[#87A878] hover:text-[#6B8A5E] font-medium hover:underline"
                disabled={isLoading}
              >
                {isLogin ? 'Daftar sekarang' : 'Masuk'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
