'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { supabase } from '@/lib/supabase';
import { Users, ShieldOff, ShieldCheck, Mail, ShoppingBag, DollarSign } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  orders: number;
  spent: number;
  status: 'Active' | 'Blocked';
}

export default function AdminCustomersPage() {
  const { orders } = useCanteen();
  const [search, setSearch] = useState('');
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [registeredCustomers, setRegisteredCustomers] = useState<any[]>([]);

  // Load registered customers from Supabase DB & persistent storage with Realtime sync
  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        const { data, error } = await supabase.from('registered_customers').select('*');
        if (!error && data && isMounted) {
          const mapped = data.map((d) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            avatarUrl: d.avatar_url,
          }));
          setRegisteredCustomers(mapped);
          localStorage.setItem('bc_registered_customers', JSON.stringify(mapped));
        } else {
          const raw = localStorage.getItem('bc_registered_customers');
          if (raw && isMounted) setRegisteredCustomers(JSON.parse(raw));
        }
      } catch {
        const raw = localStorage.getItem('bc_registered_customers');
        if (raw && isMounted) setRegisteredCustomers(JSON.parse(raw));
      }
    }
    loadCustomers();

    const channel = supabase
      .channel('registered_customers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registered_customers' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row: any = payload.new;
            setRegisteredCustomers((prev) => {
              const existing = prev.findIndex((c) => c.email?.toLowerCase() === row.email?.toLowerCase());
              const record = { id: row.id, name: row.name, email: row.email, avatarUrl: row.avatar_url };
              if (existing >= 0) {
                const next = [...prev];
                next[existing] = record;
                return next;
              }
              return [...prev, record];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Dynamically compile real customers with DP, name, email & ordering stats
  const customers = useMemo<CustomerRecord[]>(() => {
    const custMap = new Map<string, CustomerRecord>();

    // 1. Seed from registered customer accounts
    registeredCustomers.forEach((rc) => {
      const email = (rc.email || '').trim().toLowerCase();
      if (!email) return;
      custMap.set(email, {
        id: rc.id || email,
        name: rc.name || email.split('@')[0],
        email: rc.email,
        avatarUrl: rc.avatarUrl,
        orders: 0,
        spent: 0,
        status: blockedIds.includes(rc.id) || blockedIds.includes(email) ? 'Blocked' : 'Active',
      });
    });

    // 2. Also check currently logged-in customer in localStorage
    try {
      const savedUser = localStorage.getItem('bc_custom_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const email = (u?.email || '').trim().toLowerCase();
        if (email && u?.role === 'customer') {
          const existing = custMap.get(email) || {
            id: u.id || email,
            name: u.name || email.split('@')[0],
            email: u.email,
            avatarUrl: u.avatarUrl,
            orders: 0,
            spent: 0,
            status: blockedIds.includes(u.id) || blockedIds.includes(email) ? 'Blocked' : 'Active',
          };
          if (u.avatarUrl) existing.avatarUrl = u.avatarUrl;
          if (u.name) existing.name = u.name;
          custMap.set(email, existing);
        }
      }
    } catch {}

    // 3. Populate and tally stats from canteen token orders
    orders.forEach((o) => {
      const email = (o.userEmail || (o.userId?.includes('@') ? o.userId : '')).trim().toLowerCase();
      const fallbackKey = email || (o.userName || o.userId || '').trim().toLowerCase();
      if (!fallbackKey) return;

      const existing = custMap.get(fallbackKey) || {
        id: o.userId || fallbackKey,
        name: o.userName || 'Canteen Customer',
        email: o.userEmail || (fallbackKey.includes('@') ? fallbackKey : `${fallbackKey.replace(/\s+/g, '.')}@college.edu`),
        avatarUrl: o.userAvatar,
        orders: 0,
        spent: 0,
        status: blockedIds.includes(fallbackKey) ? 'Blocked' : 'Active',
      };

      if (o.userAvatar && !existing.avatarUrl) {
        existing.avatarUrl = o.userAvatar;
      }
      if (o.userName && (!existing.name || existing.name === 'Online Customer')) {
        existing.name = o.userName;
      }
      if (o.userEmail && !existing.email) {
        existing.email = o.userEmail;
      }

      existing.orders += 1;
      if (o.paymentStatus === 'VERIFIED' || o.orderStatus === 'PAID' || o.orderStatus === 'READY' || o.orderStatus === 'SERVED') {
        existing.spent += o.total;
      }
      custMap.set(fallbackKey, existing);
    });

    return Array.from(custMap.values());
  }, [registeredCustomers, orders, blockedIds]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">Customer Management</h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Verified campus customers, profile display pictures & digital ordering history
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
          <p className="text-2xl font-black text-[#FF5722]">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">Total Spent</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or email address..."
          className="w-full px-4 py-2.5 text-xs border border-stone-200 rounded-2xl bg-stone-50 text-[#201611] focus:outline-none focus:border-[#FF5722]"
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
                ? 'Customers will automatically appear here as accounts register and digital tokens are ordered.'
                : 'No customers match your current search criteria.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards (No mobile numbers shown) */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-4 border shadow-xs space-y-3.5 ${
                  c.status === 'Blocked' ? 'border-red-200 opacity-75' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Customer DP */}
                    <div className="w-11 h-11 rounded-2xl ring-2 ring-stone-200 overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FF5722] to-orange-700 text-white flex items-center justify-center font-black text-sm">
                          {(c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#201611]">{c.name}</p>
                      <p className="text-[11px] text-[#8C7E76] break-all">{c.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                  <span className="flex items-center gap-1 font-semibold text-stone-700">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#FF5722]" />
                    {c.orders} {c.orders === 1 ? 'token' : 'tokens'}
                  </span>
                  <span className="font-black text-[#FF5722]">
                    Total Spent: ₹{c.spent.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => toggleBlock(c.id)}
                    className={`w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                      c.status === 'Active'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {c.status === 'Active' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {c.status === 'Active' ? 'Block Account' : 'Unblock Account'}
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
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Tokens Ordered</th>
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
                          {/* Customer DP */}
                          <div className="w-10 h-10 rounded-2xl ring-2 ring-stone-200 overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center">
                            {c.avatarUrl ? (
                              <img
                                src={c.avatarUrl}
                                alt={c.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#FF5722] to-orange-700 text-white flex items-center justify-center font-black text-sm">
                                {(c.name || 'C').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#201611]">{c.name}</p>
                            <span className="text-[10px] text-stone-400 font-medium">Verified Campus Member</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-stone-700">{c.email}</td>
                      <td className="p-4 font-bold text-stone-700">{c.orders} tokens</td>
                      <td className="p-4 font-black text-[#FF5722]">₹{c.spent.toLocaleString('en-IN')}</td>
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
                          className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition"
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
