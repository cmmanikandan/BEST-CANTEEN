'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Utensils } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-[#FF5722] text-2xl font-black">
            404
          </div>
          <h1 className="text-2xl font-black text-[#201611]">Page Not Found</h1>
          <p className="text-xs text-[#5C4E46] leading-relaxed">
            The page you requested may have moved or doesn&apos;t exist. Let&apos;s get you back to delicious food.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/customer/home"
            className="flex-1 py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            href="/customer/menu"
            className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            <span>View Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
