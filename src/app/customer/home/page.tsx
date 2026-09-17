'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCanteen } from '@/context/CanteenContext';
import { Order, MealCategory } from '@/types';
import { getGreeting } from '@/lib/utils';
import { ActiveMealBanner } from '@/components/customer/ActiveMealBanner';
import { MealCategoryPills } from '@/components/customer/MealCategoryPills';
import { FoodCard } from '@/components/customer/FoodCard';
import { Search, Sparkles, Flame, Clock, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { QrTokenModal } from '@/components/customer/QrTokenModal';

export default function CustomerHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { foods, activeMealInfo, effectiveTime, orders } = useCanteen();

  React.useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('all');
  const [selectedOrderForQr, setSelectedOrderForQr] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const greeting = useMemo(() => {
    return getGreeting(effectiveTime.getHours());
  }, [effectiveTime]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  if (!user) {
    return null;
  }

  // Visible foods only
  const visibleFoods = useMemo(() => {
    return foods.filter((f) => f.isVisible);
  }, [foods]);

  // Filtered by selected category
  const filteredFoods = useMemo(() => {
    if (selectedCategory === 'all') return visibleFoods;
    return visibleFoods.filter(
      (f) =>
        f.category === selectedCategory ||
        (Array.isArray(f.availableMeals) && f.availableMeals.includes(selectedCategory))
    );
  }, [visibleFoods, selectedCategory]);

  // Popular items
  const popularFoods = useMemo(() => {
    return visibleFoods.filter((f) => f.isPopular);
  }, [visibleFoods]);

  // Current meal items
  const currentMealFoods = useMemo(() => {
    return visibleFoods.filter(
      (f) =>
        f.category === activeMealInfo.category ||
        (Array.isArray(f.availableMeals) && f.availableMeals.includes(activeMealInfo.category))
    );
  }, [visibleFoods, activeMealInfo.category]);

  // Snacks items (all day)
  const snacksFoods = useMemo(() => {
    return visibleFoods.filter(
      (f) =>
        f.category === 'snacks' ||
        (Array.isArray(f.availableMeals) && f.availableMeals.includes('snacks'))
    );
  }, [visibleFoods]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
      {/* 1. Greeting & Search Card Style */}
      <section className="bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFF3E8] border border-orange-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(255,87,34,0.06)] relative overflow-hidden">
        {/* Decorative subtle ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-200/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider bg-orange-100/90 px-2.5 py-0.5 rounded-full">
                  Best Canteen
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201611] tracking-tight flex items-center gap-2 mt-1">
                <span>{greeting}, {firstName}</span>
                <span className="text-2xl">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
                What are you having today? Fresh dishes ready at the counter.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7]/90 px-3.5 py-2 rounded-2xl self-start sm:self-auto border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digital QR Token Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Current Meal Banner */}
      <section>
        <ActiveMealBanner />
      </section>

      {/* 3. Meal Category Horizontal Scrolling Pills */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#201611] uppercase tracking-wider">
            Explore Categories
          </h2>
          <Link
            href="/customer/menu"
            className="text-xs font-semibold text-[#FF5722] hover:underline flex items-center gap-1"
          >
            <span>Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <MealCategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* If a category other than 'all' is picked, show its list */}
      {selectedCategory !== 'all' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#201611] capitalize flex items-center gap-2">
              <span>{selectedCategory} Items</span>
              <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {filteredFoods.length}
              </span>
            </h2>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-[#FF5722] hover:underline"
            >
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </section>
      )}

      {/* Default Sections when 'all' is selected */}
      {selectedCategory === 'all' && (
        <>
          {/* 4. CURRENT ACTIVE MEAL MENU (e.g. Lunch or Breakfast right now) - Shown First! */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeMealInfo.icon}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#201611]">
                    {activeMealInfo.name} Menu · Now Serving
                  </h2>
                  <p className="text-xs text-[#5C4E46]">{activeMealInfo.statusText}</p>
                </div>
              </div>
              <Link
                href="/customer/menu"
                className="text-xs font-semibold text-[#FF5722] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {currentMealFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </section>

          {/* 5. Popular Food Section */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-[#FF5722]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#201611]">
                    Popular Right Now
                  </h2>
                  <p className="text-xs text-[#5C4E46]">Most loved by students</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </section>

          {/* 6. Snacks — Available All Day */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#201611]">
                    Snacks & Beverages
                  </h2>
                  <p className="text-xs text-[#5C4E46]">Freshly made and available all day</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {snacksFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </section>

          {/* 7. Quick Reorder / Recent Orders */}
          {orders.length > 0 && (
            <section className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#201611]">
                      My Recent Tokens
                    </h2>
                    <p className="text-xs text-[#5C4E46]">Quick collection status</p>
                  </div>
                </div>
                <Link
                  href="/customer/orders"
                  className="text-xs font-semibold text-[#FF5722] hover:underline"
                >
                  My Tokens →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orders.slice(0, 2).map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#201611]">
                          Token #{ord.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.orderStatus === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'SERVED'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {ord.orderStatus === 'READY' || ord.orderStatus === 'PAID'
                            ? '🟢 Active'
                            : ord.orderStatus === 'SERVED'
                            ? 'Served'
                            : ord.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C4E46] mt-1 line-clamp-1">
                        {ord.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    {ord.orderStatus !== 'SERVED' ? (
                      <button
                        onClick={() => setSelectedOrderForQr(ord)}
                        className="px-3.5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition shrink-0 ml-2"
                      >
                        <QrCode className="w-3.5 h-3.5 text-white" />
                        <span>QR Token</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-stone-100 text-stone-500 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 ml-2">
                        ✓ Served
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* QR Token Pop-up Modal */}
      <QrTokenModal
        order={selectedOrderForQr}
        onClose={() => setSelectedOrderForQr(null)}
      />

      {/* 8. Footer supporting info */}
      <footer className="pt-6 pb-4 border-t border-stone-200 text-center space-y-2">
        <p className="text-xs font-semibold text-[#8C7E76] uppercase tracking-wider">
          Best Canteen · Good Food · Brighter Days
        </p>
        <p className="text-[11px] text-stone-400">
          Canteen Food Counter · Cashless & Contactless Token System
        </p>
      </footer>
    </div>
  );
}
