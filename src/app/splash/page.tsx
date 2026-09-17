'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/customer/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#FDFBF7]"
      style={{
        backgroundImage: `url('/splash-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Very subtle warm overlay for readability */}
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
    </div>
  );
}
