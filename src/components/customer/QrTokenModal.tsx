'use client';

import React from 'react';
import Image from 'next/image';
import { Order } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface QrTokenModalProps {
  order: Order | null;
  onClose: () => void;
}

export function QrTokenModal({ order, onClose }: QrTokenModalProps) {
  if (!order) return null;

  const isServed = order.orderStatus === 'SERVED';
  const isReady = order.orderStatus === 'READY';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 text-center space-y-3 shadow-2xl relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - absolute top right with no blank top bar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-[#201611] hover:bg-stone-100 transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Token Header */}
        <div className="pt-1">
          <p className="text-[10px] font-extrabold text-[#FF5722] uppercase tracking-wider">
            Digital Food Token
          </p>
          <h2 className="text-xl font-black text-[#201611] tracking-tight mt-0.5">
            Token #{order.id}
          </h2>

          <div className="mt-1">
            {isServed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                <span>✓ TOKEN SERVED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-[#16A34A] text-xs font-bold border border-emerald-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>🟢 ACTIVE</span>
              </span>
            )}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="relative mx-auto w-48 h-48 sm:w-52 sm:h-52 p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-stone-200 shadow-inner flex items-center justify-center">
          <QRCodeSVG
            value={order.qrToken}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#201611"
          />

          {isServed && (
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-white p-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
              <p className="font-extrabold text-xs tracking-wider">TOKEN REDEEMED</p>
              <p className="text-[10px] text-stone-300">Served at Counter</p>
            </div>
          )}
        </div>

        {/* Counter Instruction */}
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#201611]">
            Show this QR at the canteen counter.
          </p>
          <p className="text-[11px] text-[#5C4E46]">
            Server scans this token to verify and dispense your food.
          </p>
        </div>

        {/* Order Items Summary */}
        <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-stone-200/70 text-left space-y-1.5 text-xs">
          <p className="text-[10px] font-bold text-[#8C7E76] uppercase tracking-wider">
            Items ({order.items.length})
          </p>
          <div className="divide-y divide-stone-200/50">
            {order.items.map((item) => (
              <div key={item.foodId} className="py-1 flex justify-between">
                <span className="font-semibold text-[#201611]">
                  {item.name} <span className="text-stone-400 font-normal">×{item.quantity}</span>
                </span>
                <span className="font-bold text-[#201611]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="pt-1.5 flex justify-between font-extrabold text-xs text-[#201611]">
              <span>Total Paid</span>
              <span className="text-[#FF5722]">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#201611] hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
