'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Search, ShoppingBag, User } from 'lucide-react';
import { useCanteen } from '@/context/CanteenContext';

export function BottomNavigation() {
  const pathname = usePathname();
  const { orders } = useCanteen();

  // Active orders count for badge
  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus === 'READY' || o.orderStatus === 'PAID'
  ).length;

  const items = [
    { href: '/customer/home', label: 'Home', icon: Home },
    { href: '/customer/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/customer/search', label: 'Search', icon: Search },
    { href: '/customer/orders', label: 'My Tokens', icon: ShoppingBag, badge: activeOrdersCount },
    { href: '/customer/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-transform active:scale-95 ${
                isActive ? 'text-[#FF5722]' : 'text-[#8C7E76] hover:text-[#201611]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FF5722] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-bold text-[#FF5722]' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
