'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function CustomerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Digital QR Token work?',
      a: 'After ordering and paying via Razorpay, a unique digital QR token is generated. When your order is ready, simply present the QR screen to the counter staff. The server scans it, verifies the items on their screen, and serves your fresh meal instantly!',
    },
    {
      q: 'What happens if a token is scanned more than once?',
      a: 'Our canteen system has built-in Duplicate Token Protection. Once an order is served, the token is permanently flagged as SERVED. Any subsequent attempt to scan will immediately show an alert: "ORDER ALREADY SERVED".',
    },
    {
      q: 'Can I cancel an order after payment?',
      a: 'Since our kitchen staff begins fresh preparation immediately upon payment confirmation, orders cannot be automatically cancelled via the app. Please visit the Canteen Counter for assistance.',
    },
    {
      q: 'What are the canteen operating hours?',
      a: 'Breakfast: 7:00 AM – 11:30 AM | Lunch: 11:30 AM – 3:30 PM | Snacks & Beverages: All Day | Dinner: 6:30 PM – 10:30 PM.',
    },
  ];

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
            Help & Support
          </h1>
          <p className="text-xs text-[#5C4E46]">
            Frequently asked questions and canteen counter assistance
          </p>
        </div>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Counter Hotline</p>
            <p className="text-sm font-bold text-[#201611]">+91 44 2254 0000</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium">Support Email</p>
            <p className="text-sm font-bold text-[#201611]">canteen@college.edu</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider mb-2">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-stone-100">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#201611] hover:text-[#FF5722] transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-[#5C4E46] mt-2 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
