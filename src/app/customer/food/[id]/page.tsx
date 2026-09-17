'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCanteen } from '@/context/CanteenContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  Heart,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { foods, favorites, toggleFavorite } = useCanteen();
  const { addToCart, getItemQuantity } = useCart();

  React.useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/customer/food/${id}`);
    }
  }, [user, router, id]);

  const food = foods.find((f) => f.id === id);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!food) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#201611]">Dish not found</h2>
        <p className="text-sm text-[#5C4E46]">The dish you are looking for might have been removed.</p>
        <Link
          href="/customer/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-xl"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(food.id);

  const handleAddToCart = () => {
    if (!food.isAvailable) return;
    addToCart(food, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  const handleSafeBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/customer/menu');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12 space-y-6">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSafeBack}
          className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] hover:bg-stone-100 flex items-center gap-1.5 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(food.id)}
            className="p-2 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-red-500 shadow-xs transition active:scale-95"
            aria-label="Favorite"
          >
            <Heart
              className={`w-5 h-5 ${
                isFav ? 'fill-red-500 text-red-500' : 'text-stone-600'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left: Large Food Photo */}
        <div className="relative w-full aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200/80">
          <Image
            src={food.imageUrl || '/logo.png'}
            alt={food.name}
            fill
            priority
            unoptimized
            className="object-cover"
          />

          {/* Veg / Non-Veg badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow flex items-center gap-1.5 text-xs font-bold">
            <div
              className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${
                food.isVeg ? 'border-[#16A34A]' : 'border-red-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  food.isVeg ? 'bg-[#16A34A]' : 'bg-red-600'
                }`}
              />
            </div>
            <span className={food.isVeg ? 'text-[#16A34A]' : 'text-red-600'}>
              {food.isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>

          {/* Popular pill */}
          {food.isPopular && (
            <div className="absolute top-4 right-4 bg-[#FF5722] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              Popular Dish
            </div>
          )}
        </div>

        {/* Right: Food Details & Actions */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight">
                {food.name}
              </h1>
              {food.rating && (
                <div className="flex items-center gap-1.5 bg-[#FFF9F3] border border-orange-200 px-2.5 py-1 rounded-xl text-sm font-bold text-[#FF5722]">
                  <Star className="w-4 h-4 fill-[#FF5722] text-[#FF5722]" />
                  <span>{food.rating}</span>
                  <span className="text-xs text-stone-400 font-normal">
                    ({food.ratingCount})
                  </span>
                </div>
              )}
            </div>

            {food.tamilName && (
              <p className="text-sm font-semibold text-[#8C7E76] mt-0.5">
                {food.tamilName}
              </p>
            )}

            {/* Price & Availability */}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#201611]">
                ₹{food.price}
              </div>
              {food.originalPrice && food.originalPrice > food.price && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{food.originalPrice}
                </span>
              )}

              <div className="ml-auto">
                {food.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Available Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-500 border border-stone-200 text-xs font-bold">
                    <XCircle className="w-4 h-4" />
                    Currently Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>


          {/* Specs / Meta */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {food.preparationTime && (
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FF5722]" />
                <div>
                  <p className="text-[11px] text-stone-400">Prep Time</p>
                  <p className="text-xs font-bold text-[#201611]">
                    {food.preparationTime}
                  </p>
                </div>
              </div>
            )}
            {food.calories && (
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-[#FF5722]" />
                <div>
                  <p className="text-[11px] text-stone-400">Energy</p>
                  <p className="text-xs font-bold text-[#201611]">
                    {food.calories}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients list if available */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-[#201611] uppercase tracking-wider mb-2">
                Ingredients & Seasoning
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="text-xs bg-white border border-stone-200 text-[#5C4E46] px-2.5 py-1 rounded-lg"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Quantity & Add to Cart button */}
          <div className="hidden md:flex items-center gap-4 pt-4 border-t border-stone-200">
            <div className="flex items-center bg-[#FAF8F5] border border-stone-200 rounded-2xl p-1 shadow-2xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-white text-stone-700 hover:text-[#FF5722] flex items-center justify-center transition shadow-2xs"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-sm text-[#201611]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-xl bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center transition shadow-2xs"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!food.isAvailable}
              className={`flex-1 py-3 px-6 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,87,34,0.25)] ${
                food.isAvailable
                  ? 'bg-[#FF5722] hover:bg-[#F4511E] text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              {addedAnimation ? (
                <span>✓ Added to Cart</span>
              ) : (
                <span>Add to Cart · ₹{food.price * quantity}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg flex items-center gap-3">
        <div className="flex items-center bg-[#FAF8F5] border border-stone-200 rounded-xl p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg bg-white text-stone-700 flex items-center justify-center"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-bold text-xs text-[#201611]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-8 h-8 rounded-lg bg-[#FF5722] text-white flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!food.isAvailable}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
            food.isAvailable
              ? 'bg-[#FF5722] text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {addedAnimation ? (
            <span>✓ Added to Cart</span>
          ) : (
            <span>Add to Cart · ₹{food.price * quantity}</span>
          )}
        </button>
      </div>
    </div>
  );
}
