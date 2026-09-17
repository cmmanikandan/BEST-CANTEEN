'use client';

import React, { useState } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { Plus, Edit2, Trash2, Clock, X, Check } from 'lucide-react';

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  snacks: '🍪',
  dinner: '🌙',
};

export default function AdminCategoriesPage() {
  const { mealSchedules, updateMealSchedule } = useCanteen();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState('');
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const openEdit = (cat: typeof mealSchedules[0]) => {
    setEditingId(cat.id);
    setEditIcon(cat.icon);
    setEditName(cat.name);
    setEditStart(cat.startTime || '');
    setEditEnd(cat.endTime || '');
  };

  const handleSave = () => {
    if (!editingId) return;
    updateMealSchedule(editingId, {
      icon: editIcon,
      name: editName,
      startTime: editStart,
      endTime: editEnd,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Edit meal categories, timings, and icons
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mealSchedules.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative group">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{cat.icon}</span>
              <button
                onClick={() => openEdit(cat)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-xl bg-stone-100 hover:bg-orange-50 text-stone-500 hover:text-[#FF5722] transition"
                aria-label={`Edit ${cat.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#201611]">{cat.name}</h3>
              <p className="text-xs text-[#8C7E76] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {cat.isAllDay ? 'All Day' : `${cat.startTime} – ${cat.endTime}`}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-[#16A34A] px-2 py-0.5 rounded-full inline-block">
              Active
            </span>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl animate-scaleUp overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#201611]">Edit Category</h3>
              <button onClick={() => setEditingId(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Category Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

