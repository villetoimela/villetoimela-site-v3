'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import Loader from './Loader';

const LoaderContext = createContext(false);

export const useLoader = () => useContext(LoaderContext);

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Start Hero animations when user scrolls
  useEffect(() => {
    if (!showWelcome) return;

    const handleScroll = () => {
      if (window.scrollY > 50 && !isLoaded) {
        setIsLoaded(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showWelcome, isLoaded]);

  return (
    <LoaderContext.Provider value={isLoaded}>
      <Loader
        onWelcomeShow={() => setShowWelcome(true)}
      />
      {showWelcome && children}
    </LoaderContext.Provider>
  );
}
