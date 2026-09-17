'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#201611]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46]">
            Last updated: September 17, 2026 · Best Canteen Food Counter Systems
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm leading-relaxed text-[#5C4E46]">
          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF5722]" />
              1. Information We Collect
            </h2>
            <p>
              When you use Best Canteen, we collect essential information required to issue your digital food tokens and process orders:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Profile:</strong> Full name, college email address, and mobile number.</li>
              <li><strong>Order Data:</strong> Dishes selected, token numbers, order timestamps, and collection status.</li>
              <li><strong>Payment Records:</strong> Transaction IDs from authorized gateways (e.g. Razorpay). We never store your full card details or UPI PINs.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FF5722]" />
              2. How Your Data Is Protected
            </h2>
            <p>
              Each token QR code is cryptographically hashed with token IDs to prevent unauthorized duplication or counter tampering.
            </p>
            <p>
              Our database is protected by end-to-end encryption in transit (HTTPS/TLS) and strict role-based access control ensuring counter servers only see active token validation data.
            </p>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#201611] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF5722]" />
              3. Data Retention & Your Rights
            </h2>
            <p>
              You maintain full ownership of your data. You can delete your account and associated token history at any time from your Customer Profile settings.
            </p>
            <p>
              For any privacy inquiries or records clearance, contact our administrative counter desk at <span className="font-semibold text-[#201611]">canteen.admin@college.edu</span>.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-[#8C7E76]">
          <p>© 2026 Best Canteen. All rights reserved.</p>
          <Link href="/terms" className="font-bold text-[#FF5722] hover:underline">
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
