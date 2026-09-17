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
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-5">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-[#201611] tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-[#5C4E46] leading-relaxed">
            We encountered a temporary hiccup. Please try refreshing or return to the main canteen home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
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
