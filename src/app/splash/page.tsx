'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      if (user.role === 'admin') router.replace('/admin/dashboard');
      else if (user.role === 'server') router.replace('/server/dashboard');
      else router.replace('/customer/home');
    } else {
      router.replace('/');
    }
  }, [router, user, isLoaded]);

  return (
    <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFBF7]">
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
