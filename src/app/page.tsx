'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  QrCode,
  CreditCard,
  Utensils,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function LandingPage() {
  const { foods, activeMealInfo } = useCanteen();

  const steps = [
    {
      step: '01',
      title: 'Choose',
      desc: 'Browse fresh morning tiffin, lunch meals, evening snacks, and drinks.',
      icon: Utensils,
    },
    {
      step: '02',
      title: 'Pay Securely',
      desc: 'Pay in seconds with Razorpay via UPI (GPay/PhonePe), cards, or netbanking.',
      icon: CreditCard,
    },
    {
      step: '03',
      title: 'Get QR Token',
      desc: 'Instant cryptographic digital food token generated on your phone screen.',
      icon: QrCode,
    },
    {
      step: '04',
      title: 'Collect Food',
      desc: 'Show QR at the counter. Server scans and serves your steaming hot food.',
      icon: CheckCircle2,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#201611]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] md:h-[82px] flex items-center justify-between gap-4">
          {/* Official Best Canteen Logo Container */}
          <Link
            href="/"
            className="flex items-center py-1 group focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 rounded-xl transition-transform hover:scale-[1.01]"
            aria-label="Best Canteen Home"
          >
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-sm font-semibold text-[#5C4E46]">
            <a href="#how-it-works" className="hover:text-[#FF5722] transition-colors py-1">How It Works</a>
            <Link href="/login?redirect=/customer/menu" className="hover:text-[#FF5722] transition-colors py-1">Menu</Link>
            <a href="#stats" className="hover:text-[#FF5722] transition-colors py-1">Campus Features</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 md:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-[#5C4E46] hover:text-[#201611] px-3.5 py-2.5 rounded-xl transition hover:bg-stone-100/70"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_4px_16px_rgba(255,87,34,0.3)] transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Right: Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Order Now
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#201611] hover:text-[#FF5722] hover:bg-stone-100 rounded-xl transition"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-[#FDFBF7] border-b border-stone-200 px-6 py-5 shadow-xl space-y-4 animate-fadeIn">
            <nav className="flex flex-col space-y-2.5 font-bold text-sm text-[#201611]">
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-[#FF5722] border-b border-stone-100"
              >
                How It Works
              </a>
              <a
                href="#menu-preview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-[#FF5722] border-b border-stone-100"
              >
                Menu Preview
              </a>
              <a
                href="#stats"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-[#FF5722] border-b border-stone-100"
              >
                Campus Stats
              </a>
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-[#5C4E46] border border-stone-200 rounded-xl bg-white"
              >
                Log in
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-[#FF5722] text-white text-center text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-[#FF5722] text-xs font-bold border border-orange-200 shadow-2xs">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Campus Canteen Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#201611] tracking-tight leading-[1.1]">
                Good Food · <br />
                <span className="text-[#FF5722]">Brighter Days</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5C4E46] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Order your favourite canteen meals online, pay securely with Razorpay,
                receive an instant digital QR token, and pick up your piping hot food with zero token queue.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_8px_25px_rgba(255,87,34,0.35)] transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Start Ordering</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-stone-50 border border-stone-200 text-[#201611] font-bold text-sm sm:text-base rounded-2xl shadow-2xs transition flex items-center justify-center gap-2"
                >
                  <span>Login</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              </div>

              {/* Active Serving Live Pill */}
              <div className="pt-2 inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-stone-200/80 shadow-2xs text-xs font-semibold text-[#201611]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>{activeMealInfo.icon} {activeMealInfo.name} Menu is live right now · {activeMealInfo.statusText}</span>
              </div>
            </div>

            {/* Right Hero Visual: Authentic Chicken Biryani Hero Card */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[500px] aspect-square rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(32,22,17,0.16)] group">
                {/* Hero Biryani Image — No visible border */}
                <Image
                  src="/hero-biryani.png"
                  alt="Authentic Chicken Biryani"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                />

                {/* Subtle natural lighting vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Top Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-black text-[#201611]">
                  <span className="text-amber-500">★</span>
                  <span>4.7</span>
                  <span className="text-[10px] text-stone-400 font-medium">(500+)</span>
                </div>

                {/* Bottom Floating Translucent Information Panel */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">⚡</span>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#201611] truncate">
                        Smart Canteen Token System
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#5C4E46] mt-0.5 truncate font-medium">
                      Instant Digital QR Tokens · Fast Collection
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-[0_4px_15px_rgba(255,87,34,0.35)] transition flex items-center gap-1 active:scale-95 shrink-0"
                  >
                    <span>Order Now</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Section */}
      <section id="stats" className="py-12 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-[#FF5722]">Instant</p>
              <p className="text-xs sm:text-sm font-bold text-[#201611]">QR Food Tokens</p>
              <p className="text-[11px] text-[#8C7E76]">Generated on payment</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-[#FF5722]">Live</p>
              <p className="text-xs sm:text-sm font-bold text-[#201611]">Meal Schedules</p>
              <p className="text-[11px] text-[#8C7E76]">Breakfast to dinner</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-[#16A34A]">Direct</p>
              <p className="text-xs sm:text-sm font-bold text-[#201611]">Counter Collection</p>
              <p className="text-[11px] text-[#8C7E76]">Fast token scanning</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-[#201611]">100%</p>
              <p className="text-xs sm:text-sm font-bold text-[#201611]">Cashless Billing</p>
              <p className="text-[11px] text-[#8C7E76]">Powered by Razorpay</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-bold text-[#FF5722] uppercase tracking-wider">
            Simple 4-Step Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#201611] tracking-tight">
            How Best Canteen Works
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4E46]">
            Say goodbye to paper tokens and long queues. Everything is handled digitally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition relative group"
              >
                <span className="text-3xl font-black text-stone-200 group-hover:text-orange-200 transition">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5722] flex items-center justify-center my-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#201611] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5C4E46] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu CTA Section (Requires Login to View) */}
      <section className="py-16 bg-[#FAF8F5] border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#FF5722] uppercase tracking-wider">
              Fresh & Affordable Canteen Food
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight">
              Ready to Taste Campus Specials?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4E46] max-w-lg mx-auto">
              Sign in to explore the live 50+ dishes menu, customize meals, and generate instant digital collection QR tokens.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?redirect=/customer/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_8px_25px_rgba(255,87,34,0.35)] transition active:scale-95"
            >
              <span>Explore Full 50+ Items Menu</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#201611] text-[#EFEAE0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800 pb-8">
            <Link href="/" className="transition-opacity hover:opacity-90">
              <BrandLogo size="md" variant="white" />
            </Link>
            <div className="flex items-center gap-6 text-xs font-semibold text-stone-300">
              <Link href="/privacy" className="hover:text-[#FF5722] transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#FF5722] transition">
                Terms of Service
              </Link>
              <Link href="/rules" className="hover:text-[#FF5722] transition">
                Canteen Rules
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <p>© {new Date().getFullYear()} Best Canteen. All rights reserved.</p>
            <p className="text-stone-500">Good Food · Brighter Days · Cashless Canteen Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
