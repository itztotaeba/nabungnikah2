import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, PiggyBank, Users, Settings as SettingsIcon, Building2, ListTodo, Menu, X, type LucideIcon } from 'lucide-react';
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
import { useAuthStore } from './authStore';
import { useCollaborationStore } from './collaborationStore';

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
  
  // Initialize auth store saat app load
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const initializeWedding = useCollaborationStore((state) => state.initializeWedding);
  const currentWeddingId = useCollaborationStore((state) => state.currentWeddingId);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize wedding setelah user login
  useEffect(() => {
    if (user && !currentWeddingId) {
      initializeWedding();
    }
  }, [user, currentWeddingId, initializeWedding]);

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
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* ============================================
          DESKTOP SIDEBAR
          ============================================ */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E0D4] z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B76E79] to-[#87A878] rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💒</span>
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-800">WeddingPlan</h1>
              <p className="text-xs text-gray-400">Perencana Pernikahan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
                    ? 'bg-[#87A878]/10 text-[#6B8A5E] shadow-sm'
                    : 'text-gray-600 hover:bg-[#F5F0E8] hover:text-gray-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#87A878]' : 'text-gray-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#87A878]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E0D4]">
          <p className="text-xs text-gray-400 text-center">
            © 2024 WeddingPlan
          </p>
        </div>
      </aside>

      {/* ============================================
          MOBILE SIDEBAR OVERLAY
          ============================================ */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E8E0D4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#B76E79] to-[#87A878] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">💒</span>
                </div>
                <h1 className="font-heading text-lg font-bold text-gray-800">WeddingPlan</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
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
                        ? 'bg-[#87A878]/10 text-[#6B8A5E]'
                        : 'text-gray-600 hover:bg-[#F5F0E8]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-[#87A878]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E8E0D4]">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Left: Menu button (mobile) + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-[#F5F0E8] rounded-lg"
              >
                <Menu size={22} className="text-gray-600" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#B76E79] to-[#87A878] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">💒</span>
                </div>
                <h1 className="font-heading text-lg font-bold text-gray-800">WeddingPlan</h1>
              </div>
              <h2 className="hidden lg:block font-heading text-lg font-semibold text-gray-700">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h2>
            </div>

            {/* Right: Live Sync Indicator + Current page indicator */}
            <div className="flex items-center gap-3">
              <LiveSyncIndicator />
              <span className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ============================================
          MOBILE BOTTOM NAVIGATION
          ============================================ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E0D4] shadow-lg">
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
                    ? 'text-[#87A878]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#87A878]/10' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#6B8A5E]' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Loading Overlay */}
      <LoadingOverlay />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
    </SupabaseSyncProvider>
  );
}
