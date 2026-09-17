'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCanteen } from '@/context/CanteenContext';
import { FoodCard } from '@/components/customer/FoodCard';
import { Search, X, TrendingUp, History } from 'lucide-react';

function CustomerSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { foods } = useCanteen();
  const [query, setQuery] = useState(initialQuery);

  const trendingTags = [
    'Curd Rice',
    'Medu Vadai',
    'Veg Meals',
    'Ghee Roast',
    'Biryani',
    'Filter Coffee',
    'Samosa',
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return foods.filter(
      (f) =>
        f.isVisible &&
        (f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.tamilName && f.tamilName.includes(q)) ||
          f.ingredients?.some((ing) => ing.toLowerCase().includes(q)))
    );
  }, [foods, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#201611] tracking-tight">
          Search Food
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
          Find your favorite canteen snacks, meals, and beverages
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type dish name, e.g. Curd Rice, Samosa, Dosa..."
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm sm:text-base text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] shadow-xs"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trending Searches */}
      {!query && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C4E46] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-[#FF5722]" />
            <span>Popular Campus Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3.5 py-2 bg-white border border-stone-200 hover:border-[#FF5722] hover:text-[#FF5722] rounded-xl text-xs font-semibold text-[#201611] shadow-2xs transition active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-[#201611] mb-3">All Popular Dishes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {foods
                .filter((f) => f.isVisible && f.isPopular)
                .slice(0, 4)
                .map((food) => (
                  <FoodCard key={food.id} food={food} />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#5C4E46]">
            <span>
              Found <strong className="text-[#201611]">{results.length}</strong> items for &quot;{query}&quot;
            </span>
            <button
              onClick={() => setQuery('')}
              className="text-[#FF5722] font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <p className="text-4xl">🔍</p>
              <h3 className="font-bold text-base text-[#201611]">No matches found</h3>
              <p className="text-xs text-[#5C4E46] max-w-sm mx-auto">
                We couldn&apos;t find anything matching &quot;{query}&quot;. Try checking for Dosa, Idli, Meals, or Coffee.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {results.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerSearchPage() {
  return (
    <React.Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-stone-400 font-semibold text-sm">Loading search...</div>}>
      <CustomerSearchContent />
    </React.Suspense>
  );
}
