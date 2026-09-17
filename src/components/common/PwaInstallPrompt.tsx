'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone (PWA installed) mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true)
    ) {
      setIsStandalone(true);
      return;
    }

    // 2. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Best Canteen PWA Service Worker active.'))
        .catch((err) => console.log('ServiceWorker registration notice:', err));
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show immediately if user recently dismissed
      const dismissed = localStorage.getItem('bc_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback hint for iOS Safari or unsupported browsers
      alert(
        'To install Best Canteen:\n• On iPhone: Tap the Share button and select "Add to Home Screen".\n• On Android/Desktop: Click the install icon in the browser address bar.'
      );
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User installed Best Canteen PWA');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('bc_pwa_dismissed', 'true');
    } catch {}
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-slideUp">
      <div className="bg-[#201611] text-white p-4 rounded-3xl shadow-2xl border border-stone-700/80 flex items-center gap-3.5 backdrop-blur-md">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 bg-white border border-stone-200 shadow-sm">
          <Image src="/pwa-icon-192.png" alt="Best Canteen" fill className="object-contain p-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-xs text-white truncate">Install Best Canteen App</h4>
            <span className="text-[10px] bg-[#FF5722] text-white font-black px-1.5 py-0.2 rounded uppercase">PWA</span>
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5 leading-tight truncate">
            Fast 1-tap ordering & offline QR tokens
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-[#FF5722] hover:bg-[#F4511E] active:scale-95 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
