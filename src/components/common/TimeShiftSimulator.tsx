'use client';

import React, { useState } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { useAuth } from '@/context/AuthContext';
import { Clock, UserCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function TimeShiftSimulator() {
  const { simulatedTime, setSimulatedTime, currentTimeStr, activeMealInfo } = useCanteen();
  const { role, loginAs } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="Simulator & quick switch bar" className="bg-[#201611] text-[#EFEAE0] text-xs px-3 py-1.5 border-b border-[#3D2E26] sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smart Meal Engine:</span>
          </span>
          <span className="bg-[#2E211A] px-2 py-0.5 rounded text-white font-semibold">
            {activeMealInfo.icon} {activeMealInfo.name}
          </span>
          <span className="text-stone-400 hidden md:inline">({activeMealInfo.statusText})</span>
          <span className="text-stone-400">Clock: <span className="text-white font-mono">{currentTimeStr}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-stone-300 hover:text-white bg-[#2E211A] px-2 py-0.5 rounded transition"
          >
            <Clock className="w-3 h-3 text-orange-400" />
            <span className="hidden sm:inline">Time Shift & Roles</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Quick role badges */}
          <div className="hidden lg:flex items-center gap-1 bg-[#1A120E] p-0.5 rounded">
            <Link
              href="/customer/home"
              onClick={() => loginAs('customer')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                role === 'customer' ? 'bg-orange-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Student
            </Link>
            <Link
              href="/server/dashboard"
              onClick={() => loginAs('server')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                role === 'server' ? 'bg-orange-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Server Counter
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => loginAs('admin')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                role === 'admin' ? 'bg-orange-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div className="max-w-7xl mx-auto pt-2 pb-1 border-t border-[#38281F] mt-1.5 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-400 font-medium">Test Meal Timings:</span>
            <button
              onClick={() => setSimulatedTime('08:30')}
              className={`px-2 py-1 rounded text-[11px] transition ${
                simulatedTime === '08:30' ? 'bg-orange-600 text-white font-bold' : 'bg-[#2E211A] text-stone-300 hover:bg-[#3D2E26]'
              }`}
            >
              🌅 08:30 AM (Breakfast)
            </button>
            <button
              onClick={() => setSimulatedTime('13:15')}
              className={`px-2 py-1 rounded text-[11px] transition ${
                simulatedTime === '13:15' ? 'bg-orange-600 text-white font-bold' : 'bg-[#2E211A] text-stone-300 hover:bg-[#3D2E26]'
              }`}
            >
              ☀️ 01:15 PM (Lunch)
            </button>
            <button
              onClick={() => setSimulatedTime('17:00')}
              className={`px-2 py-1 rounded text-[11px] transition ${
                simulatedTime === '17:00' ? 'bg-orange-600 text-white font-bold' : 'bg-[#2E211A] text-stone-300 hover:bg-[#3D2E26]'
              }`}
            >
              🍪 05:00 PM (Snacks)
            </button>
            <button
              onClick={() => setSimulatedTime('20:00')}
              className={`px-2 py-1 rounded text-[11px] transition ${
                simulatedTime === '20:00' ? 'bg-orange-600 text-white font-bold' : 'bg-[#2E211A] text-stone-300 hover:bg-[#3D2E26]'
              }`}
            >
              🌙 08:00 PM (Dinner)
            </button>
            <button
              onClick={() => setSimulatedTime(null)}
              className={`px-2 py-1 rounded text-[11px] transition ${
                simulatedTime === null ? 'bg-green-700 text-white font-bold' : 'bg-[#2E211A] text-stone-400 hover:bg-[#3D2E26]'
              }`}
            >
              ⏰ Live Clock
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-400 font-medium">Quick Nav:</span>
            <Link href="/" className="text-orange-400 hover:underline">Marketing Landing</Link>
            <span className="text-stone-600">·</span>
            <Link href="/splash" className="text-orange-400 hover:underline">Splash Screen</Link>
            <span className="text-stone-600">·</span>
            <Link href="/login" className="text-orange-400 hover:underline">Login Screen</Link>
          </div>
        </div>
      )}
    </aside>
  );
}
