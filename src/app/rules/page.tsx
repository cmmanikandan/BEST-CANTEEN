'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Utensils, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function CanteenRulesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#201611]">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <BrandLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-[#FF5722] rounded-full text-xs font-bold">
            <Utensils className="w-3.5 h-3.5" />
            <span>Campus Dining Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#201611]">
            Canteen Rules & Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46]">
            Best Canteen Food Counter Standards & Hygiene Policy
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm leading-relaxed text-[#5C4E46]">
          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF5722]" />
              1. Meal Service Schedules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/80">
                <span className="font-bold text-xs text-[#201611] block">🌅 Breakfast</span>
                <span className="text-xs text-[#FF5722] font-semibold">07:00 AM – 11:30 AM</span>
                <p className="text-[11px] text-stone-400 mt-0.5">Fresh Idli, Dosa, Pongal, Vada & Filter Coffee</p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/80">
                <span className="font-bold text-xs text-[#201611] block">☀️ Lunch</span>
                <span className="text-xs text-[#FF5722] font-semibold">11:30 AM – 03:30 PM</span>
                <p className="text-[11px] text-stone-400 mt-0.5">South Indian Meals, Variety Rice & Curd Rice</p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/80">
                <span className="font-bold text-xs text-[#201611] block">🍪 Snacks & Beverages</span>
                <span className="text-xs text-[#FF5722] font-semibold">All Day Service</span>
                <p className="text-[11px] text-stone-400 mt-0.5">Hot Samosas, Puffs, Tea & Cool Drinks</p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/80">
                <span className="font-bold text-xs text-[#201611] block">🌙 Dinner</span>
                <span className="text-xs text-[#FF5722] font-semibold">06:30 PM – 10:30 PM</span>
                <p className="text-[11px] text-stone-400 mt-0.5">Hot Chapatis, Parottas, Dosa & Curries</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5722]" />
              2. Counter Etiquette & Collection
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Have your token ready:</strong> Keep your mobile screen brightness readable so the counter staff scanner can read the QR code quickly.</li>
              <li><strong>Queue Discipline:</strong> Follow designated counter queues for Express Beverage vs. Food Plate collection.</li>
              <li><strong>Clean As You Go (CAYG):</strong> Kindly return used trays and plates to the disposal counter to maintain a spotless dining environment for all peers.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF5722]" />
              3. Hygiene & Food Safety Standards
            </h2>
            <p>
              All our cooks and service personnel follow FSSAI guidelines, wearing protective hairnets and gloves during preparation and serving.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-[#8C7E76]">
          <p>© 2026 Best Canteen. Good Food · Brighter Days.</p>
          <Link href="/customer/home" className="font-bold text-[#FF5722] hover:underline">
            Go to Menu & Order →
          </Link>
        </div>
      </main>
    </div>
  );
}
