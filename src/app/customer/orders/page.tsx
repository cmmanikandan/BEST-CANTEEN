'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { ShoppingBag, QrCode, ArrowRight, CheckCircle2, Clock, Lock } from 'lucide-react';
import { QrTokenModal } from '@/components/customer/QrTokenModal';

export default function CustomerOrdersPage() {
  const { user, isLoaded } = useAuth();
  const { orders } = useCanteen();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [selectedOrderForQr, setSelectedOrderForQr] = useState<Order | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#201611]">Login Required</h2>
        <p className="text-xs text-[#5C4E46]">Please log in to your account to view and access your digital food tokens.</p>
        <Link
          href="/login?redirect=/customer/orders"
          className="inline-block px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  const myOrders = orders.filter((o) => {
    if (!user) return false;
    return (
      o.userId === user.id ||
      ('email' in user && o.userName === user.name) ||
      o.userId === 'customer-online' ||
      o.userId === 'user-hari'
    );
  });

  const activeOrders = myOrders.filter((o) => o.orderStatus !== 'SERVED' && o.orderStatus !== 'CANCELLED');
  const historyOrders = myOrders.filter((o) => o.orderStatus === 'SERVED' || o.orderStatus === 'CANCELLED');

  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight">
          My Tokens
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
          Track digital tokens and view past collection history
        </p>
      </div>

      {/* Tabs: Active and Used */}
      <div className="flex bg-[#F7F3EA] p-1 rounded-2xl border border-stone-200/60 max-w-sm">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            tab === 'active'
              ? 'bg-[#FF5722] text-white shadow-xs'
              : 'text-[#5C4E46] hover:text-[#201611]'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            tab === 'history'
              ? 'bg-[#FF5722] text-white shadow-xs'
              : 'text-[#5C4E46] hover:text-[#201611]'
          }`}
        >
          Used ({historyOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto text-2xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#201611]">No tokens yet</h3>
          <p className="text-xs text-[#5C4E46] max-w-xs mx-auto">
            Your next delicious order is waiting. Browse our canteen menu now.
          </p>
          <div className="pt-1">
            <Link
              href="/customer/menu"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-xl"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayOrders.map((ord) => {
            const isServed = ord.orderStatus === 'SERVED';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#201611]">
                      Token #{ord.id}
                    </span>
                    <p className="text-[11px] text-stone-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    {!isServed && (
                      <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                        Active
                      </span>
                    )}
                    {isServed && (
                      <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                        Served
                      </span>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-[#5C4E46] bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/60">
                  {ord.items.map((item) => (
                    <div key={item.foodId} className="flex justify-between py-0.5">
                      <span className="font-semibold text-[#201611]">
                        {item.name} ×{item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-200/60 pt-1.5 mt-1 flex justify-between font-bold text-[#201611]">
                    <span>Total Amount</span>
                    <span className="text-[#FF5722]">₹{ord.total}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-400">
                    Payment: <span className="font-bold text-emerald-600">✓ Paid</span>
                  </span>

                  <div>
                    {!isServed ? (
                      <button
                        onClick={() => setSelectedOrderForQr(ord)}
                        className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                      >
                        <QrCode className="w-4 h-4 text-white" />
                        <span>QR Token</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-stone-100 text-stone-500 font-bold text-xs rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>Collected</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Token Modal Pop-up */}
      <QrTokenModal
        order={selectedOrderForQr}
        onClose={() => setSelectedOrderForQr(null)}
      />
    </div>
  );
}
