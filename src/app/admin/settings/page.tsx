'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [canteenName, setCanteenName] = useState('BEST CANTEEN');
  const [tagline, setTagline] = useState('Good Food · Brighter Days');
  const [adminPhone, setAdminPhone] = useState('+91 98765 43210');
  const [operatingHours, setOperatingHours] = useState('7:00 AM – 10:00 PM');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
          Canteen brand, contact, and operational configurations
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5 text-xs">
        <h2 className="font-black text-sm text-[#201611] border-b border-stone-100 pb-3">Brand Settings</h2>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Canteen Brand Name</label>
          <input
            type="text"
            value={canteenName}
            onChange={(e) => setCanteenName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-[#201611] font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-[#201611]"
          />
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Admin / Contact Phone</label>
          <input
            type="text"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-[#201611]"
          />
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Operating Hours</label>
          <input
            type="text"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-[#201611]"
          />
        </div>

        <div className="pt-1 border-t border-stone-100">
          <button
            type="submit"
            className="px-6 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
