'use client';

import React from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function ServerHistoryPage() {
  const { orders } = useCanteen();
  const servedOrders = orders.filter((o) => o.orderStatus === 'SERVED');

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#201611] tracking-tight">History</h1>
          <p className="text-xs text-[#8C7E76] mt-0.5">Served orders at the counter</p>
        </div>
        <span className="text-xs font-bold text-stone-500 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs">
          {servedOrders.length} Served
        </span>
      </div>

      {servedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-stone-200 shadow-xs">
          <p className="text-4xl mb-2">📋</p>
          <h3 className="font-bold text-base text-[#201611]">No served orders yet</h3>
          <p className="text-xs text-[#5C4E46] mt-1">
            Orders will appear here once served at the counter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_90px] items-center px-4 py-3 border-b border-stone-200 bg-[#FAF8F5]">
            <span className="text-[10px] font-black text-[#8C7E76] uppercase">#</span>
            <span className="text-[10px] font-black text-[#8C7E76] uppercase">Token ID & Dishes</span>
            <span className="text-[10px] font-black text-[#8C7E76] uppercase text-right">Amount</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-100">
            {servedOrders.map((ord, idx) => (
              <div
                key={ord.id}
                className="grid grid-cols-[40px_1fr_90px] items-center px-4 py-3.5 hover:bg-[#FAF8F5]/50 transition"
              >
                {/* S.No */}
                <span className="text-xs font-bold text-stone-400">{idx + 1}</span>

                {/* Token info */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#201611]">#{ord.id}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Served</span>
                  </div>
                  <p className="text-[11px] text-[#5C4E46] truncate mt-0.5">
                    {ord.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{ord.userName}</p>
                </div>

                {/* Amount */}
                <span className="text-xs font-black text-[#FF5722] text-right">₹{ord.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
