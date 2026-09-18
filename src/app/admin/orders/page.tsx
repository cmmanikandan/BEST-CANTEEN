'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { Search, QrCode, CheckCircle2, Clock, ShoppingBag, ChevronRight, Receipt } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  SERVED: 'bg-stone-100 text-stone-600',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  READY: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-blue-100 text-blue-800',
};

export default function AdminOrdersPage() {
  const { orders } = useCanteen();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Strictly filter out any unverified or payment pending orders
  const validOrders = orders.filter(
    (o) => o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED'
  );

  const filtered = validOrders.filter((o) => {
    if (filterStatus === 'ACTIVE') {
      if (o.orderStatus !== 'READY' && o.orderStatus !== 'PAID') return false;
    } else if (filterStatus !== 'ALL' && o.orderStatus !== filterStatus) {
      return false;
    }
    if (
      search &&
      !o.id.toLowerCase().includes(search.toLowerCase()) &&
      !o.userName.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Token Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            All issued tokens — payments, collection status, and timestamps
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/pos"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF5722] hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Open Cash POS</span>
          </Link>
          <span className="bg-white border border-stone-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-stone-600 shadow-2xs">
            {validOrders.length} Tokens
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Token # or customer name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'ACTIVE', 'PAID', 'SERVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === status
                  ? 'bg-[#FF5722] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[#8C7E76] uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Token ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ord) => {
                const { date, time } = formatDateTime(ord.createdAt);
                const displayStatus = ord.orderStatus === 'READY' ? 'ACTIVE' : ord.orderStatus;

                return (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-4 font-black text-[#FF5722]">#{ord.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#201611]">{ord.userName}</p>
                      <p className="text-[11px] text-stone-400">{ord.userPhone}</p>
                    </td>
                    <td className="p-4 max-w-[200px] text-stone-600 truncate">
                      {ord.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-sm text-[#201611]">₹{ord.total}</div>
                      {ord.paymentId?.startsWith('CASH_POS') || ord.notes?.toLowerCase().includes('cash') ? (
                        <span className="inline-block text-[9px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                          💵 Cash POS
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-0.5">
                          💳 Online
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${displayStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : STATUS_STYLE[ord.orderStatus] || 'bg-stone-100 text-stone-500'}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#201611]">{date}</p>
                      <p className="text-[11px] text-stone-400">{time}</p>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400 text-xs">
                    No tokens match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((ord) => {
          const { date, time } = formatDateTime(ord.createdAt);
          const displayStatus = ord.orderStatus === 'READY' ? 'ACTIVE' : ord.orderStatus;

          return (
            <div key={ord.id} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-[#FF5722]">#{ord.id}</span>
                  {ord.paymentId?.startsWith('CASH_POS') || ord.notes?.toLowerCase().includes('cash') ? (
                    <span className="text-[9px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      💵 Cash
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${displayStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : STATUS_STYLE[ord.orderStatus] || 'bg-stone-100 text-stone-500'}`}>
                  {displayStatus}
                </span>
              </div>
              <p className="font-bold text-sm text-[#201611]">{ord.userName}</p>
              <p className="text-xs text-stone-500">
                {ord.items.map((i) => `${i.name} ×${i.quantity}`).join(' · ')}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <span className="font-black text-[#FF5722]">₹{ord.total}</span>
                <span className="text-[11px] text-stone-400">{date} · {time}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center text-stone-400 text-xs border border-stone-200">
            No tokens match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
