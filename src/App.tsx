import { useState, useEffect, lazy, Suspense } from 'react';
import { LayoutDashboard, Receipt, PiggyBank, Users, Settings as SettingsIcon, Building2, ListTodo, Menu, X, LogIn, LogOut, type LucideIcon } from 'lucide-react';
// Lazy-load tab halaman agar bundle awal lebih kecil — hanya tab aktif yang di-download saat dibutuhkan
const Dashboard = lazy(() => import('./components/Dashboard'));
const BudgetManager = lazy(() => import('./components/BudgetManager'));
const SavingsTracker = lazy(() => import('./components/SavingsTracker'));
const GuestManager = lazy(() => import('./components/GuestManager'));
const VendorManager = lazy(() => import('./components/VendorManager'));
const TimelineManager = lazy(() => import('./components/TimelineManager'));
const SettingsPage = lazy(() => import('./components/Settings'));
import ToastContainer from './components/ToastContainer';
import LiveSyncIndicator from './components/LiveSyncIndicator';
import LoadingOverlay from './components/LoadingOverlay';
import SupabaseSyncProvider from './components/SupabaseSyncProvider';
import AuthModal from './components/AuthModal';
import MobileBottomNav from './components/MobileBottomNav';
import FooterWatermark from './components/FooterWatermark';
import InstallPWAButton from './components/InstallPWAButton';
import PWAUpdateToast from './components/PWAUpdateToast';
import ExitConfirmModal from './components/ExitConfirmModal';
import { useAuthStore } from './authStore';
import { useCollaborationStore } from './collaborationStore';
import { useBackNavigation } from './hooks/useBackNavigation';

// Logo foto Mahes & Aira (untuk branding, bukan avatar user)
const LOGO_URL = "https://is3.cloudhost.id/totaeba/mahesaira.jpg";

type Tab = 'dashboard' | 'budget' | 'savings' | 'guests' | 'vendors' | 'timeline' | 'settings';

interface NavItem {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budget', label: 'Anggaran', icon: Receipt },
  { id: 'savings', label: 'Tabungan', icon: PiggyBank },
  { id: 'guests', label: 'Tamu', icon: Users },
  { id: 'vendors', label: 'Vendor', icon: Building2 },
  { id: 'timeline', label: 'Timeline', icon: ListTodo },
  { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // Initialize auth store saat app load
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const fetchUserProfile = useCollaborationStore((state) => state.fetchUserProfile);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch user avatar saat user login
  useEffect(() => {
    const loadAvatar = async () => {
      if (user) {
        const profile = await fetchUserProfile();
        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        } else {
          setUserAvatar(null);
        }
      } else {
        setUserAvatar(null);
      }
    };
    loadAvatar();
  }, [user, fetchUserProfile]);

  // Custom back navigation handler untuk PWA mobile
  const {
    showExitConfirm,
    handleConfirmExit,
    handleCancelExit,
  } = useBackNavigation(activeTab, () => setActiveTab('dashboard'));

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      await signOut();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'budget': return <BudgetManager />;
      case 'savings': return <SavingsTracker />;
      case 'guests': return <GuestManager />;
      case 'vendors': return <VendorManager />;
      case 'timeline': return <TimelineManager />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  // Bungkus dengan Suspense agar halaman lazy bisa di-resolve saat chunk dimuat
  const content = (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/3 rounded-md bg-[#E8F0EA]" />
          <div className="h-40 rounded-lg bg-[#EEF4EF]" />
          <div className="h-40 rounded-lg bg-[#EEF4EF]" />
        </div>
      }
    >
      {renderContent()}
    </Suspense>
  );

  return (
    <SupabaseSyncProvider>
    <div className="lg-root lg-shell min-h-screen flex">
      {/* Desktop Sidebar — floating liquid glass panel, melayang dari tepi layar */}
      <aside className="lg-glass hidden lg:flex flex-col fixed left-4 top-4 bottom-4 w-60 rounded-[2rem] border z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO_URL}
              alt="Logo Mahes & Aira"
              className="w-9 h-9 rounded-xl object-cover border border-white/60 shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="font-heading text-sm font-semibold text-gray-800 truncate">Mahes & Aira</h1>
              <p className="text-xs text-gray-400 truncate">Wedding Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-2 pt-2 pb-1 text-[11px] font-medium text-gray-400">Ruang Kerja</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-[#2F6A43]/10 text-[#1E4A2E] font-medium'
                    : 'text-gray-600 hover:bg-[#F3EFE6] hover:text-gray-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#2F6A43]' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-[#E8E0D4]">
          <p className="text-[11px] text-gray-400">Pribadi — jangan dibagikan</p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="lg-backdrop absolute inset-0"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg-glass lg-drawer absolute left-0 top-0 h-full w-64 border-r flex flex-col">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={LOGO_URL}
                  alt="Logo Mahes & Aira"
                  className="w-8 h-8 rounded-md object-cover border border-[#E8E0D4]"
                />
                <h1 className="font-heading text-sm font-semibold text-gray-800">Mahes & Aira</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-[#F3EFE6] rounded-md text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-[#2F6A43]/10 text-[#1E4A2E] font-medium'
                        : 'text-gray-600 hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#2F6A43]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-[17.5rem] lg:mr-4 flex flex-col min-h-screen">
        <header className="lg-header sticky top-0 lg:top-4 z-30 border-b lg:border lg:rounded-[1.75rem] mx-2 sm:mx-4 lg:mx-0">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-[#F3EFE6] rounded-lg"
              >
                <Menu size={22} className="text-gray-600" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <img 
                    src={LOGO_URL} 
                    alt="Logo Mahes & Aira" 
                    className="w-full h-full rounded-full object-cover border-2 border-[#2F6A43] shadow-sm"
                  />
                </div>
                <h1 className="font-heading text-lg font-bold text-gray-800">Mahes&Aira</h1>
              </div>
              <h2 className="hidden lg:block font-heading text-base font-semibold text-gray-800">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <LiveSyncIndicator />
              
              {/* Auth Button / User Info */}
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-[#2F6A43] hover:bg-[#1E4A2E] text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Login / Daftar</span>
                  <span className="sm:hidden">Login</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 bg-[#F3EFE6] px-3 py-1.5 rounded-lg">
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#2F6A43]">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt="User Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#2F6A43] text-white text-xs font-bold">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#1E4A2E]">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          {/* Desktop: konten melebar mengisi ruang (white space kanan-kiri dipangkas),
              batas maksimum dilebarkan agar 6 kartu stats muat satu baris rapi */}
          <div className="max-w-5xl mx-auto lg:max-w-[min(100%,120rem)] w-full">
            {content}
          </div>
        </main>

        {/* Footer Watermark "Made With Love" */}
        <FooterWatermark />
      </div>

      {/* Mobile Bottom Navigation - 4 menu utama + tombol Lainnya */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as Tab)} 
      />
      
      {/* Safe area untuk iOS */}
      <div className="h-[env(safe-area-inset-bottom)] lg:hidden" />

      <LoadingOverlay />
      <ToastContainer />
      
      {/* PWA Install Button */}
      <InstallPWAButton />
      
      {/* PWA Update Toast */}
      <PWAUpdateToast />
      
      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
    </SupabaseSyncProvider>
  );
}
