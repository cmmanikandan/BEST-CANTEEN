import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CanteenProvider } from '@/context/CanteenContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Best Canteen — Good Food · Brighter Days',
  description: 'Digital campus canteen ordering platform with instant Razorpay payments, smart meal timing, and digital QR tokens.',
  manifest: '/manifest.json',
  icons: {
    icon: '/pwa-icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF5722',
};

import { AppInitializer } from '@/components/splash/AppInitializer';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] text-[#201611] antialiased selection:bg-orange-100 selection:text-orange-900">
        <AuthProvider>
          <CanteenProvider>
            <CartProvider>
              <AppInitializer />
              <PwaInstallPrompt />
              <main className="min-h-screen flex flex-col">
                {children}
              </main>
            </CartProvider>
          </CanteenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
