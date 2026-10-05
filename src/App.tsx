import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, PiggyBank, Users, Settings as SettingsIcon, Building2, ListTodo, Menu, X, LogIn, LogOut, type LucideIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BudgetManager from './components/BudgetManager';
import SavingsTracker from './components/SavingsTracker';
import GuestManager from './components/GuestManager';
import VendorManager from './components/VendorManager';
import TimelineManager from './components/TimelineManager';
import SettingsPage from './components/Settings';
import ToastContainer from './components/ToastContainer';
import LiveSyncIndicator from './components/LiveSyncIndicator';
import LoadingOverlay from './components/LoadingOverlay';
import SupabaseSyncProvider from './components/SupabaseSyncProvider';
import AuthModal from './components/AuthModal';
import { useAuthStore } from './authStore';
import { useCollaborationStore } from './collaborationStore';

// Logo foto Mahes & Aira
const PHOTO_URL = "https://is3.cloudhost.id/totaeba/mahesaira.jpg";

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
  
  // Initialize auth store saat app load
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

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

  return (
    <SupabaseSyncProvider>
    <div className="min-h-screen bg-[#FAF8F4] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-[#D6E5DC] z-40">
        <div className="px-6 py-6 border-b border-[#D6E5DC]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <img 
                src={PHOTO_URL} 
                alt="Logo Mahes & Aira" 
                className="w-full h-full rounded-full object-cover border-2 border-[#2F6A43] shadow-sm"
              />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-800">Mahes & Aira</h1>
              <p className="text-xs text-gray-400">Wedding Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2F6A43]/10 text-[#1E4A2E] shadow-sm'
                    : 'text-gray-600 hover:bg-[#F3EFE6] hover:text-gray-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#2F6A43]' : 'text-gray-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2F6A43]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="px-6 py-5 border-b border-[#D6E5DC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <img 
                    src={PHOTO_URL} 
                    alt="Logo Mahes & Aira" 
                    className="w-full h-full rounded-full object-cover border-2 border-[#2F6A43] shadow-sm"
                  />
                </div>
                <h1 className="font-heading text-lg font-bold text-gray-800">Mahes&Aira</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <nav className="px-4 py-4 space-y-1">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2F6A43]/10 text-[#1E4A2E]'
                        : 'text-gray-600 hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-[#2F6A43]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#D6E5DC]">
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
                    src={PHOTO_URL} 
                    alt="Logo Mahes & Aira" 
                    className="w-full h-full rounded-full object-cover border-2 border-[#2F6A43] shadow-sm"
                  />
                </div>
                <h1 className="font-heading text-lg font-bold text-gray-800">Mahes&Aira</h1>
              </div>
              <h2 className="hidden lg:block font-heading text-lg font-semibold text-gray-700">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <LiveSyncIndicator />
              
              {/* Auth Button / User Info */}
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-[#2F6A43] hover:bg-[#1E4A2E] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm text-sm"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Login / Daftar</span>
                  <span className="sm:hidden">Login</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 bg-[#F3EFE6] px-3 py-1.5 rounded-lg">
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#2F6A43]">
                      <img 
                        src={PHOTO_URL} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-[#1E4A2E]">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-all text-sm"
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

        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D6E5DC] shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[56px] transition-all ${
                  isActive
                    ? 'text-[#2F6A43]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#2F6A43]/10' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#1E4A2E]' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <LoadingOverlay />
      <ToastContainer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
    </SupabaseSyncProvider>
  );
}
