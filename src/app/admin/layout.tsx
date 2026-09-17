'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Utensils, ShoppingBag, BarChart3, Users,
  Store, FolderTree, Settings, LogOut, ChevronRight, Menu, X,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pos', label: 'Cash POS', icon: Receipt },
  { href: '/admin/menu', label: 'Menu Management', icon: Utensils },
  { href: '/admin/orders', label: 'Token Feed', icon: ShoppingBag },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/servers', label: 'Counter Staff', icon: Store },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarInner = ({ mobile = false }: { mobile?: boolean }) => {
    const isExpanded = !collapsed || mobile;
    return (
      <div className="flex flex-col h-full">
        {/* Brand row */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-stone-800 shrink-0">
          {isExpanded ? (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <BrandLogo size="sm" variant="white" />
              <span className="bg-[#FF5722] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">Admin</span>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="mx-auto block relative w-8 h-8 rounded-xl overflow-hidden hover:opacity-90 transition" title="Best Canteen Admin">
              <Image
                src="/logo-icon.png"
                alt="Best Canteen"
                fill
                className="object-contain"
                priority
              />
            </Link>
          )}
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>


        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => mobile && setMobileOpen(false)}
                title={!isExpanded ? label : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#FF5722] text-white shadow-[0_4px_12px_rgba(255,87,34,0.35)]'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                } ${!isExpanded ? 'justify-center !px-2' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isExpanded && <span className="flex-1 truncate">{label}</span>}
                {isExpanded && isActive && <ChevronRight className="w-4 h-4 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-stone-800 shrink-0 space-y-1.5">
          <Link
            href="/customer/home"
            title={!isExpanded ? 'Switch to Customer View' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:bg-stone-800 hover:text-white transition group border border-stone-800 hover:border-stone-700 ${
              !isExpanded ? 'justify-center !px-2' : ''
            }`}
          >
            <span className="text-base group-hover:scale-110 transition-transform">🛍️</span>
            {isExpanded && <span className="flex-1 truncate">Customer View</span>}
            {isExpanded && (
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-extrabold">
                Switch
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={!isExpanded ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-400 hover:bg-red-900/40 hover:text-red-300 transition ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="h-screen bg-[#F6F4EF] flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#201611] text-white border-r border-stone-800 shrink-0 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarInner />
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-[#201611] text-white flex flex-col h-full shadow-2xl">
            <SidebarInner mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 bg-white border-b border-stone-200 px-4 sm:px-6 h-14 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition border border-stone-200"
              title="Toggle Menu"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Menu Toggle Button */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden md:flex items-center justify-center p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition border border-stone-200"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-4 h-4 text-stone-700" />
            </button>

            <p className="hidden md:block text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
              Best Canteen · Admin Panel
            </p>
            <Link href="/admin/dashboard" className="md:hidden flex items-center gap-2">
              <BrandLogo size="sm" variant="default" />
              <span className="bg-[#FF5722] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-semibold text-stone-600">Admin: {user?.name || 'Administrator'}</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#201611]">Confirm Logout</h3>
              <p className="text-xs text-stone-500 mt-1">Are you sure you want to log out of the Admin Panel?</p>
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

