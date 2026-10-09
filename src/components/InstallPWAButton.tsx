'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setIsInstalled(true);
      setShowButton(false);
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowButton(false);
  };

  // Don't show button if already installed or no prompt available
  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-[#D6E5DC] p-4 max-w-xs">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2F6A43] rounded-md flex items-center justify-center">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Install Aplikasi</h3>
              <p className="text-xs text-gray-500">M&A Wedding Plan</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
          Install aplikasi di perangkat Anda untuk akses cepat tanpa browser!
        </p>
        
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2F6A43] text-white rounded-md hover:shadow-sm transition-all text-sm font-medium"
        >
          <Download size={16} />
          <span>Install Sekarang</span>
        </button>
      </div>
    </div>
  );
}
