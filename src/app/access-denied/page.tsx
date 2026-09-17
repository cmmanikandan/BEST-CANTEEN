'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldX, Home, LogIn } from 'lucide-react';

export default function AccessDeniedPage() {
  const params = useSearchParams();
  const from = params.get('from') || '';

  const isAdmin = from.startsWith('/admin');
  const isServer = from.startsWith('/server');

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h1 className="text-xl font-black text-[#201611]">Access Denied</h1>
          <p className="text-xs text-stone-500 mt-2">
            {isAdmin
              ? 'This page is restricted to Admin accounts only.'
              : isServer
              ? 'This page is restricted to Counter Staff accounts only.'
              : 'You do not have permission to access this page.'}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 font-semibold">
          {isAdmin
            ? 'Please log in with your Admin credentials to access the Admin Panel.'
            : isServer
            ? 'Please log in with your Counter Staff credentials to access the Staff Panel.'
            : 'Please log in with the correct account to continue.'}
        </div>

        <div className="flex flex-col gap-2">
          {isAdmin && (
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 py-2.5 bg-[#FF5722] text-white font-bold text-xs rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              Go to Admin Login
            </Link>
          )}
          {isServer && (
            <Link
              href="/server/login"
              className="flex items-center justify-center gap-2 py-2.5 bg-[#FF5722] text-white font-bold text-xs rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              Go to Staff Login
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2.5 border border-stone-200 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-50 transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
