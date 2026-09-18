'use client';

import React from 'react';
import Image from 'next/image';

interface MobileSplashProps {
  isVisible: boolean;
}

export function MobileSplash({ isVisible }: MobileSplashProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#FDFBF7] md:hidden">
      {/* High-priority splash artwork (zero hydration flicker, preloaded) */}
      <Image
        src="/splash-bg.png"
        alt="Best Canteen Splash Screen"
        fill
        priority
        sizes="100vw"
        className="object-cover select-none pointer-events-none"
        quality={95}
      />

      {/* Bottom correct alignment: .... for loading without 'Loading...' text */}
      <div className="absolute bottom-12 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.2s]" />
          <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.1s]" />
          <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
