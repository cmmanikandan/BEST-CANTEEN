'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function TermsOfServicePage() {
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
            <FileCheck className="w-3.5 h-3.5" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#201611]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46]">
            Effective Date: September 17, 2026 · Best Canteen
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm leading-relaxed text-[#5C4E46]">
          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5722]" />
              1. Digital Token Issuance & Redemption
            </h2>
            <p>
              Best Canteen operates strictly on a digital token system. Once a payment is verified, a secure single-use QR token is generated.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Single-Use Validation:</strong> Each QR token can only be scanned and redeemed once at the counter.</li>
              <li><strong>Duplicate Prevention:</strong> Any secondary attempt to scan an already-served token will be rejected by the counter staff terminal.</li>
              <li><strong>Expiry:</strong> Tokens are valid during the designated meal service hours on the date of issuance.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF5722]" />
              2. Cancellations & Counter Availability
            </h2>
            <p>
              Food preparation begins shortly after token generation to ensure meals are served piping hot.
            </p>
            <p>
              If a dish becomes unavailable due to unexpected ingredient exhaustion, the canteen counter will provide an immediate alternative or process an administrative credit voucher.
            </p>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#FF5722]" />
              3. User Responsibilities
            </h2>
            <p>
              Customers must keep their account credentials secure and present their own active QR token upon counter pickup.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-[#8C7E76]">
          <p>© 2026 Best Canteen. All rights reserved.</p>
          <Link href="/rules" className="font-bold text-[#FF5722] hover:underline">
            View Canteen Rules & Guidelines →
          </Link>
        </div>
      </main>
    </div>
  );
}
