'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { QrCode, Home, History, User, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // If on login page, render clean
  if (pathname === '/server/login') {
    return <>{children}</>;
  }

  const nav = [
    { href: '/server/dashboard', label: 'Home', icon: Home },
    { href: '/server/scanner', label: 'Scan', icon: QrCode },
    { href: '/server/history', label: 'History', icon: History },
    { href: '/server/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* ── Light Top Header ── */}
      <header className="sticky top-0 z-30 bg-white text-[#201611] px-4 sm:px-6 h-[60px] flex items-center justify-between border-b border-stone-200 shadow-sm">
        <Link href="/server/dashboard" className="flex items-center gap-2.5">
          <BrandLogo size="sm" variant="default" />
          <span className="bg-[#FF5722] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
            Counter Staff
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'text-stone-500 hover:text-[#201611] hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
          <Link
            href="/server/profile"
            className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 hover:border-[#FF5722] flex items-center justify-center text-xs font-bold text-[#201611] transition"
          >
            RK
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* ── Mobile Bottom Nav — normal style (no floating button) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition ${
                isActive ? 'text-[#FF5722]' : 'text-[#8C7E76] hover:text-[#201611]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout Confirm Modal ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#201611]">Confirm Logout</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to log out of the Staff Panel?
              </p>
            </div>
            <div className="p-4 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

