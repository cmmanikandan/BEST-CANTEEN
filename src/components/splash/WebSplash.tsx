'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface WebSplashProps {
  isVisible: boolean;
}

export function WebSplash({ isVisible }: WebSplashProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-50 hidden md:flex flex-col items-center justify-center w-screen h-screen overflow-hidden select-none"
          style={{
            backgroundColor: '#FFF9F1',
            backgroundImage:
              'radial-gradient(circle at center, #FFFFFF 0%, #FFF9F1 55%, #F7F1E7 100%)',
          }}
        >
          {/* Subtle warm ambient ring */}
          <div className="absolute w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-amber-100/30 via-orange-100/20 to-transparent blur-3xl pointer-events-none" />

          {/* Centered Brand & Loader Group */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {/* 100ms: Official Best Canteen Icon (80-105px tablet, 90-120px desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-xs"
            >
              <Image
                src="/logo-icon.png"
                alt="Best Canteen"
                fill
                sizes="(min-width: 1024px) 128px, 112px"
                priority
                className="object-contain"
              />
            </motion.div>

            {/* 300ms: Brand Typography: BEST CANTEEN in single line (Black & Orange) */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
              className="mt-4 sm:mt-5 flex items-baseline font-brand tracking-tight leading-none"
            >
              <span className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#111111]">
                BEST
              </span>
              <span className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#FF5722] ml-2 sm:ml-2.5">
                CANTEEN
              </span>
            </motion.div>

            {/* 500ms: Smooth Animated Loading Dots (. -> .. -> ...) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
              className="mt-6 sm:mt-7 flex items-center justify-center gap-2 h-4"
              aria-label="Loading application"
            >
              <motion.span
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.85, 1.15, 0.85],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0,
                  ease: 'easeInOut',
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]"
              />
              <motion.span
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.85, 1.15, 0.85],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.25,
                  ease: 'easeInOut',
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]"
              />
              <motion.span
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.85, 1.15, 0.85],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.5,
                  ease: 'easeInOut',
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
