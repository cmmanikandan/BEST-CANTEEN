'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  variant?: 'default' | 'white';
  className?: string;
}

export function BrandLogo({
  size = 'md',
  layout = 'horizontal',
  variant = 'default',
  className = '',
}: BrandLogoProps) {
  const isWhite = variant === 'white';
  const bestColor = isWhite ? 'text-white' : 'text-[#111111]';
  const canteenColor = 'text-[#FF5722]';

  // Dimension tokens based on size
  const dimensions = {
    sm: {
      iconSize: 'w-7 h-7 sm:w-8 sm:h-8',
      iconPixels: 32,
      fontSize: 'text-sm sm:text-base font-black tracking-tight leading-none',
      canteenMargin: 'ml-1 sm:ml-1.5',
      taglineText: 'text-[7px] font-semibold tracking-wider',
      gap: 'gap-2',
    },
    md: {
      iconSize: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
      iconPixels: 48,
      fontSize: 'text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-none',
      canteenMargin: 'ml-1.5 sm:ml-2',
      taglineText: 'text-[8px] sm:text-[9px] font-semibold tracking-wider',
      gap: 'gap-2.5 sm:gap-3',
    },
    lg: {
      iconSize: 'w-13 h-13 sm:w-14 sm:h-14',
      iconPixels: 56,
      fontSize: 'text-2xl sm:text-3xl font-black tracking-tight leading-none',
      canteenMargin: 'ml-2',
      taglineText: 'text-[10px] sm:text-xs font-semibold tracking-wider',
      gap: 'gap-3',
    },
    xl: {
      iconSize: 'w-16 h-16 sm:w-20 sm:h-20',
      iconPixels: 80,
      fontSize: 'text-3xl sm:text-4xl font-black tracking-tight leading-none',
      canteenMargin: 'ml-2.5 sm:ml-3',
      taglineText: 'text-xs sm:text-sm font-semibold tracking-wider',
      gap: 'gap-3.5',
    },
  }[size];

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${dimensions.gap} ${className}`}>
        <div className={`relative ${dimensions.iconSize} shrink-0 drop-shadow-sm`}>
          <Image
            src="/logo-icon.png"
            alt="Best Canteen"
            fill
            sizes={`${dimensions.iconPixels}px`}
            priority
            className="object-contain"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-brand tracking-tight leading-none">
            <span className={`${dimensions.fontSize} ${bestColor}`}>
              BEST
            </span>
            <span className={`${dimensions.fontSize} ${canteenColor} ${dimensions.canteenMargin}`}>
              CANTEEN
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${dimensions.gap} ${className}`}>
      {/* Official Emblem */}
      <div className={`relative ${dimensions.iconSize} shrink-0 drop-shadow-xs`}>
        <Image
          src="/logo-icon.png"
          alt="Best Canteen Logo"
          fill
          sizes={`${dimensions.iconPixels}px`}
          priority
          className="object-contain"
        />
      </div>

      {/* Single-Line Brand Typography (BEST in Black, CANTEEN in Orange) */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline font-brand tracking-tight leading-none">
          <span className={`${dimensions.fontSize} ${bestColor}`}>
            BEST
          </span>
          <span className={`${dimensions.fontSize} ${canteenColor} ${dimensions.canteenMargin}`}>
            CANTEEN
          </span>
        </div>
      </div>
    </div>
  );
}
