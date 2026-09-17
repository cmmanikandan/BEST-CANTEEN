'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCanteen } from '@/context/CanteenContext';
import { Clock, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminMealsPage() {
  const { mealSchedules, updateMealSchedule, activeMealInfo } = useCanteen();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    updateMealSchedule(id, { [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleToggleAllDay = (id: string, current: boolean) => {
    updateMealSchedule(id, { isAllDay: !current });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    updateMealSchedule(id, { isActive: !current });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Smart Meal Schedule Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Configure canteen serving hours. Changes update the customer app immediately.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Updated & Propagated to Customer App!</span>
          </div>
        )}
      </div>

      {/* Live Sync Info Alert */}
      <div className="bg-orange-50/80 border border-orange-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5C4E46] space-y-1">
          <p className="font-bold text-[#201611]">
            Active Serving Meal: <span className="text-[#FF5722] font-black">{activeMealInfo.icon} {activeMealInfo.name}</span>
          </p>
          <p>
            When you adjust start or end times below, the student homepage meal banner and active category pills will recompute immediately based on the new hours.
          </p>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {mealSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-2xl shrink-0">
                {schedule.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#201611]">
                    {schedule.name}
                  </h3>
                  {activeMealInfo.category === schedule.id && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ● Active Now
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C4E46]">
                  {schedule.isAllDay ? 'Serving continuously throughout the day' : `Serving from ${schedule.startTime} to ${schedule.endTime}`}
                </p>
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {!schedule.isAllDay ? (
                <div className="flex items-center gap-2 text-xs">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-stone-400 font-bold block">START TIME</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleTimeChange(schedule.id, 'startTime', e.target.value)}
                      className="px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl font-mono text-xs text-[#201611] font-bold focus:ring-2 focus:ring-[#FF5722]"
                    />
                  </div>
                  <span className="text-stone-300 font-bold self-end mb-1.5">to</span>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-stone-400 font-bold block">END TIME</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleTimeChange(schedule.id, 'endTime', e.target.value)}
                      className="px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl font-mono text-xs text-[#201611] font-bold focus:ring-2 focus:ring-[#FF5722]"
                    />
                  </div>
                </div>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  All Day Service Enabled
                </span>
              )}

              {/* Status Toggle */}
              <button
                onClick={() => handleToggleActive(schedule.id, schedule.isActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  schedule.isActive
                    ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {schedule.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link
          href="/customer/home"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5722] hover:underline"
        >
          <span>View changes on Customer Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
