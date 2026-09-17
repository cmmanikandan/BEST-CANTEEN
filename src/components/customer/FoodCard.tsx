'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FoodItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { useCanteen } from '@/context/CanteenContext';
import { useAuth } from '@/context/AuthContext';
import { Star, Plus, Minus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
  food: FoodItem;
}

export function FoodCard({ food }: FoodCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { favorites, toggleFavorite, mealSchedules, effectiveTime } = useCanteen();

  const quantity = getItemQuantity(food.id);
  const isFav = favorites.includes(food.id);

  // Check if meal category is currently open
  const isCategoryOpen = React.useMemo(() => {
    if (food.category === 'snacks') return true;
    const sched = mealSchedules.find((s) => s.id === food.category);
    if (!sched || !sched.isActive) return false;
    if (sched.isAllDay) return true;
    const currentMins = effectiveTime.getHours() * 60 + effectiveTime.getMinutes();
    const [sh, sm] = (sched.startTime || '00:00').split(':').map(Number);
    const [eh, em] = (sched.endTime || '23:59').split(':').map(Number);
    const start = (sh || 0) * 60 + (sm || 0);
    const end = (eh || 0) * 60 + (em || 0);
    return currentMins >= start && currentMins < end;
  }, [food.category, mealSchedules, effectiveTime]);

  const isClosed = !isCategoryOpen || !food.isAvailable;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/customer/menu`);
      return;
    }
    if (isClosed) return;
    addToCart(food, 1);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/customer/menu`);
      return;
    }
    updateQuantity(food.id, quantity - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/customer/menu`);
      return;
    }
    if (isClosed) return;
    updateQuantity(food.id, quantity + 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/customer/menu`);
      return;
    }
    toggleFavorite(food.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-3xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between ${
        isClosed
          ? 'bg-stone-100/90 border-stone-300 grayscale opacity-75'
          : 'bg-white border-stone-200/80 shadow-[0_4px_16px_rgba(32,22,17,0.04)] hover:shadow-[0_10px_25px_rgba(32,22,17,0.08)] hover:border-stone-300'
      }`}
    >
      <Link
        href={user ? `/customer/food/${food.id}` : `/login?redirect=/customer/food/${food.id}`}
        className="block"
      >
        {/* Food Image Container */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3">
          <Image
            src={food.imageUrl}
            alt={food.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-300 ${
              isClosed ? 'grayscale contrast-75' : 'group-hover:scale-105'
            }`}
          />

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
            <div
              className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                food.isVeg ? 'border-[#16A34A]' : 'border-red-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  food.isVeg ? 'bg-[#16A34A]' : 'bg-red-600'
                }`}
              />
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-stone-600 hover:text-red-500 shadow-sm transition active:scale-90"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-4 h-4 ${
                isFav ? 'fill-red-500 text-red-500' : 'text-stone-600'
              }`}
            />
          </button>

          {/* Overlay for Unavailable / Closed */}
          {isClosed && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
              <span className="bg-white/95 text-[#201611] text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-bold text-sm sm:text-base text-[#201611] group-hover:text-[#FF5722] transition-colors line-clamp-1">
              {food.name}
            </h3>
            {food.rating && (
              <div className="flex items-center gap-1 bg-[#FFF9F3] border border-orange-100 px-1.5 py-0.5 rounded-lg text-xs font-bold text-[#FF5722] shrink-0">
                <Star className="w-3 h-3 fill-[#FF5722] text-[#FF5722]" />
                <span>{food.rating}</span>
              </div>
            )}
          </div>

          {food.tamilName && (
            <p className="text-[11px] text-[#8C7E76] font-medium mt-0.5">
              {food.tamilName}
            </p>
          )}
        </div>
      </Link>

      {/* Bottom Bar: Price & Action */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
        <div>
          <span className="text-base font-extrabold text-[#201611]">
            ₹{food.price}
          </span>
          {food.originalPrice && food.originalPrice > food.price && (
            <span className="text-xs text-stone-400 line-through ml-1.5 font-medium">
              ₹{food.originalPrice}
            </span>
          )}
        </div>

        {/* Quantity Controls / Add Button */}
        {quantity > 0 && !isClosed ? (
          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-orange-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={handleMinus}
              className="w-6 h-6 rounded-xl bg-white text-[#FF5722] hover:bg-orange-50 flex items-center justify-center transition shadow-xs active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-[#201611] px-1 min-w-[14px] text-center">
              {quantity}
            </span>
            <button
              onClick={handlePlus}
              className="w-6 h-6 rounded-xl bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center transition shadow-xs active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isClosed}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95 ${
              !isClosed
                ? 'bg-orange-50 text-[#FF5722] border border-orange-200 hover:bg-[#FF5722] hover:text-white'
                : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
            }`}
          >
            {!isClosed ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            ) : (
              <span>Not Available</span>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
