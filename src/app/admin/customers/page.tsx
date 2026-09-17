'use client';

import React, { useState, useMemo } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { Users, Trash2, ShieldOff, ShieldCheck, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  status: 'Active' | 'Blocked';
  avatar: string;
}

export default function AdminCustomersPage() {
  const { orders } = useCanteen();
  const [search, setSearch] = useState('');
  const [blockedIds, setBlockedIds] = useState<string[]>([]);

  // Dynamically group customers strictly by real orders
  const customers = useMemo<CustomerRecord[]>(() => {
    const custMap = new Map<string, CustomerRecord>();
    orders.forEach((o) => {
      const key = (o.userPhone || o.userName || o.userId).trim();
      if (!key) return;

      const existing = custMap.get(key) || {
        id: o.userId || key,
        name: o.userName || 'Walk-in Customer',
        email: o.userId && o.userId.includes('@') ? o.userId : `${(o.userName || 'user').toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        phone: o.userPhone || 'Counter Walk-in',
        orders: 0,
        spent: 0,
        status: blockedIds.includes(key) ? 'Blocked' : 'Active',
        avatar: (o.userName || 'WC').slice(0, 2).toUpperCase(),
      };

      existing.orders += 1;
      if (o.paymentStatus === 'VERIFIED') {
        existing.spent += o.total;
      }
      custMap.set(key, existing);
    });
    return Array.from(custMap.values());
  }, [orders, blockedIds]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalOrders = customers.reduce((s, c) => s + c.orders, 0);
  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const activeCount = customers.filter((c) => c.status === 'Active').length;

  const toggleBlock = (id: string) => {
    setBlockedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">Customers</h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Verified campus customers and ordering history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-[#201611]">{customers.length}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">Total Customers</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-[#16A34A]">{activeCount}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">Active</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-[#FF5722]">₹{totalSpent}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">Total Spent</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email or phone..."
          className="w-full px-4 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 text-[#201611] focus:outline-none focus:border-[#FF5722]"
        />
      </div>

      {/* Customer List / Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#201611]">No Customers Found</h3>
            <p className="text-xs text-stone-400">
              {customers.length === 0
                ? 'Customers will automatically appear here as tokens and orders are placed.'
                : 'No customers match your current search criteria.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-4 border shadow-xs space-y-3 ${
                  c.status === 'Blocked' ? 'border-red-200 opacity-75' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#201611] to-stone-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {c.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#201611]">{c.name}</p>
                      <p className="text-[10px] text-[#8C7E76]">{c.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    {c.orders} orders
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#FF5722]">₹{c.spent}</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => toggleBlock(c.id)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                      c.status === 'Active'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {c.status === 'Active' ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    {c.status === 'Active' ? 'Block' : 'Unblock'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[#8C7E76] uppercase font-bold">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Orders Placed</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#201611] to-stone-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                            {c.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-[#201611]">{c.name}</p>
                            <p className="text-[10px] text-[#8C7E76]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-stone-600">{c.phone}</td>
                      <td className="p-4 font-bold text-stone-700">{c.orders} tokens</td>
                      <td className="p-4 font-black text-[#FF5722]">₹{c.spent}</td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleBlock(c.id)}
                          className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition"
                        >
                          {c.status === 'Active' ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
