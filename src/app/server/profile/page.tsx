'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCanteen } from '@/context/CanteenContext';
import { QrCode, History, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ServerProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { orders } = useCanteen();
  const [showLogout, setShowLogout] = useState(false);

  const servedOrders = orders.filter((o) => o.orderStatus === 'SERVED');
  const servedRevenue = servedOrders.reduce((s, o) => s + o.total, 0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#201611] tracking-tight">Profile</h1>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          On Duty
        </span>
      </div>

      {/* Staff ID Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#201611] to-stone-700 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
            RK
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-[#201611]">
              {user?.name || 'Ramesh Kumar'}
            </h2>
            <p className="text-xs text-[#8C7E76]">Staff ID: BC-SRV-04</p>
            <span className="mt-1 inline-block bg-[#FF5722]/10 text-[#FF5722] text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Counter Staff
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1 text-center">
          <p className="text-2xl font-black text-[#16A34A]">{servedOrders.length}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase">Orders Served</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1 text-center">
          <p className="text-2xl font-black text-[#FF5722]">₹{servedRevenue}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase">Value Served</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-xs divide-y divide-stone-100">
        <Link href="/server/scanner" className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-2xl transition group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#201611]">Open QR Scanner</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#FF5722] transition" />
        </Link>

        <Link href="/server/history" className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-2xl transition group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#201611]">Serving History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
        </Link>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full py-3.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 font-bold text-xs rounded-2xl border border-stone-200 hover:border-red-200 transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Staff Logout
      </button>

      {/* Logout Confirm Modal */}
      {showLogout && (
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
                onClick={() => setShowLogout(false)}
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

