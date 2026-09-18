'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { supabase } from '@/lib/supabase';
import { Store, UserCheck, Plus, Edit2, Trash2, X, Eye, EyeOff, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';

export interface ServerStaffAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  counterNumber: string;
  role: string;
  status: 'Online' | 'Offline' | 'Standby';
  createdAt: string;
}

const mapStaffFromDb = (r: any): ServerStaffAccount => ({
  id: r.id,
  name: r.name,
  email: r.email,
  password: r.password,
  counterNumber: r.counter_number || 'Main Food Counter',
  role: r.role || 'Food Server',
  status: (r.status as any) || 'Online',
  createdAt: r.created_at || new Date().toISOString(),
});

const mapStaffToDb = (s: ServerStaffAccount) => ({
  id: s.id,
  name: s.name,
  email: s.email,
  password: s.password || 'server123',
  counter_number: s.counterNumber,
  role: s.role,
  status: s.status,
  created_at: s.createdAt,
});

const STATUS_COLORS: Record<string, string> = {
  Online: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Offline: 'bg-stone-100 text-stone-600 border-stone-200',
  Standby: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function AdminServersPage() {
  const { orders } = useCanteen();
  const [staff, setStaff] = useState<ServerStaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<ServerStaffAccount | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<ServerStaffAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form inputs
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fCounter, setFCounter] = useState('Main Food Counter');
  const [fRole, setFRole] = useState('Food Server');

  // Load from Supabase DB on mount & subscribe to realtime updates
  useEffect(() => {
    let isMounted = true;

    async function loadStaff() {
      try {
        const { data, error } = await supabase
          .from('server_staff')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          if (isMounted) {
            const mapped = data.map(mapStaffFromDb);
            setStaff(mapped);
            localStorage.setItem('bc_servers', JSON.stringify(mapped));
          }
        } else {
          // Fallback to local cache if offline
          const saved = localStorage.getItem('bc_servers');
          if (saved && isMounted) {
            setStaff(JSON.parse(saved));
          }
        }
      } catch (err) {
        console.error('Failed to load server staff from Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStaff();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('server_staff_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'server_staff' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = mapStaffFromDb(payload.new);
            setStaff((prev) => {
              if (prev.some((s) => s.id === newItem.id)) return prev;
              const next = [...prev, newItem];
              localStorage.setItem('bc_servers', JSON.stringify(next));
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = mapStaffFromDb(payload.new);
            setStaff((prev) => {
              const next = prev.map((s) => (s.id === updatedItem.id ? updatedItem : s));
              localStorage.setItem('bc_servers', JSON.stringify(next));
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setStaff((prev) => {
                const next = prev.filter((s) => s.id !== deletedId);
                localStorage.setItem('bc_servers', JSON.stringify(next));
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate real served count dynamically from verified canteen orders
  const getServedStats = (staffName: string) => {
    const staffOrders = orders.filter((o) => {
      if (o.orderStatus !== 'SERVED') return false;
      if (o.servedBy) {
        const sLower = staffName.toLowerCase();
        const byLower = o.servedBy.toLowerCase();
        if (byLower.includes(sLower) || sLower.includes(byLower)) {
          return true;
        }
      }
      // If only 1 staff member exists or order was served under default 'Canteen Server'/'Food Server'
      if (staff.length === 1 || o.servedBy === 'Canteen Server' || o.servedBy === 'Food Server') {
        return true;
      }
      return false;
    });

    return {
      count: staffOrders.length,
      revenue: staffOrders.reduce((acc, o) => acc + (o.total || 0), 0),
    };
  };

  const openAdd = () => {
    setEditingStaff(null);
    setFName('');
    setFEmail('');
    setFPassword('');
    setFCounter('Main Food Counter');
    setFRole('Food Server');
    setShowModal(true);
  };

  const openEdit = (s: ServerStaffAccount) => {
    setEditingStaff(s);
    setFName(s.name);
    setFEmail(s.email);
    setFPassword(s.password || '');
    setFCounter(s.counterNumber);
    setFRole(s.role);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStaff) {
      const updatedAccount: ServerStaffAccount = {
        ...editingStaff,
        name: fName.trim(),
        email: fEmail.trim().toLowerCase(),
        password: fPassword.trim() || editingStaff.password,
        counterNumber: fCounter.trim(),
        role: fRole.trim(),
      };

      setStaff((prev) => {
        const next = prev.map((s) => (s.id === editingStaff.id ? updatedAccount : s));
        localStorage.setItem('bc_servers', JSON.stringify(next));
        return next;
      });

      try {
        await supabase
          .from('server_staff')
          .upsert(mapStaffToDb(updatedAccount));
      } catch (err) {
        console.error('Failed to update staff in Supabase:', err);
      }

      setSuccessMessage(`Updated server account for ${fName.trim()}`);
    } else {
      const newStaff: ServerStaffAccount = {
        id: `server-${Date.now()}`,
        name: fName.trim(),
        email: fEmail.trim().toLowerCase(),
        password: fPassword.trim() || 'server123',
        counterNumber: fCounter.trim(),
        role: fRole.trim(),
        status: 'Online',
        createdAt: new Date().toISOString(),
      };

      setStaff((prev) => {
        const next = [...prev, newStaff];
        localStorage.setItem('bc_servers', JSON.stringify(next));
        return next;
      });

      try {
        await supabase
          .from('server_staff')
          .insert(mapStaffToDb(newStaff));
      } catch (err) {
        console.error('Failed to insert staff into Supabase:', err);
      }

      setSuccessMessage(`Created server account for ${newStaff.name}! They can now log in at /server/login`);
    }

    setShowModal(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove counter staff account for ${name}?`)) {
      setStaff((prev) => {
        const next = prev.filter((s) => s.id !== id);
        localStorage.setItem('bc_servers', JSON.stringify(next));
        return next;
      });

      try {
        await supabase
          .from('server_staff')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Failed to delete staff from Supabase:', err);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const target = staff.find((s) => s.id === id);
    if (!target) return;

    const nextStatus: 'Online' | 'Offline' | 'Standby' =
      target.status === 'Online' ? 'Offline' : target.status === 'Offline' ? 'Standby' : 'Online';

    const updatedAccount = { ...target, status: nextStatus };

    setStaff((prev) => {
      const next = prev.map((s) => (s.id === id ? updatedAccount : s));
      localStorage.setItem('bc_servers', JSON.stringify(next));
      return next;
    });

    try {
      await supabase
        .from('server_staff')
        .update({ status: nextStatus })
        .eq('id', id);
    } catch (err) {
      console.error('Failed to update staff status in Supabase:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#201611] tracking-tight">
            Counter Staff
          </h1>
          <p className="text-xs sm:text-sm text-[#5C4E46] mt-0.5">
            Create and manage server accounts with QR token verification & scanner access
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-14 bg-stone-100 rounded-2xl" />
              <div className="h-6 bg-stone-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : staff.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-stone-200/90 shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-[#201611]">No Counter Staff Yet</h3>
            <p className="text-xs text-[#5C4E46] leading-relaxed">
              Add your counter staff accounts so team members can log in at the counter terminal (/server/login), verify QR tokens, and serve meals.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl inline-flex items-center gap-2 shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Staff Account</span>
          </button>
        </div>
      ) : (
        /* Staff Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => {
            const initials = s.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const { count: servedCount, revenue: servedRev } = getServedStats(s.name);

            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4 hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-750 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#201611]">{s.name}</h3>
                      <p className="text-xs text-stone-500">{s.counterNumber}</p>
                      <p className="text-[11px] text-[#8C7E76] font-medium">{s.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStatus(s.id)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${STATUS_COLORS[s.status]}`}
                    title="Click to toggle status"
                  >
                    {s.status}
                  </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] rounded-2xl p-3 text-center border border-stone-100">
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase">Assigned</p>
                    <p className="text-xs font-black text-[#201611] truncate">{s.role}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase">Served Today</p>
                    <p className="text-sm font-black text-[#FF5722]">
                      {servedCount} {servedCount > 0 && servedRev > 0 ? `(₹${servedRev})` : ''}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                    <span>Pass: ••••••••</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
                      title="Edit account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingStaff(s)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                      title="Remove staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT STAFF MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#201611]">
                    {editingStaff ? 'Edit Staff Account' : 'Create Server Account'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Counter staff login credentials for QR scanner
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-[#FF5722] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Staff Login Email</label>
                <input
                  type="email"
                  required
                  value={fEmail}
                  onChange={(e) => setFEmail(e.target.value)}
                  placeholder="e.g. ramesh@bestcanteen.in"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-[#FF5722] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Login Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStaff}
                    value={fPassword}
                    onChange={(e) => setFPassword(e.target.value)}
                    placeholder={editingStaff ? 'Leave blank to keep existing' : 'Minimum 6 characters'}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-[#FF5722] focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Counter Assigned</label>
                  <select
                    value={fCounter}
                    onChange={(e) => setFCounter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:border-[#FF5722] focus:outline-none"
                  >
                    <option value="Counter 01">Counter 01</option>
                    <option value="Counter 02">Counter 02</option>
                    <option value="Counter 03">Counter 03</option>
                    <option value="Main Food Counter">Main Food Counter</option>
                    <option value="Juice & Snacks Bar">Juice & Snacks Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Role Designation</label>
                  <select
                    value={fRole}
                    onChange={(e) => setFRole(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:border-[#FF5722] focus:outline-none"
                  >
                    <option value="Chief Dispenser">Chief Dispenser</option>
                    <option value="Counter Assistant">Counter Assistant</option>
                    <option value="Food Server">Food Server</option>
                    <option value="Staff Support">Staff Support</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingStaff ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE STAFF POPUP CARD ── */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-[#201611]">Confirm Remove Staff</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you sure you want to remove <span className="font-extrabold text-[#201611]">&quot;{deletingStaff.name}&quot;</span>? This account will no longer be able to log in to the scanner.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingStaff) {
                    handleDelete(deletingStaff.id, deletingStaff.name);
                    setDeletingStaff(null);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
