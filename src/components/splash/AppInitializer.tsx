'use client';

import React, { useState, useEffect } from 'react';
import { MobileSplash } from './MobileSplash';
import { WebSplash } from './WebSplash';

export function AppInitializer() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check initial viewport size
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Initialize application state (auth, storage, config)
    // Ensures splash displays smoothly through entrance sequence then gracefully fades out
    const initTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1100);

    // Remove from DOM after exit animation completes (500ms exit transition)
    const cleanupTimer = setTimeout(() => {
      setHasCompleted(true);
    }, 1700);

    return () => {
      window.removeEventListener('resize', checkViewport);
      clearTimeout(initTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  if (hasCompleted) return null;

  return (
    <>
      {/* Mobile splash (< 768px): untouched mobile experience */}
      <MobileSplash isVisible={isVisible} />

      {/* Web & Tablet splash (>= 768px): clean minimal centered branding */}
      <WebSplash isVisible={isVisible} />
    </>
  );
}
