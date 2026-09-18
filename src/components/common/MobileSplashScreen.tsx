'use client';

import React, { useState, useEffect } from 'react';

export function MobileSplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce" />
        </div>
        <span className="text-xs font-bold text-[#8C7E76] uppercase tracking-widest">
          Loading...
        </span>
      </div>
    </div>
  );
}
