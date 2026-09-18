'use client';

import React from 'react';
import { MealCategory } from '@/types';
import { useCanteen } from '@/context/CanteenContext';
import { formatTime12h, parseMinutes } from '@/lib/utils';

interface MealCategoryPillsProps {
  selectedCategory: MealCategory;
  onSelectCategory: (category: MealCategory) => void;
}

export function MealCategoryPills({
  selectedCategory,
  onSelectCategory,
}: MealCategoryPillsProps) {
  const { mealSchedules, effectiveTime } = useCanteen();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentMins = effectiveTime.getHours() * 60 + effectiveTime.getMinutes();

  const categories: { id: MealCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Items', icon: '🍽️' },
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'snacks', label: 'Snacks', icon: '🍪' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
  ];

  const getMealStatusBadge = (catId: MealCategory) => {
    if (!mounted || catId === 'all') return null;
    const schedule = mealSchedules.find((m) => m.id === catId);
    if (!schedule) return null;

    if (schedule.isAllDay) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
          All Day
        </span>
      );
    }

    const start = parseMinutes(schedule.startTime || '00:00');
    const end = parseMinutes(schedule.endTime || '23:59');

    if (currentMins >= start && currentMins < end) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Serving
        </span>
      );
    }

    if (currentMins < start) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium">
          Starts {formatTime12h(schedule.startTime || '00:00')}
        </span>
      );
    }

    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 font-medium">
        Closed
      </span>
    );
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-0.5">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const statusBadge = getMealStatusBadge(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              isSelected
                ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-[0_4px_12px_rgba(255,87,34,0.25)]'
                : 'bg-white text-[#5C4E46] border-stone-200/80 hover:border-stone-300 hover:bg-[#FDFBF7]'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
            {!isSelected && statusBadge}
          </button>
        );
      })}
    </div>
  );
}
