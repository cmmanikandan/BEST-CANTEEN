'use client';

import React from 'react';
import { TopNavigation } from '@/components/customer/TopNavigation';
import { BottomNavigation } from '@/components/customer/BottomNavigation';
import { FloatingCartBar } from '@/components/customer/FloatingCartBar';
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <TopNavigation />
      <div className="flex-1 pb-24 md:pb-12">
        {children}
      </div>
      <FloatingCartBar />
      <BottomNavigation />
    </div>
  );
}
