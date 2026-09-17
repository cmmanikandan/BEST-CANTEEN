'use client';

import React from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { useAuth } from '@/context/AuthContext';
import { FoodCard } from '@/components/customer/FoodCard';
import { Heart, ArrowRight, Lock } from 'lucide-react';

export default function CustomerFavoritesPage() {
  const { user, isLoaded } = useAuth();
  const { foods, favorites } = useCanteen();

  if (!isLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#201611]">Login Required</h2>
        <p className="text-xs text-[#5C4E46]">Please log in to your account to view your saved favorite dishes.</p>
        <Link
          href="/login?redirect=/customer/favorites"
          className="inline-block px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  const favoriteFoods = foods.filter((f) => favorites.includes(f.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight flex items-center gap-2">
          <span>Favorites</span>
          <Heart className="w-6 h-6 fill-red-500 text-red-500" />
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
          Your saved dishes for rapid one-tap ordering
        </p>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#201611]">No favorites yet</h3>
          <p className="text-xs text-[#5C4E46] max-w-xs mx-auto">
            Tap the heart icon on any dish card to save it here for fast reordering.
          </p>
          <div className="pt-1">
            <Link
              href="/customer/menu"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-xl"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {favoriteFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
