import { useEffect, useState } from 'react';

interface UsePWAUpdateReturn {
  needRefresh: boolean;
  isUpdateAvailable: boolean;
  updatePWA: () => Promise<void>;
}

/**
 * Hook untuk mendeteksi dan mengelola update PWA
 * 
 * Features:
 * - Detect saat Service Worker baru tersedia
 * - Listen untuk message dari Service Worker
 * - Trigger update saat user confirm
 * - Auto-check versi secara berkala
 */
export function usePWAUpdate(): UsePWAUpdateReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check apakah browser support Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      return;
    }

    // Listen untuk update tersedia
    const handleUpdateFound = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        console.log('[PWA] Update available');
        setWaitingWorker(registration.waiting);
        setIsUpdateAvailable(true);
      }
    };

    // Listen untuk message dari Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[PWA] Service Worker updated to version:', event.data.version);
        setNeedRefresh(true);
      }
    };

    // Register listener untuk update
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] New Service Worker activated');
      // Reload halaman untuk menggunakan versi baru
      window.location.reload();
    });

    // Listen untuk message dari Service Worker
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Check registration saat ini
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        // Listen untuk update found
        registration.addEventListener('updatefound', handleUpdateFound);
        
        // Check jika sudah ada waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }

        // Check update secara manual
        registration.update().catch((err) => {
          console.error('[PWA] Update check failed:', err);
        });
      }
    });

    // Periodic check untuk update (setiap 30 menit)
    const intervalId = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().catch((err) => {
            console.error('[PWA] Periodic update check failed:', err);
          });
        }
      });
    }, 30 * 60 * 1000); // 30 menit

    // Cleanup
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
    };
  }, []);

  // Function untuk trigger update
  const updatePWA = async () => {
    if (!waitingWorker) {
      console.log('[PWA] No waiting worker found');
      return;
    }

    console.log('[PWA] Triggering update...');
    
    // Kirim message ke Service Worker untuk skip waiting
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Set flag untuk reload
    setNeedRefresh(true);
    
    // Tunggu sebentar lalu reload
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return {
    needRefresh,
    isUpdateAvailable,
    updatePWA
  };
}
