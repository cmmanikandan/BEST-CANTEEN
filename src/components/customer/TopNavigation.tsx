'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, ADMIN_UIDS } from '@/context/AuthContext';
import { useCanteen } from '@/context/CanteenContext';
import { Bell, Heart, ShoppingBag, Search, Home, UtensilsCrossed, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loginAs } = useAuth();
  const { notifications, favorites } = useCanteen();
  const { totalItems } = useCart();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin =
    mounted &&
    (role === 'admin' ||
      user?.role === 'admin' ||
      (user && 'id' in user && ADMIN_UIDS.includes(user.id)));


  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: '/customer/home', label: 'Home', icon: Home },
    { href: '/customer/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/customer/search', label: 'Search', icon: Search },
    { href: '/customer/orders', label: 'My Tokens', icon: ShoppingBag },
    { href: '/customer/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] md:h-[82px] flex items-center justify-between gap-4">
        {/* Logo & Brand Name */}
        <Link
          href="/customer/home"
          className="flex items-center py-1 group focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 rounded-xl transition-transform hover:scale-[1.01]"
          aria-label="Best Canteen Customer Home"
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.href === '/customer/favorites' && favorites.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-[#FF5722]' : 'bg-orange-100 text-[#FF5722]'
                    }`}
                  >
                    {favorites.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Cart, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Switch to Admin Panel for Admin Users */}
          {isAdmin && (
            <button
              onClick={() => {
                loginAs('admin');
                router.push('/admin/dashboard');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 text-xs font-bold transition shadow-sm mr-1 active:scale-95"
              title="Open Canteen Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* Cart Page Icon */}
          <Link
            href="/customer/cart"
            className="relative p-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 transition"
            aria-label="View Cart"
          >

            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#FF5722] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FDFBF7]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/customer/notifications"
            className="relative p-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF5722] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </Link>

          {/* Profile Avatar or Login Button */}
          {mounted && user ? (
            <Link
              href="/customer/profile"
              className="flex items-center gap-2 pl-1 group"
              aria-label="Profile"
            >
              <div className="relative w-8 h-8 rounded-full ring-2 ring-stone-200 overflow-hidden group-hover:ring-[#FF5722] transition bg-stone-100 flex items-center justify-center">
                {('avatarUrl' in user && user.avatarUrl) ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Profile"
                    fill
                    referrerPolicy="no-referrer"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-[#FF5722]">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xs font-semibold text-[#201611]">
                {user.name?.split(' ')[0]}
              </span>
            </Link>
          ) : mounted ? (
            <Link
              href="/login"
              className="px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Login
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-100" />
          )}
        </div>
      </div>
    </header>
  );
}
