'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, ADMIN_UIDS } from '@/context/AuthContext';
import { useCanteen } from '@/context/CanteenContext';
import {
  ShoppingBag,
  Heart,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Award,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, role, loginAs, logout } = useAuth();
  const { orders, favorites } = useCanteen();

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/customer/profile');
    }
  }, [user, router]);

  if (!user) return null;

  // Check if current user has Admin privileges
  const isAdmin =
    role === 'admin' ||
    user?.role === 'admin' ||
    (user && 'id' in user && ADMIN_UIDS.includes(user.id)) ||
    (user && 'email' in user && user.email === 'canteen.admin@college.edu') ||
    (typeof window !== 'undefined' && localStorage.getItem('bc_user_role') === 'admin');

  const handleSwitchToAdmin = () => {
    loginAs('admin');
    router.push('/admin/dashboard');
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/customer/orders',
      icon: ShoppingBag,
      label: 'My Tokens',
      badge: `${orders.length} tokens`,
    },
    {
      href: '/customer/favorites',
      icon: Heart,
      label: 'My Favorites',
      badge: `${favorites.length} dishes`,
    },
    {
      href: '/customer/payment-history',
      icon: CreditCard,
      label: 'Payment History',
      badge: 'Receipts',
    },
    {
      href: '/customer/notifications',
      icon: Bell,
      label: 'Notifications',
    },
    {
      href: '/customer/help',
      icon: HelpCircle,
      label: 'Help & Support',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
          Manage your campus canteen account and preferences
        </p>
      </div>

      {/* User Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex items-center gap-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-orange-100 overflow-hidden shrink-0">
          <Image
            src={
              (user && 'avatarUrl' in user && user.avatarUrl) ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
            alt="User avatar"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#201611] truncate">
              {user?.name || (isAdmin ? 'Priya Narayanan (Canteen Manager)' : 'Hariharan S.')}
            </h2>
            <span
              className={`p-1 rounded-full ${
                isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
              }`}
              title={isAdmin ? 'Verified Canteen Administrator' : 'Verified Campus Student'}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <p className="text-xs text-[#5C4E46] truncate">
            {(user && 'email' in user && user.email) || (isAdmin ? 'canteen.admin@college.edu' : 'hari.s@college.edu')}
          </p>
        </div>
      </div>

      {/* ── ADMIN ACCESS CARD (Visible for Admin Users) ── */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-800 text-white shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-tight">
                    Canteen Admin Portal
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30">
                    Staff Mode
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  You have full manager access to the POS counter, live token feed, menu catalog, and sales analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handleSwitchToAdmin}
              className="flex-1 py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Switch to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => {
                loginAs('admin');
                router.push('/admin/pos');
              }}
              className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-700 transition"
            >
              <span>Cash POS</span>
            </button>
          </div>
        </div>
      )}

      {/* Menu Options */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden divide-y divide-stone-100">
        {/* Admin Link at the top of menu options if Admin */}
        {isAdmin && (
          <button
            onClick={handleSwitchToAdmin}
            className="w-full p-4 flex items-center justify-between bg-orange-50/60 hover:bg-orange-100/70 transition group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#201611] group-hover:text-[#FF5722] transition">
                    Admin Management Panel
                  </span>
                  <span className="text-[10px] bg-[#FF5722] text-white px-1.5 py-0.5 rounded font-extrabold uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7E76]">
                  Access Cash POS, Menu inventory, reports & counter staff
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF5722] hidden sm:inline">
                Open Panel
              </span>
              <ChevronRight className="w-4 h-4 text-[#FF5722] group-hover:translate-x-1 transition" />
            </div>
          </button>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#201611] group-hover:text-[#FF5722] transition">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-xs text-stone-400 font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          );
        })}

        {/* Logout Action */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 text-[#201611] transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#201611]">Confirm Logout</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to end your session?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
