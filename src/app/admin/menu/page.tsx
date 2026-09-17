'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useCanteen } from '@/context/CanteenContext';
import { FoodItem, MealCategory } from '@/types';
import {
  Plus, Trash2, Edit2, Eye, EyeOff, Search, X, Upload, FileDown, Leaf, Drumstick, Flame,
} from 'lucide-react';

// ── Tiny toggle switch component ──────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors focus:outline-none ${
        on ? 'bg-[#16A34A]' : 'bg-stone-300'
      }`}
    >
      <span
        className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminMenuPage() {
  const {
    foods, toggleFoodAvailability, toggleFoodVisibility,
    addFoodItem, updateFoodItem, deleteFoodItem,
  } = useCanteen();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<MealCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [price, setPrice] = useState('30');
  const [category, setCategory] = useState<MealCategory>('lunch');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = foods.filter((f) => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setName(''); setTamilName(''); setPrice('30'); setCategory('lunch');
    setDescription('Fresh hot canteen preparation.'); setImageUrl('');
    setImagePreview(''); setIsVeg(true); setIsPopular(false); setEditingFood(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (food: FoodItem) => {
    setEditingFood(food);
    setName(food.name);
    setTamilName(food.tamilName || '');
    setPrice(food.price.toString());
    setCategory(food.category);
    setDescription(food.description);
    setImageUrl(food.imageUrl);
    setImagePreview(food.imageUrl);
    setIsVeg(food.isVeg);
    setIsPopular(!!food.isPopular);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price) || 20;
    const finalUrl = imageUrl ||
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

    if (editingFood) {
      updateFoodItem(editingFood.id, { name, tamilName, price: priceNum, category, availableMeals: [category, 'snacks'], description, imageUrl: finalUrl, isVeg, isPopular });
    } else {
      addFoodItem({ name, tamilName, price: priceNum, rating: 4.8, ratingCount: 1, category, availableMeals: [category, 'snacks'], description, imageUrl: finalUrl, isAvailable: true, isVisible: true, isVeg, isPopular });
    }
    setShowModal(false);
  };

  // Download JSON template
  const downloadTemplate = () => {
    const template = [
      {
        name: 'Dish Name',
        tamilName: 'தமிழ் பெயர்',
        price: 30,
        category: 'lunch',
        description: 'Short description of the dish',
        imageUrl: 'https://example.com/image.jpg',
        isVeg: true,
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BestCanteen_Menu_Template.json';
    a.click();
  };

  // Import menu from JSON file
  const handleImportMenu = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const items = JSON.parse(ev.target?.result as string);
        if (Array.isArray(items)) {
          items.forEach((item) => {
            addFoodItem({
              name: item.name || 'Imported Item',
              tamilName: item.tamilName || '',
              price: Number(item.price) || 20,
              rating: 4.5, ratingCount: 1,
              category: item.category || 'lunch',
              availableMeals: [item.category || 'lunch'],
              description: item.description || '',
              imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
              isAvailable: true, isVisible: true,
              isVeg: !!item.isVeg,
            });
          });
          alert(`✅ ${items.length} items imported successfully.`);
        }
      } catch {
        alert('❌ Invalid JSON file. Please check format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Add, edit, toggle availability and visibility of canteen dishes
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Import */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Import Menu</span>
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportMenu} />
          {/* Add New */}
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Dish
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['all', 'breakfast', 'lunch', 'snacks', 'dinner'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition border ${
                filterCategory === cat
                  ? 'bg-[#201611] text-white border-[#201611]'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden sm:block bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[#8C7E76] uppercase font-bold">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Diet</th>
                <th className="p-4">Available</th>
                <th className="p-4">Visible</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-[#201611]">
              {filtered.map((food) => (
                <tr key={food.id} className={`hover:bg-stone-50/80 transition ${!food.isAvailable ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image src={food.imageUrl} alt={food.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#201611]">{food.name}</p>
                        {food.tamilName && <p className="text-[11px] text-stone-400">{food.tamilName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-bold text-[11px] text-stone-500">{food.category}</td>
                  <td className="p-4 font-black text-sm">₹{food.price}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                      food.isVeg ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {food.isVeg ? <Leaf className="w-2.5 h-2.5" /> : <Drumstick className="w-2.5 h-2.5" />}
                      {food.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  {/* Availability TOGGLE */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Toggle on={food.isAvailable} onToggle={() => toggleFoodAvailability(food.id)} />
                      <span className={`text-[11px] font-bold ${food.isAvailable ? 'text-[#16A34A]' : 'text-stone-400'}`}>
                        {food.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </td>
                  {/* Visibility TOGGLE */}
                  <td className="p-4">
                    <button
                      onClick={() => toggleFoodVisibility(food.id)}
                      className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition ${
                        food.isVisible
                          ? 'text-stone-700 bg-white border-stone-200 hover:bg-stone-50'
                          : 'text-stone-400 bg-stone-100 border-stone-200'
                      }`}
                    >
                      {food.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{food.isVisible ? 'Shown' : 'Hidden'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(food)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-[#FF5722] hover:bg-orange-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${food.name}?`)) deleteFoodItem(food.id); }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-stone-400 text-xs">No dishes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="sm:hidden space-y-3">
        {filtered.map((food) => (
          <div key={food.id} className={`bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3 ${!food.isAvailable ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <Image src={food.imageUrl} alt={food.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#201611] truncate">{food.name}</p>
                <p className="text-[10px] text-stone-400 capitalize">{food.category} · ₹{food.price}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 ${
                  food.isVeg ? 'bg-emerald-50 text-[#16A34A]' : 'bg-red-50 text-red-600'
                }`}>
                  {food.isVeg ? <Leaf className="w-2.5 h-2.5" /> : <Drumstick className="w-2.5 h-2.5" />}
                  {food.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => openEdit(food)} className="p-1.5 rounded-xl bg-stone-100 text-stone-600 hover:text-[#FF5722]">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm(`Delete ${food.name}?`)) deleteFoodItem(food.id); }} className="p-1.5 rounded-xl bg-stone-100 text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2">
                <Toggle on={food.isAvailable} onToggle={() => toggleFoodAvailability(food.id)} />
                <span className={`font-bold ${food.isAvailable ? 'text-[#16A34A]' : 'text-stone-400'}`}>
                  {food.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </label>
              <button
                onClick={() => toggleFoodVisibility(food.id)}
                className="flex items-center gap-1 text-stone-500 hover:text-[#201611]"
              >
                {food.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{food.isVisible ? 'Shown' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base text-[#201611]">
                {editingFood ? 'Edit Dish' : 'Add New Canteen Dish'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Dish Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Curd Rice" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Tamil / Regional Name</label>
                    <input type="text" value={tamilName} onChange={(e) => setTamilName(e.target.value)} placeholder="e.g. தயிர் சாதம்" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                  </div>
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Price (₹)</label>
                    <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Meal Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as MealCategory)} className="w-full px-3 py-2 border border-stone-200 rounded-xl">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks (All Day)</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Food Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                      placeholder="Paste URL or upload below"
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-xl font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-2 border border-stone-200 rounded-xl flex items-center gap-1 text-stone-600 hover:bg-stone-50 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                  {imagePreview && (
                    <div className="mt-2 relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200">
                      <Image src={imagePreview} alt="preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Description</label>
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>

                {/* Veg / Non-Veg TOGGLE BUTTONS */}
                <div>
                  <label className="font-bold text-stone-600 block mb-2">Diet Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVeg(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                        isVeg ? 'bg-emerald-50 border-emerald-400 text-[#16A34A]' : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5" /> Vegetarian
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVeg(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                        !isVeg ? 'bg-red-50 border-red-400 text-red-600' : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      <Drumstick className="w-3.5 h-3.5" /> Non-Vegetarian
                    </button>
                  </div>
                </div>

                {/* Popular Dish Feature Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
                      <Flame className="w-4 h-4 fill-[#FF5722]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#201611]">Popular Dish</p>
                      <p className="text-[11px] text-[#5C4E46]">Show in &quot;Popular Right Now&quot; on Customer Home</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPopular(!isPopular)}
                    aria-checked={isPopular}
                    role="switch"
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none ${
                      isPopular ? 'bg-[#FF5722]' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        isPopular ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-stone-200 rounded-xl font-bold text-stone-600">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl">
                    {editingFood ? 'Save Changes' : 'Add to Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ── IMPORT TEMPLATE MODAL ── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-[#201611]">Import Menu Items</h3>
              <button onClick={() => setShowImportModal(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-800 space-y-1">
                <p className="font-bold">How to Import:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Download the JSON template below</li>
                  <li>Fill in your menu items in the same format</li>
                  <li>Upload the completed file</li>
                </ol>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full py-2.5 border-2 border-dashed border-stone-300 hover:border-[#FF5722] rounded-2xl text-stone-600 hover:text-[#FF5722] font-bold flex items-center justify-center gap-2 transition"
              >
                <FileDown className="w-4 h-4" />
                Download Template (JSON)
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-stone-400 text-[11px]">then upload your file</span>
                </div>
              </div>

              <button
                onClick={() => { importRef.current?.click(); setShowImportModal(false); }}
                className="w-full py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                Choose File to Upload
              </button>

              <p className="text-[10px] text-stone-400 text-center">Accepted: .json files only</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

