'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCanteen } from '@/context/CanteenContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  Store,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function DigitalQrPage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders } = useCanteen();

  const order = orders.find((o) => o.id === id);

  if (!order || order.paymentStatus !== 'VERIFIED' || order.orderStatus === 'PAYMENT_PENDING') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#201611]">Token Not Found or Unpaid</h2>
        <p className="text-xs text-[#5C4E46]">
          No active digital token is issued for unpaid orders. Please complete payment first.
        </p>
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-xl"
        >
          View My Tokens
        </Link>
      </div>
    );
  }

  const isServed = order.orderStatus === 'SERVED';
  const isReady = order.orderStatus === 'READY';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/customer/orders')}
          className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 flex items-center gap-1 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Orders</span>
        </button>
        <span className="text-xs font-semibold text-stone-500">
          Token #{order.id}
        </span>
      </div>

      {/* Main Digital QR Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-[0_8px_30px_rgba(32,22,17,0.06)] text-center space-y-5 relative overflow-hidden">
        {/* Header Badge */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
            Best Canteen Digital Food Token
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Order #{order.id}
          </h1>

          <div className="pt-1">
            {isServed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                <CheckCircle2 className="w-4 h-4 text-stone-500" />
                <span>✓ ORDER SERVED & COLLECTED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#16A34A] text-xs font-bold border border-emerald-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>🟢 ACTIVE</span>
              </span>
            )}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 p-4 rounded-3xl bg-[#FFFDF9] border-2 border-stone-200/80 shadow-inner flex flex-col items-center justify-center">
          <QRCodeSVG
            value={order.qrToken}
            size={210}
            level="H"
            includeMargin={false}
            fgColor="#201611"
          />

          {isServed && (
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center text-white p-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1" />
              <p className="font-extrabold text-sm">TOKEN USED</p>
              <p className="text-[11px] text-stone-300">Served at Counter</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#201611]">
            Show this QR at the canteen counter.
          </p>
          <p className="text-[11px] text-[#5C4E46]">
            Server scans this code to instantly verify payment and hand over your hot food.
          </p>
        </div>

        {/* Items Summary in Card */}
        <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-stone-200/70 text-left space-y-2">
          <p className="text-[11px] font-bold text-[#8C7E76] uppercase tracking-wider">
            Order Items
          </p>
          <div className="divide-y divide-stone-200/50 text-xs">
            {order.items.map((item) => (
              <div key={item.foodId} className="py-1.5 flex justify-between">
                <span className="font-semibold text-[#201611]">
                  {item.name} <span className="text-stone-500 font-normal">×{item.quantity}</span>
                </span>
                <span className="font-bold text-[#201611]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="pt-2 flex justify-between font-extrabold text-xs text-[#201611]">
              <span>Total Paid (Razorpay)</span>
              <span className="text-[#FF5722]">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Security Token String */}
        <div className="text-[10px] text-stone-400 font-mono break-all bg-stone-50 p-2 rounded-xl border border-stone-200">
          Token ID: {order.qrToken}
        </div>
      </div>
    </div>
  );
}
