'use client';

import React, { useState, useEffect } from 'react';
import { MobileSplash } from './MobileSplash';
import { WebSplash } from './WebSplash';

export function AppInitializer() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      if (sessionStorage.getItem('bc_app_initialized')) {
        setHasCompleted(true);
        return;
      }
      sessionStorage.setItem('bc_app_initialized', 'true');
    } catch {
      // ignore
    }

    setIsVisible(true);

    const initTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1100);

    const cleanupTimer = setTimeout(() => {
      setHasCompleted(true);
    }, 1700);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  if (!mounted || hasCompleted || !isVisible) return null;

  return (
    <>
      {/* Mobile splash (< 768px): untouched mobile experience */}
      <MobileSplash isVisible={isVisible} />

      {/* Web & Tablet splash (>= 768px): clean minimal centered branding */}
      <WebSplash isVisible={isVisible} />
    </>
  );
}
