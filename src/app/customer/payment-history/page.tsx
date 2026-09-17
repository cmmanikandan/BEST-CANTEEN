'use client';

import React from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, ExternalLink } from 'lucide-react';

export default function PaymentHistoryPage() {
  const { orders } = useCanteen();

  const paidOrders = orders.filter((o) => o.paymentStatus === 'VERIFIED');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/customer/profile"
          className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#201611] tracking-tight">
            Payment History
          </h1>
          <p className="text-xs text-[#5C4E46]">
            Verified Razorpay transactions & digital invoices
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {paidOrders.map((ord) => (
          <div
            key={ord.id}
            className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#201611]">
                    Token #{ord.id}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-extrabold text-[#201611]">
                  ₹{ord.total}
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/60 flex items-center justify-between text-xs">
              <div>
                <p className="text-stone-400 text-[11px]">Razorpay ID</p>
                <p className="font-mono text-[#201611]">{ord.paymentId || 'pay_RPZ849204'}</p>
              </div>
              <Link
                href={`/customer/orders/${ord.id}/qr`}
                className="text-[#FF5722] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Token</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
