'use client';

import React, { useState, useMemo } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import {
  Download, BarChart3, TrendingUp, CheckCircle2, PieChart, Clock, Calendar,
  ArrowUpRight, ArrowDownRight, Sparkles, Filter, ChevronRight, Utensils, AlertCircle
} from 'lucide-react';

type ReportView = 'daily' | 'pie' | 'hourly' | 'top_dishes';

export default function AdminReportsPage() {
  const { orders, foods } = useCanteen();
  const [activeView, setActiveView] = useState<ReportView>('daily');
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month'>('today');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 1. Pure Real Revenue & Token Metrics derived strictly from orders
  const totalVerifiedRevenue = useMemo(() => {
    return orders.reduce((s, o) => (o.paymentStatus === 'VERIFIED' ? s + o.total : s), 0);
  }, [orders]);

  const servedCount = useMemo(() => orders.filter((o) => o.orderStatus === 'SERVED').length, [orders]);
  const activeCount = useMemo(() => orders.filter((o) => o.orderStatus === 'PAID' || o.orderStatus === 'READY').length, [orders]);
  const serveRate = orders.length > 0 ? Math.round((servedCount / orders.length) * 100) : 0;
  const avgOrderValue = orders.length > 0 ? Math.round(totalVerifiedRevenue / orders.length) : 0;

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    if (dateRange === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      return orders.filter((o) => o.createdAt.startsWith(todayStr));
    }
    if (dateRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600000);
      return orders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    }
    if (dateRange === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600000);
      return orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    }
    return orders;
  }, [orders, dateRange]);

  const filteredRevenue = useMemo(() => {
    return filteredOrders.reduce((s, o) => (o.paymentStatus === 'VERIFIED' ? s + o.total : s), 0);
  }, [filteredOrders]);

  // 2. Real 7-Day Trend
  const dailyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
      const dayRev = dayOrders.reduce((s, o) => (o.paymentStatus === 'VERIFIED' ? s + o.total : s), 0);
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      days.push({
        day: dayName,
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        rev: dayRev,
        tokens: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const maxDayRev = Math.max(1, ...dailyData.map((d) => d.rev));

  // 3. Real Category Breakdown derived from orders & food items
  const categoryStats = useMemo(() => {
    const counts: Record<string, { count: number; rev: number }> = {
      lunch: { count: 0, rev: 0 },
      breakfast: { count: 0, rev: 0 },
      snacks: { count: 0, rev: 0 },
      dinner: { count: 0, rev: 0 },
    };

    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const food = foods.find((f) => f.id === item.foodId);
        const cat = food?.category || 'lunch';
        if (counts[cat]) {
          counts[cat].count += item.quantity;
          counts[cat].rev += item.price * item.quantity;
        }
      });
    });

    const totalRev = Object.values(counts).reduce((sum, c) => sum + c.rev, 0);

    return [
      {
        id: 'lunch',
        label: 'Lunch Meals',
        color: '#FF5722',
        count: counts.lunch.count,
        rev: `₹${counts.lunch.rev}`,
        percentage: totalRev > 0 ? Math.round((counts.lunch.rev / totalRev) * 100) : 0,
      },
      {
        id: 'breakfast',
        label: 'Breakfast',
        color: '#10B981',
        count: counts.breakfast.count,
        rev: `₹${counts.breakfast.rev}`,
        percentage: totalRev > 0 ? Math.round((counts.breakfast.rev / totalRev) * 100) : 0,
      },
      {
        id: 'snacks',
        label: 'Snacks & Tea',
        color: '#F59E0B',
        count: counts.snacks.count,
        rev: `₹${counts.snacks.rev}`,
        percentage: totalRev > 0 ? Math.round((counts.snacks.rev / totalRev) * 100) : 0,
      },
      {
        id: 'dinner',
        label: 'Dinner',
        color: '#8B5CF6',
        count: counts.dinner.count,
        rev: `₹${counts.dinner.rev}`,
        percentage: totalRev > 0 ? Math.round((counts.dinner.rev / totalRev) * 100) : 0,
      },
    ];
  }, [filteredOrders, foods]);

  // 4. Real Peak Rush Hours
  const hourlyData = useMemo(() => {
    const slots = [
      { hour: '07:00 - 09:00', label: 'Morning Breakfast', startH: 7, endH: 9 },
      { hour: '09:00 - 11:30', label: 'Mid-Morning Tea', startH: 9, endH: 11 },
      { hour: '11:30 - 13:30', label: 'Lunch Shift 1', startH: 11, endH: 13 },
      { hour: '13:30 - 15:30', label: 'Lunch Shift 2', startH: 13, endH: 15 },
      { hour: '15:30 - 18:30', label: 'Evening Snacks', startH: 15, endH: 18 },
      { hour: '18:30 - 22:30', label: 'Dinner Service', startH: 18, endH: 22 },
    ];

    return slots.map((slot) => {
      const slotOrders = filteredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        const h = d.getHours();
        return h >= slot.startH && h <= slot.endH;
      });
      return {
        hour: slot.hour,
        label: slot.label,
        count: slotOrders.length,
        rush: slotOrders.length > 5,
      };
    });
  }, [filteredOrders]);

  const maxHourCount = Math.max(1, ...hourlyData.map((h) => h.count));

  // 5. Real Top Dishes
  const topDishes = useMemo(() => {
    const dishMap = new Map<string, { name: string; count: number; rev: number; cat: string }>();
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = dishMap.get(item.name) || {
          name: item.name,
          count: 0,
          rev: 0,
          cat: 'lunch',
        };
        existing.count += item.quantity;
        existing.rev += item.price * item.quantity;
        dishMap.set(item.name, existing);
      });
    });
    return Array.from(dishMap.values()).sort((a, b) => b.rev - a.rev);
  }, [filteredOrders]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No order data to export.');
      return;
    }
    const headers = ['Token_ID', 'Customer', 'Phone', 'Items', 'Total', 'Payment', 'Status', 'Created', 'Served'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.userName}"`,
      o.userPhone,
      `"${o.items.map((i) => `${i.name}(${i.quantity})`).join('; ')}"`,
      o.total,
      o.paymentStatus,
      o.orderStatus,
      o.createdAt,
      o.servedAt || 'N/A',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `BestCanteen_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
              Reports & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Real-time Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Verified financial statistics and collection performance
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Range Pills */}
          <div className="bg-stone-200/70 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            {(['today', '7days', 'month'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateRange === r ? 'bg-white text-[#201611] shadow-2xs font-extrabold' : 'text-stone-600 hover:text-[#201611]'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0C2340] hover:bg-[#13335A] text-white text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Exported!' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-black text-[#FF5722]">₹{filteredRevenue}</p>
          <p className="text-[11px] text-stone-500 font-semibold">
            {filteredOrders.length} verified transactions
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tokens Generated</p>
          <p className="text-3xl font-black text-blue-700">{filteredOrders.length}</p>
          <p className="text-[11px] text-stone-500 font-semibold">
            {servedCount} redeemed tokens
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Average Order</p>
          <p className="text-3xl font-black text-purple-700">₹{avgOrderValue}</p>
          <p className="text-[11px] text-stone-500 font-semibold">Per verified cart</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Fulfillment Rate</p>
          <p className="text-3xl font-black text-[#16A34A]">{serveRate}%</p>
          <p className="text-[11px] text-stone-500 font-semibold">{activeCount} tokens pending</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveView('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeView === 'daily'
              ? 'bg-[#FF5722] text-white shadow-sm'
              : 'text-stone-600 hover:text-[#201611] hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>7-Day Daily Revenue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('pie')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeView === 'pie'
              ? 'bg-[#FF5722] text-white shadow-sm'
              : 'text-stone-600 hover:text-[#201611] hover:bg-white/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Category Share</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('hourly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeView === 'hourly'
              ? 'bg-[#FF5722] text-white shadow-sm'
              : 'text-stone-600 hover:text-[#201611] hover:bg-white/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Rush Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('top_dishes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeView === 'top_dishes'
              ? 'bg-[#FF5722] text-white shadow-sm'
              : 'text-stone-600 hover:text-[#201611] hover:bg-white/60'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Top Dishes</span>
        </button>
      </div>

      {/* ── VIEW 1: DAILY REVENUE BAR CHART ── */}
      {activeView === 'daily' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#201611]">
                Daily Revenue & Token Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-[#5C4E46]">
                Actual revenue recorded from issued orders
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF5722] bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
              Total 7-Day Sales: ₹{dailyData.reduce((s, d) => s + d.rev, 0)}
            </span>
          </div>

          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-60 px-2 border-b border-stone-200">
              {dailyData.map((item, idx) => {
                const heightPercent = maxDayRev > 0 && item.rev > 0 ? Math.max(8, Math.round((item.rev / maxDayRev) * 100)) : 4;
                const isToday = item.day === 'Today';

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                      ₹{item.rev} · {item.tokens} tokens
                    </div>

                    <span className="text-[10px] sm:text-xs font-bold text-[#201611] mb-1.5">
                      ₹{item.rev}
                    </span>

                    <div className="w-full max-w-[48px] bg-stone-100 rounded-t-2xl overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-2xl transition-all duration-500 ${
                          item.rev > 0
                            ? isToday
                              ? 'bg-gradient-to-t from-[#FF5722] to-[#FF8A65]'
                              : 'bg-gradient-to-t from-orange-400 to-orange-300'
                            : 'bg-stone-200'
                        }`}
                      />
                    </div>

                    <div className="text-center mt-2.5">
                      <p className={`text-xs font-bold ${isToday ? 'text-[#FF5722]' : 'text-[#201611]'}`}>
                        {item.day}
                      </p>
                      <p className="text-[10px] text-stone-400">{item.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: CATEGORY SHARE ── */}
      {activeView === 'pie' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#201611]">
                Category Revenue Distribution
              </h3>
              <p className="text-xs text-[#5C4E46]">
                Actual breakdown from items ordered in selected period
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {categoryStats.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-stone-100 bg-[#FAF8F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#201611]">{c.label}</span>
                  <span className="text-xs font-black text-[#FF5722]">{c.percentage}%</span>
                </div>
                <p className="text-xl font-black text-[#201611]">{c.rev}</p>
                <p className="text-[10px] text-stone-500">{c.count} items sold</p>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW 3: HOURLY RUSH ── */}
      {activeView === 'hourly' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-extrabold text-base text-[#201611]">Canteen Service Rush Distribution</h3>
            <p className="text-xs text-[#5C4E46]">Order volume grouped by service windows</p>
          </div>

          <div className="space-y-3 pt-2">
            {hourlyData.map((h, i) => {
              const pct = maxHourCount > 0 && h.count > 0 ? Math.round((h.count / maxHourCount) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <div className="w-32 shrink-0 font-bold text-[#201611]">{h.hour}</div>
                  <div className="flex-1 bg-stone-100 h-6 rounded-xl overflow-hidden relative flex items-center px-3">
                    <div
                      style={{ width: `${pct}%` }}
                      className="absolute inset-y-0 left-0 bg-orange-200 rounded-xl"
                    />
                    <span className="relative z-10 font-bold text-stone-700 text-[11px]">
                      {h.label} ({h.count} orders)
                    </span>
                  </div>
                  <div className="w-16 text-right font-black text-[#FF5722]">{h.count} tokens</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 4: TOP DISHES ── */}
      {activeView === 'top_dishes' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-extrabold text-base text-[#201611]">Top Selling Dishes</h3>
            <p className="text-xs text-[#5C4E46]">Ranked strictly by quantity and sales volume</p>
          </div>

          {topDishes.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Utensils className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-semibold">No food sales recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {topDishes.map((dish, i) => (
                <div key={i} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF5722] font-black text-[11px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-bold text-[#201611]">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500 font-semibold">{dish.count} ordered</span>
                    <span className="font-black text-[#FF5722] w-16 text-right">₹{dish.rev}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
