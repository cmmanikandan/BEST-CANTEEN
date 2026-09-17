'use client';

import React from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { CheckCircle2, TrendingUp, Zap, Phone, MessageCircle, ArrowRight } from 'lucide-react';

const ADMIN_PHONE = '+919876543210';

export default function ServerDashboardPage() {
  const { orders } = useCanteen();

  const servedOrders = orders.filter((o) => o.orderStatus === 'SERVED');
  const servedMoney = servedOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const serveRate = totalOrders > 0 ? Math.round((servedOrders.length / totalOrders) * 100) : 0;

  return (
    <div className="space-y-5 max-w-xl mx-auto">

      {/* Hero Scan Card */}
      <div className="bg-gradient-to-br from-[#201611] to-stone-800 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#FF5722]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-28 h-28 bg-orange-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Counter · Live</p>
          <h1 className="text-2xl font-black mt-1 tracking-tight">Ready to Serve 🍽️</h1>
          <p className="text-xs text-stone-300 mt-1 mb-4">
            Scan customer QR token to verify payment and dispense food.
          </p>
          <Link
            href="/server/scanner"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-sm rounded-2xl shadow-[0_4px_16px_rgba(255,87,34,0.4)] transition active:scale-95"
          >
            Scan QR Token →
          </Link>
        </div>
      </div>

      {/* Served Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-1 text-center">
          <p className="text-2xl font-black text-[#16A34A]">{servedOrders.length}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase">Orders Served</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-1 text-center">
          <p className="text-2xl font-black text-[#FF5722]">₹{servedMoney}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase">Amount Collected</p>
        </div>
      </div>

      {/* Serve Rate */}
      {totalOrders > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#201611] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF5722]" />
              Today's Serve Rate
            </p>
            <p className="text-sm font-black text-[#16A34A]">{serveRate}%</p>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF5722] to-[#16A34A] rounded-full transition-all duration-500"
              style={{ width: `${serveRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Served Tokens */}
      {servedOrders.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
          <p className="text-xs font-bold text-[#201611] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            Scanned Tokens Today
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {servedOrders.map((ord) => (
              <div key={ord.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-stone-100">
                <div>
                  <span className="font-black text-xs text-[#FF5722]">#{ord.id}</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">{ord.userName}</p>
                </div>
                <span className="font-black text-sm text-[#16A34A]">₹{ord.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {servedOrders.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-stone-200">
          <p className="text-2xl mb-1">📷</p>
          <p className="text-sm font-bold text-[#201611]">No tokens scanned yet</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Scan QR tokens to see them here.</p>
        </div>
      )}

      {/* Contact Admin */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div>
          <p className="text-xs font-black text-[#201611]">Contact Canteen Admin</p>
          <p className="text-[11px] text-[#8C7E76] mt-0.5">
            Report menu issues, out-of-stock items, or anything urgent.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`tel:${ADMIN_PHONE}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl border border-blue-100 transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            Call Admin
          </a>
          <a
            href={`https://wa.me/${ADMIN_PHONE.replace(/\D/g, '')}?text=Hi%20Admin%2C%20I%20am%20Canteen%20Staff.%20Issue%3A%20`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-100 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
