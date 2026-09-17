'use client';

import React from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import {
  ShoppingBag, CheckCircle2, Clock, TrendingUp, QrCode, Utensils,
  Users, BarChart3, ArrowRight, Flame, Zap, Receipt,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, foods, activeMealInfo } = useCanteen();

  const totalRevenue = orders.reduce((s, o) => (o.paymentStatus === 'VERIFIED' ? s + o.total : s), 0);
  const servedOrders = orders.filter((o) => o.orderStatus === 'SERVED');
  const pendingOrders = orders.filter((o) => o.orderStatus === 'READY' || o.orderStatus === 'PAID');
  const availableFoods = foods.filter((f) => f.isAvailable && f.isVisible);
  const serveRate = orders.length > 0 ? Math.round((servedOrders.length / orders.length) * 100) : 100;

  const quickLinks = [
    { href: '/admin/pos', label: 'Cash POS', icon: Receipt, color: 'bg-amber-100 text-amber-800' },
    { href: '/admin/orders', label: 'Token Feed', icon: QrCode, color: 'bg-orange-100 text-[#FF5722]' },
    { href: '/admin/menu', label: 'Menu', icon: Utensils, color: 'bg-blue-100 text-blue-700' },
    { href: '/admin/customers', label: 'Customers', icon: Users, color: 'bg-purple-100 text-purple-700' },
    { href: '/admin/reports', label: 'Analytics', icon: BarChart3, color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#201611] to-stone-800 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#FF5722] blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-orange-400 blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Best Canteen · Admin Console
            </p>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <Link
              href="/admin/pos"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5722] hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>⚡ Open Cash POS</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-2xl">
              <span className="text-lg">{activeMealInfo.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-stone-300 uppercase">Active Meal</p>
                <p className="text-xs font-black">{activeMealInfo.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: `₹${totalRevenue}`, sub: 'Today · Cashless', color: 'text-[#FF5722]', bg: 'bg-orange-50', dot: 'bg-[#FF5722]' },
          { label: 'Tokens Issued', value: orders.length, sub: 'Digital tokens', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
          { label: 'Served', value: servedOrders.length, sub: 'Redeemed successfully', color: 'text-[#16A34A]', bg: 'bg-emerald-50', dot: 'bg-[#16A34A]' },
          { label: 'Pending', value: pendingOrders.length, sub: 'Awaiting collection', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-3xl p-4 border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{k.label}</p>
            </div>
            <p className={`text-3xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-stone-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Serve Rate Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#201611] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FF5722]" />
            Token Serve Rate
          </p>
          <p className="text-sm font-black text-[#16A34A]">{serveRate}%</p>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5722] to-[#16A34A] rounded-full"
            style={{ width: `${serveRate}%` }}
          />
        </div>
        <p className="text-[10px] text-stone-400 mt-1.5">
          {servedOrders.length} of {orders.length} tokens collected
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickLinks.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="bg-white rounded-3xl p-4 border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition group flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-2xl ${q.color} flex items-center justify-center`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#201611]">{q.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#FF5722] transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: Pending Tokens + Available Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pending Queue */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#201611] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              Pending Token Queue
              <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-xs font-bold text-[#201611]">Queue is clear!</p>
              <p className="text-[11px] text-stone-400">All tokens have been served.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pendingOrders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[#FF5722]">#{ord.id}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                        ✓ Paid ₹{ord.total}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C4E46] mt-0.5">{ord.userName} · {ord.items.map((i) => i.name).join(', ')}</p>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Dishes */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#201611] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF5722]" />
              Popular Dishes
            </h2>
            <Link href="/admin/menu" className="text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1">
              Menu <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {availableFoods.slice(0, 6).map((food) => (
              <div key={food.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-sm shrink-0">
                  {food.category === 'breakfast' ? '🌅' : food.category === 'lunch' ? '☀️' : food.category === 'dinner' ? '🌙' : '🍪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-[#201611] truncate">{food.name}</p>
                  <p className="text-[10px] text-stone-400 capitalize">{food.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-[#FF5722]">₹{food.price}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${food.isVeg ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {food.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
