'use client';

import React from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { Clock, Sparkles } from 'lucide-react';

export function ActiveMealBanner() {
  const { activeMealInfo } = useCanteen();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF5ED] via-[#FFF9F3] to-[#FFF5ED] border border-orange-200/80 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-orange-100 flex items-center justify-center text-2xl shrink-0">
            {activeMealInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                Current Meal
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#201611] tracking-tight mt-0.5">
              {activeMealInfo.name} Menu Live
            </h2>
            <p className="text-xs text-[#5C4E46] flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>{activeMealInfo.statusText}</span>
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-orange-100 text-xs font-semibold text-[#FF5722] shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fresh & Fast Counter Pickup</span>
        </div>
      </div>
    </div>
  );
}
