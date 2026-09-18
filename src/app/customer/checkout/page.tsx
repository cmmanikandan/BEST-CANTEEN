'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCanteen } from '@/context/CanteenContext';
import { ArrowLeft, ShieldCheck, CheckCircle2, QrCode, ShoppingBag, ArrowRight, XCircle, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QrTokenModal } from '@/components/customer/QrTokenModal';
import { Order } from '@/types';
import confetti from 'canvas-confetti';

// ── Easy Toggle: Set to false anytime after Razorpay merchant approval ──
const ENABLE_DEMO_PAY = true;

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { items, total, subtotal, parcelTotal, toOrderItems, clearCart } = useCart();
  const { user, isLoaded } = useAuth();
  const { createOrder, verifyPayment } = useCanteen();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 1. Live Official Razorpay Gateway
  const handleProceedToPayment = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create Razorpay Order on server
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(total),
          receipt: `rcpt_${Date.now()}`,
          notes: {
            userId: user?.id,
            userName: user?.name,
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Could not initiate Razorpay order');
      }

      await loadRazorpayScript();

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_T547lttHOVL633',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Best Canteen',
        description: `Token Payment (₹${total})`,
        image: '/logo new.png',
        order_id: orderData.orderId,
        modal: {
          ondismiss: function () {
            // User closed Razorpay popup without paying
            setIsProcessing(false);
            setPaymentError('Payment was cancelled. No digital token was created.');
          },
        },
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            // Verify payment signature
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // Create verified order ONLY after successful payment
              const orderItems = toOrderItems();
              const newOrder = createOrder(
                orderItems,
                undefined,
                {
                  id: user?.id,
                  name: user?.name,
                  email: 'email' in (user || {}) ? (user as any).email : undefined,
                  avatarUrl: 'avatarUrl' in (user || {}) ? (user as any).avatarUrl : undefined,
                },
                {
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                }
              );

              clearCart();
              setCompletedOrder(newOrder);
              setShowQrModal(true);
              setIsProcessing(false);

              try {
                confetti({
                  particleCount: 90,
                  spread: 75,
                  origin: { y: 0.55 },
                });
              } catch {}
            } else {
              setIsProcessing(false);
              setPaymentError('Payment verification failed. No token was created.');
            }
          } catch {
            setIsProcessing(false);
            setPaymentError('Payment signature error. Please contact canteen counter.');
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: 'email' in (user || {}) ? (user as any).email : 'customer@college.edu',
          contact: '',
        },
        theme: {
          color: '#FF5722',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Payment failed:', resp.error);
        setIsProcessing(false);
        setPaymentError(resp.error?.description || 'Payment was declined. No token was created.');
      });
      rzp.open();
    } catch (err: any) {
      console.warn('Razorpay live gateway notice:', err);
      setIsProcessing(false);
      setPaymentError(
        err?.message || 'Unable to reach Razorpay gateway. Please try again or use Instant Test Pay.'
      );
    }
  };

  // 2. Instant Test Simulation (Creates order ONLY upon success)
  const handleInstantTestPayment = () => {
    setIsProcessing(true);
    setPaymentError(null);
    setTimeout(() => {
      const orderItems = toOrderItems();
      const newOrder = createOrder(
        orderItems,
        undefined,
        {
          id: user?.id,
          name: user?.name,
          email: 'email' in (user || {}) ? (user as any).email : undefined,
          avatarUrl: 'avatarUrl' in (user || {}) ? (user as any).avatarUrl : undefined,
        },
        {
          paymentId: `pay_TEST_${Date.now()}`,
          razorpayOrderId: `order_TEST_${Date.now().toString().slice(-6)}`,
        }
      );

      clearCart();
      setCompletedOrder(newOrder);
      setShowQrModal(true);
      setIsProcessing(false);

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
        });
      } catch {}
    }, 600);
  };

  // ── PAYMENT SUCCESS VIEW ──
  if (completedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-5 animate-fadeIn">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-[#16A34A] text-xs font-black">
              ✓ Payment Verified
            </span>
            <h1 className="text-2xl font-black text-[#201611] tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-xs text-[#5C4E46]">
              Your digital food token is active and ready for canteen pickup.
            </p>
          </div>

          {/* Token ID Box */}
          <div className="bg-[#FAF8F5] border border-orange-200/80 rounded-2xl p-4 text-center space-y-1">
            <p className="text-[11px] font-bold text-[#8C7E76] uppercase tracking-wider">
              Canteen Digital Token
            </p>
            <p className="text-3xl font-black text-[#FF5722] tracking-wider">
              #{completedOrder.id}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-stone-500">
              <span>Amount Paid: <strong className="text-[#201611]">₹{completedOrder.total}</strong></span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">Razorpay Cashless</span>
            </div>
          </div>

          {/* Scannable QR Code */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 inline-block shadow-2xs">
            <QRCodeSVG
              value={completedOrder.qrToken}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-[11px] text-[#5C4E46]">
            Show this QR code at <strong>Counter 1</strong> when collecting food.
          </p>

          {/* Primary View Token (QR) Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="w-full py-3.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,87,34,0.35)] transition active:scale-98"
          >
            <QrCode className="w-4 h-4" />
            <span>View Fullscreen Token QR</span>
          </button>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
            Order Items ({completedOrder.items.length})
          </h2>
          <div className="divide-y divide-stone-100 text-xs sm:text-sm">
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#201611]">{item.name}</span>
                  <span className="text-stone-400 font-bold ml-1.5">× {item.quantity}</span>
                </div>
                <span className="font-bold text-[#201611]">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-2.5 flex justify-between font-extrabold text-sm text-[#201611]">
              <span>Total Paid</span>
              <span className="text-[#FF5722]">₹{completedOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/customer/orders"
            className="py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-[#201611] font-bold text-xs rounded-2xl text-center shadow-2xs transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-stone-500" />
            <span>My Tokens</span>
          </Link>
          <Link
            href="/customer/home"
            className="py-3 px-4 bg-orange-50 hover:bg-orange-100 text-[#FF5722] font-bold text-xs rounded-2xl text-center transition flex items-center justify-center gap-1.5"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Fullscreen QR Token Modal */}
        <QrTokenModal
          order={showQrModal ? completedOrder : null}
          onClose={() => setShowQrModal(false)}
        />
      </div>
    );
  }

  const handleSafeBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/customer/cart');
    }
  };

  // ── CHECKOUT FORM VIEW ──
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSafeBack}
          className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#201611] tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-[#5C4E46]">
            Confirm pickup details and proceed to secure payment
          </p>
        </div>
      </div>

      {/* Student / Customer Info */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-2">
        <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
          Token Recipient
        </h2>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div>
            <p className="font-bold text-[#201611]">{user?.name || 'Customer'}</p>
            <p className="text-[#5C4E46] text-xs">{('email' in (user || {})) ? (user as any).email : ''}</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Verified Student
          </span>
        </div>
      </div>

      {/* Payment Method Preview */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
          Payment Method
        </h2>
        <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0C2340] text-white flex items-center justify-center font-bold text-xs">
              RZP
            </div>
            <div>
              <p className="text-xs font-bold text-[#201611]">Razorpay Secure Checkout</p>
              <p className="text-[11px] text-[#5C4E46]">UPI (GPay, PhonePe, Paytm), Cards & Netbanking</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted</span>
          </span>
        </div>
      </div>

      {/* Order Items Summary List */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
          Order Items ({items.length})
        </h2>
        <div className="divide-y divide-stone-100 text-xs sm:text-sm">
          {items.map(({ food, quantity, isParcel }) => (
            <div key={food.id} className="py-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[#201611] font-semibold">
                  {food.name} <strong className="text-stone-400 font-bold">× {quantity}</strong>
                </span>
                {isParcel && (
                  <span className="ml-2 text-[10px] bg-orange-100 text-[#FF5722] font-black px-1.5 py-0.5 rounded">
                    Parcel 📦
                  </span>
                )}
              </div>
              <span className="font-bold text-[#201611]">
                ₹{(food.price + (isParcel ? 5 : 0)) * quantity}
              </span>
            </div>
          ))}

          {parcelTotal > 0 && (
            <div className="py-2 flex justify-between text-[#5C4E46]">
              <span>📦 Packaging / Parcel Charges</span>
              <span className="font-bold text-[#FF5722]">+₹{parcelTotal}</span>
            </div>
          )}

          <div className="pt-2.5 flex justify-between font-extrabold text-base text-[#201611]">
            <span>Total Payable</span>
            <span className="text-[#FF5722]">₹{total}</span>
          </div>
        </div>
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{paymentError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentError(null)}
            className="text-red-400 hover:text-red-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pay Action CTA */}
      {ENABLE_DEMO_PAY ? (
        <div className="space-y-3">
          <button
            onClick={handleInstantTestPayment}
            disabled={isProcessing}
            className="w-full py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,87,34,0.3)] transition active:scale-[0.99] disabled:opacity-75 text-base"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generating Token...</span>
              </div>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-white" />
                <span>⚡ Demo Pay ₹{total} (Instant Token)</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-stone-500 font-medium">
            ⚡ Demo Payment Active (Razorpay under approval) · Click to instantly generate your digital QR token!
          </p>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              className="text-xs text-stone-400 hover:text-stone-600 font-semibold underline transition"
            >
              Or Open Live Razorpay (Pending Approval)
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleProceedToPayment}
          disabled={isProcessing}
          className="w-full py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,87,34,0.3)] transition active:scale-[0.99] disabled:opacity-75 text-base"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Connecting to Razorpay...</span>
            </div>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Pay ₹{total} via Razorpay</span>
            </>
          )}
        </button>
      )}

      <p className="text-center text-[11px] text-stone-400">
        🔒 Official Best Canteen Token System · Instant Digital Pick-up Token
      </p>
    </div>
  );
}
