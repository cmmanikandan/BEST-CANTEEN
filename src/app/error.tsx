'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Best Canteen Client Application Error:', error);
    // Attempt graceful auto-recovery once on transient hydration/render errors
    try {
      const lastReset = sessionStorage.getItem('bc_err_last_reset');
      const now = Date.now();
      if (!lastReset || now - Number(lastReset) > 8000) {
        sessionStorage.setItem('bc_err_last_reset', String(now));
        setTimeout(() => {
          reset();
        }, 120);
      }
    } catch {}
  }, [error, reset]);

  const handleFullReload = () => {
    try {
      sessionStorage.removeItem('bc_err_last_reset');
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-5">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-[#201611] tracking-tight">
            Reloading Canteen...
          </h2>
          <p className="text-xs text-[#5C4E46] leading-relaxed">
            Restoring your canteen view and latest live menu items.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleFullReload}
            className="w-full sm:flex-1 py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
          <button
            onClick={() => {
              window.location.href = '/customer/home';
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-[#201611] font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
