import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useToastStore } from '../toastStore';
import { Mail, Lock, LogIn, UserPlus, Heart } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Debug: Log Supabase configuration
  console.log('🔍 AuthPage - Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('🔍 AuthPage - Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

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
        // Login
        console.log('🔐 Attempting login for:', email);
        const { error } = await signIn(email, password);
        if (error) {
          console.error('❌ Login error:', error);
          addToast(`Login gagal: ${error}`, 'error');
        } else {
          console.log('✅ Login successful');
          addToast('Login berhasil!', 'success');
        }
      } else {
        // Register
        console.log('📝 Attempting signup for:', email);
        const { error } = await signUp(email, password);
        if (error) {
          console.error('❌ Signup error:', error);
          addToast(`Registrasi gagal: ${error}`, 'error');
        } else {
          console.log('✅ Signup successful');
          addToast('Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error('💥 Unexpected error:', err);
      addToast(`Terjadi kesalahan: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F5F0E8] to-[#E8E0D4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D4A843] to-[#2F6A43] rounded-2xl mb-4 shadow-lg">
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-800 mb-2">
            Mahes&Aira
          </h1>
          <p className="text-sm text-gray-500">
            Wedding Plan
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E8E0D4]">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Masuk' : 'Daftar'}
          </h2>

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
                  className="w-full pl-10 pr-4 py-3 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                  required
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
                  className="w-full pl-10 pr-4 py-3 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                  required
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
                    className="w-full pl-10 pr-4 py-3 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg hover:shadow-[#87A878]/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Daftar
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
