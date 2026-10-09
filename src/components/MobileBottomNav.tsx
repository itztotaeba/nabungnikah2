'use client';

import { useState } from 'react';
import { Home, Receipt, Users, Building2, MoreHorizontal, PiggyBank, CalendarDays, Settings, X } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainMenus = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'budget', name: 'Anggaran', icon: Receipt },
  { id: 'guests', name: 'Tamu', icon: Users },
  { id: 'vendors', name: 'Vendor', icon: Building2 },
];

const moreMenus = [
  { id: 'savings', name: 'Tabungan', icon: PiggyBank },
  { id: 'timeline', name: 'Timeline', icon: CalendarDays },
  { id: 'settings', name: 'Pengaturan', icon: Settings },
];

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleMainClick = (id: string) => {
    onTabChange(id);
  };

  const handleMoreClick = (id: string) => {
    onTabChange(id);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D6E5DC] shadow-sm md:hidden z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {mainMenus.map((menu) => {
            const isActive = activeTab === menu.id;
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                onClick={() => handleMainClick(menu.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-[#2F6A43] bg-[#2F6A43]/10' 
                    : 'text-gray-500 hover:text-[#2F6A43]'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{menu.name}</span>
              </button>
            );
          })}
          
          {/* Tombol Lainnya */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-gray-500 hover:text-[#2F6A43] transition-all"
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet untuk menu Lainnya */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Sheet Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="p-4">
              {/* Handle indicator */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading">Menu Lainnya</h3>
              
              <div className="space-y-2">
                {moreMenus.map((menu) => {
                  const Icon = menu.icon;
                  const isActive = activeTab === menu.id;
                  return (
                    <button
                      key={menu.id}
                      onClick={() => handleMoreClick(menu.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-md transition-colors text-left ${
                        isActive 
                          ? 'bg-[#2F6A43]/10 text-[#2F6A43]' 
                          : 'hover:bg-[#F3EFE6] text-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-[#2F6A43]/20' : 'bg-[#2F6A43]/10'
                      }`}>
                        <Icon size={20} className={isActive ? 'text-[#2F6A43]' : 'text-[#2F6A43]'} />
                      </div>
                      <span className="font-medium">{menu.name}</span>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-full mt-4 py-3 text-gray-500 font-medium hover:bg-[#F3EFE6] rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
