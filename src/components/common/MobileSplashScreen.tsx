'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileSplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash screen on every open or refresh as requested
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 1900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#FDFBF7]"
          style={{
            backgroundImage: `url('/splash-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Subtle warm backdrop */}
          <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[0.5px] pointer-events-none" />

          {/* Bottom Loading ... Small Dots in clean alignment */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
