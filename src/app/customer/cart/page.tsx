'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CustomerCartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, toggleParcel, clearCart, subtotal, parcelTotal, tax, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl text-[#FF5722]">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#201611]">
          Your cart is empty
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] max-w-sm mx-auto">
          Find something delicious to eat from our campus canteen menu.
        </p>
        <div className="pt-2">
          <Link
            href="/customer/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_4px_15px_rgba(255,87,34,0.3)] transition"
          >
            <span>Browse Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSafeBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/customer/menu');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSafeBack}
            className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#201611] tracking-tight">
              My Cart
            </h1>
            <p className="text-xs text-[#5C4E46]">
              {items.length} {items.length === 1 ? 'item' : 'different items'} selected
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs divide-y divide-stone-100">
        {items.map(({ food, quantity, isParcel }) => (
          <div
            key={food.id}
            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 mt-0.5">
                <Image
                  src={food.imageUrl}
                  alt={food.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#201611] line-clamp-1">
                  {food.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#FF5722]">
                    ₹{food.price} each
                  </span>
                  {isParcel && (
                    <span className="text-[10px] bg-orange-100 text-[#FF5722] font-black px-1.5 py-0.5 rounded-md">
                      +₹5 Parcel
                    </span>
                  )}
                </div>

                {/* Parcel / Takeaway Option Feature */}
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => toggleParcel(food.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      isParcel
                        ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-2xs'
                        : 'bg-stone-50 hover:bg-orange-50 hover:text-[#FF5722] text-stone-600 border-stone-200'
                    }`}
                  >
                    <span>📦</span>
                    <span>{isParcel ? 'Packed as Parcel (₹5)' : 'Takeaway / Parcel? (+₹5)'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-50">
              {/* Quantity Controls */}
              <div className="flex items-center bg-[#FAF8F5] border border-stone-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(food.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:text-[#FF5722] flex items-center justify-center transition shadow-2xs"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-[#201611]">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center transition shadow-2xs"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-sm sm:text-base text-[#201611]">
                  ₹{(food.price + (isParcel ? 5 : 0)) * quantity}
                </span>
                {isParcel && (
                  <p className="text-[10px] text-stone-400 font-medium">incl. ₹{5 * quantity} pack</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-[#8C7E76] uppercase tracking-wider">
          Bill Details
        </h2>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#5C4E46]">
            <span>Item Subtotal</span>
            <span className="font-medium text-[#201611]">₹{subtotal}</span>
          </div>

          {parcelTotal > 0 && (
            <div className="flex justify-between text-[#5C4E46] animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <span>📦 Parcel / Takeaway Charges</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-full">
                  ₹5/item
                </span>
              </span>
              <span className="font-bold text-[#FF5722]">+₹{parcelTotal}</span>
            </div>
          )}

          <div className="flex justify-between text-[#5C4E46]">
            <span>Canteen Service & Digital Token Fee</span>
            <span className="text-[#16A34A] font-bold">FREE</span>
          </div>

          <div className="border-t border-stone-100 pt-2 flex justify-between text-base font-extrabold text-[#201611]">
            <span>To Pay</span>
            <span className="text-[#FF5722]">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="pt-2">
        <Link
          href={user ? "/customer/checkout" : "/login?redirect=/customer/cart"}
          className="w-full py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,87,34,0.3)] transition active:scale-[0.99]"
        >
          <span>{user ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
          <span className="text-white/80">·</span>
          <span>₹{total}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
