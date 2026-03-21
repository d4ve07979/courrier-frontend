import { useState, useEffect } from 'react';

export const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);

  const hideSplash = () => {
    setShowSplash(false);
  };

  // Auto-hide splash screen après 5 secondes maximum (sécurité)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return {
    showSplash,
    hideSplash
  };
};