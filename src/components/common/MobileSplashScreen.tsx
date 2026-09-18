'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function MobileSplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* High-priority splash artwork */}
      <Image
        src="/splash-bg.png"
        alt="Best Canteen Splash Screen"
        fill
        priority
        sizes="100vw"
        className="object-cover select-none pointer-events-none"
        quality={90}
      />

      {/* Subtle warm backdrop */}
      <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Steady Loading Indicator with ... animation and Loading... text */}
      <div className="absolute bottom-10 inset-x-0 z-20 flex flex-col items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse [animation-delay:200ms]" />
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse [animation-delay:400ms]" />
          </div>
          <span className="text-xs font-bold text-[#201611] tracking-wide">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
