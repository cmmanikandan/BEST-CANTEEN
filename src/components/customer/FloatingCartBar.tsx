'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCartBar() {
  const pathname = usePathname();
  const { totalItems, total } = useCart();

  // Don't show floating cart if already on cart, checkout, or payment page
  const isCartFlow =
    pathname.includes('/customer/cart') ||
    pathname.includes('/customer/checkout') ||
    pathname.includes('/customer/payment') ||
    pathname.includes('/server') ||
    pathname.includes('/admin');

  if (totalItems === 0 || isCartFlow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed z-40 left-4 right-4 md:left-auto md:right-8 bottom-20 md:bottom-8 max-w-md md:w-96"
      >
        <Link
          href="/customer/cart"
          className="flex items-center justify-between bg-[#201611] text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_30px_rgba(32,22,17,0.3)] hover:bg-[#2C1E17] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-[#FF5722] p-2 rounded-xl text-white">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF5722] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="text-xs text-stone-300 font-medium">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
              </p>
              <p className="text-sm font-bold text-white tracking-wide">
                ₹{(total || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FF5722] px-3.5 py-2 rounded-xl text-xs font-bold text-white group-hover:bg-[#F4511E] transition">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
