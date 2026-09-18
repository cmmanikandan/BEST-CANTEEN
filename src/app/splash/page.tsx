'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import Image from 'next/image';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if (user) {
        if (user.role === 'admin') router.replace('/admin/dashboard');
        else if (user.role === 'server') router.replace('/server/dashboard');
        else router.replace('/customer/home');
      } else {
        router.replace('/');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, user, isLoaded]);

  return (
    <div className="fixed inset-0 min-h-screen w-full overflow-hidden bg-[#FDFBF7]">
      {/* Mobile: Full-screen splash artwork */}
      <div className="md:hidden fixed inset-0">
        <Image
          src="/splash-bg.png"
          alt="Best Canteen Splash Screen"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none pointer-events-none"
          quality={95}
        />
      </div>

      {/* Desktop / Tablet: Centered Brand Logo */}
      <div className="hidden md:flex fixed inset-0 flex-col items-center justify-center gap-4 bg-[#FFF9F1]">
        <BrandLogo size="lg" />
      </div>

      {/* Bottom correct alignment: .... for loading (clean bouncing dots, no 'Loading...' text) */}
      <div className="absolute bottom-12 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.2s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.1s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
