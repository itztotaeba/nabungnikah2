import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook untuk handle back navigation di PWA mobile
 * 
 * Logic:
 * - Jika user di halaman dalam (bukan home) → back button navigate ke homepage
 * - Jika user sudah di homepage → tampilkan konfirmasi exit
 * - Mencegah PWA langsung tertutup saat swipe back
 */
export function useBackNavigation(
  currentTab: string,
  onNavigateToHome: () => void
) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAtHome, setIsAtHome] = useState(true);

  // Track apakah user sudah di homepage
  useEffect(() => {
    setIsAtHome(currentTab === 'dashboard');
  }, [currentTab]);

  // Handle back button / swipe back
  const handleBackNavigation = useCallback(() => {
    if (isAtHome) {
      // Sudah di homepage → tampilkan konfirmasi exit
      setShowExitConfirm(true);
    } else {
      // Masih di halaman dalam → navigate ke homepage
      onNavigateToHome();
    }
  }, [isAtHome, onNavigateToHome]);

  // Handle confirm exit
  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    // Close PWA / minimize app
    // Di browser, kita bisa gunakan window.close() tapi biasanya tidak bekerja
    // Alternatif: redirect ke blank page atau minimize
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Jika tidak ada history, coba close window
      window.close();
    }
  }, []);

  // Handle cancel exit
  const handleCancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Listen untuk popstate event (back button browser)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back navigation
      event.preventDefault();
      
      // Handle custom back navigation
      handleBackNavigation();
      
      // Push state lagi untuk mencegah browser keluar
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);

    // Push initial state
    window.history.pushState({ page: 'home' }, '', window.location.pathname);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackNavigation]);

  // Handle Android back button (jika ada)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Android back button biasanya keyCode 27 atau browser back
      if (event.key === 'Escape' || event.keyCode === 27) {
        event.preventDefault();
        handleBackNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBackNavigation]);

  return {
    showExitConfirm,
    handleConfirmExit,
    handleCancelExit,
    isAtHome,
  };
}
