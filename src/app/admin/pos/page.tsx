'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search, Plus, Minus, Trash2, Printer, CheckCircle2,
  Receipt, ShoppingCart, RefreshCw, X, ArrowRight, User, Phone,
  Sparkles, Check, Package, Clock, DollarSign
} from 'lucide-react';
import { useCanteen } from '@/context/CanteenContext';
import { FoodItem, Order, OrderItem } from '@/types';
import { BrandLogo } from '@/components/common/BrandLogo';

interface PosItem {
  food: FoodItem;
  quantity: number;
  isParcel: boolean;
}

export default function AdminPosPage() {
  const { foods, createCashPosOrder, activeMealInfo } = useCanteen();

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // POS Cart State
  const [cart, setCart] = useState<PosItem[]>([]);
  const [customerName, setCustomerName] = useState('Counter Cash Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Completed Order for Slip Modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [cashGivenAtPayment, setCashGivenAtPayment] = useState<number>(0);

  // Available Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [foods]);

  // Filtered Food List
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
      if (dietFilter === 'VEG' && !f.isVeg) return false;
      if (dietFilter === 'NON_VEG' && f.isVeg) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        const matchesCat = f.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [foods, selectedCategory, dietFilter, searchQuery]);

  // Cart Operations
  const addToCart = (food: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food, quantity: 1, isParcel: false }];
    });
  };

  const updateQuantity = (foodId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.food.id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosItem[];
    });
  };

  const toggleParcel = (foodId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.food.id === foodId ? { ...item, isParcel: !item.isParcel } : item
      )
    );
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('Counter Cash Customer');
    setCustomerPhone('');
    setCashTendered('');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  }, [cart]);

  const parcelTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.isParcel ? 5 * item.quantity : 0), 0);
  }, [cart]);

  const total = subtotal + parcelTotal;

  const parsedCash = parseFloat(cashTendered) || 0;
  const changeToReturn = parsedCash >= total ? parsedCash - total : 0;

  // Single-click Cash Order & Slip Generation
  const handleGenerateAndPrintToken = () => {
    if (cart.length === 0) return;

    const orderItems: OrderItem[] = cart.map((item) => ({
      foodId: item.food.id,
      name: item.isParcel ? `${item.food.name} (Parcel 📦)` : item.food.name,
      price: item.food.price + (item.isParcel ? 5 : 0),
      quantity: item.quantity,
      imageUrl: item.food.imageUrl,
    }));

    const finalCashTendered = parsedCash >= total ? parsedCash : total;
    setCashGivenAtPayment(finalCashTendered);

    const newOrder = createCashPosOrder(orderItems, {
      name: customerName.trim() || 'Counter Cash Customer',
      phone: customerPhone.trim() || 'Counter POS Till',
      notes: `Cash POS Sale · Tendered: ₹${finalCashTendered} · Change: ₹${finalCashTendered - total}`,
    });

    setCompletedOrder(newOrder);
    setShowSlipModal(true);
  };

  const handlePrintSlip = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleNextCustomer = () => {
    setShowSlipModal(false);
    setCompletedOrder(null);
    clearCart();
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Context bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-100 text-[#FF5722]">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-[#201611] tracking-tight">
              Cash POS Terminal
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Till #1 Active
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Accept physical cash, pack parcel (+₹5), and generate instant printable tokens for counter customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-2xl flex items-center gap-2">
            <span className="text-lg">{activeMealInfo.icon}</span>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Current Service</p>
              <p className="text-xs font-black text-stone-700">{activeMealInfo.name}</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
          >
            <span>Token Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Left is Food Menu, Right is Register Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Food Catalog (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dish by name, category..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:border-[#FF5722] focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Diet filter pills */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl shrink-0">
                {(['ALL', 'VEG', 'NON_VEG'] as const).map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(diet)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      dietFilter === diet
                        ? 'bg-white text-[#201611] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {diet === 'ALL' && 'All'}
                    {diet === 'VEG' && '🌱 Veg'}
                    {diet === 'NON_VEG' && '🍗 Non-Veg'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category horizontal pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-[#FF5722] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'ALL' ? '🍽️ All Dishes' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredFoods.map((food) => {
              const inCartItem = cart.find((i) => i.food.id === food.id);
              const qtyInCart = inCartItem?.quantity || 0;

              return (
                <div
                  key={food.id}
                  className={`bg-white rounded-3xl p-3 border transition-all flex flex-col justify-between group ${
                    qtyInCart > 0
                      ? 'border-[#FF5722] shadow-[0_4px_16px_rgba(255,87,34,0.15)] ring-1 ring-[#FF5722]'
                      : 'border-stone-200 hover:border-stone-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Image with veg badge */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-2.5">
                      <Image
                        src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                        alt={food.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Veg indicator dot */}
                      <span
                        className={`absolute top-2 left-2 w-4 h-4 rounded-sm border bg-white flex items-center justify-center ${
                          food.isVeg ? 'border-green-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            food.isVeg ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                      </span>

                      {/* Quantity in bill badge */}
                      {qtyInCart > 0 && (
                        <span className="absolute top-2 right-2 bg-[#FF5722] text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md animate-in fade-in">
                          {qtyInCart} in bill
                        </span>
                      )}
                    </div>

                    {/* Food info */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        {food.category}
                      </p>
                      <h3 className="font-bold text-xs sm:text-sm text-[#201611] line-clamp-1 leading-snug">
                        {food.name}
                      </h3>
                      <p className="text-sm font-black text-[#FF5722]">
                        ₹{food.price}
                      </p>
                    </div>
                  </div>

                  {/* Add / Qty Control Button */}
                  <div className="mt-3 pt-2 border-t border-stone-100">
                    {qtyInCart === 0 ? (
                      <button
                        onClick={() => addToCart(food)}
                        className="w-full py-2 bg-stone-100 hover:bg-[#FF5722] hover:text-white text-stone-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Bill</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-stone-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(food.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:bg-stone-200 font-black text-xs flex items-center justify-center transition shadow-2xs active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-xs text-[#201611] px-2">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => updateQuantity(food.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#FF5722] text-white hover:bg-orange-600 font-black text-xs flex items-center justify-center transition shadow-2xs active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFoods.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <p className="text-3xl mb-2">🔍</p>
              <h3 className="font-bold text-sm text-[#201611]">No dishes found</h3>
              <p className="text-xs text-stone-400 mt-1">
                Try searching for something else or adjust category filters.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: POS Register Cart & Single-Click Checkout (5 cols on lg) */}
        <div className="lg:col-span-5 sticky top-4 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Register Card Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#FF5722]" />
                <h2 className="font-black text-sm text-[#201611]">Current Cash Bill</h2>
                <span className="bg-[#FF5722] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition"
                  title="Clear Bill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Optional Customer info */}
            <div className="p-4 bg-stone-50/70 border-b border-stone-100 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (optional)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile No. (optional)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-4 divide-y divide-stone-100 max-h-[300px] overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.food.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.food.isVeg ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                        <h4 className="font-bold text-xs text-[#201611] line-clamp-1">
                          {item.food.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        ₹{item.food.price} × {item.quantity} = ₹{item.food.price * item.quantity}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.food.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-stone-700 hover:bg-stone-200 text-xs font-bold flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-xs text-[#201611] px-1 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.food.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#FF5722] text-white hover:bg-orange-600 text-xs font-bold flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.food.id)}
                      className="text-stone-300 hover:text-red-500 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Parcel Packaging Feature (+₹5) */}
                  <div className="flex items-center justify-between bg-orange-50/60 border border-orange-100 rounded-xl px-2.5 py-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.isParcel}
                        onChange={() => toggleParcel(item.food.id)}
                        className="w-3.5 h-3.5 rounded text-[#FF5722] focus:ring-[#FF5722] border-stone-300 cursor-pointer"
                      />
                      <span>📦 Pack as Parcel (+₹5 each)</span>
                    </label>
                    <span className="text-[10px] font-black text-[#FF5722]">
                      {item.isParcel ? `+₹${5 * item.quantity}` : 'Dine In'}
                    </span>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto text-stone-300 stroke-1" />
                  <p className="text-xs font-bold text-stone-500">Bill is empty</p>
                  <p className="text-[11px] text-stone-400">
                    Click &ldquo;+ Add to Bill&rdquo; on any food card to start.
                  </p>
                </div>
              )}
            </div>

            {/* Bill Summary & Cash Calculator */}
            {cart.length > 0 && (
              <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  {parcelTotal > 0 && (
                    <div className="flex justify-between text-orange-700 font-bold">
                      <span>Parcel Packing Fee</span>
                      <span>+₹{parcelTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                    <span className="font-black text-sm text-[#201611]">Total Cash Payable</span>
                    <span className="text-2xl font-black text-[#FF5722]">₹{total}</span>
                  </div>
                </div>

                {/* Cash Tender Assistant */}
                <div className="pt-2 border-t border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-600 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-stone-500" />
                      Cash Tendered
                    </span>
                    {parsedCash > 0 && (
                      <span className={`font-black px-2 py-0.5 rounded-md ${
                        parsedCash >= total ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {parsedCash >= total
                          ? `Return Change: ₹${changeToReturn}`
                          : `Short by: ₹${total - parsedCash}`}
                      </span>
                    )}
                  </div>

                  {/* Quick Tender Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setCashTendered(total.toString())}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold transition"
                    >
                      Exact (₹{total})
                    </button>
                    {[50, 100, 200, 500].map((amt) => {
                      if (amt < total && amt * 2 < total) return null;
                      return (
                        <button
                          key={amt}
                          onClick={() => setCashTendered(amt.toString())}
                          className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold transition"
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Cash input */}
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={`Enter cash given (default ₹${total})`}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                {/* Single-Click Primary Action: Generate & Print Token */}
                <button
                  onClick={handleGenerateAndPrintToken}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF5722] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>⚡ Generate & Print Cash Token (₹{total})</span>
                </button>
                <p className="text-[10px] text-center text-stone-400">
                  Single-click creates verified token in feed and brings up printable thermal slip.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINTABLE THERMAL TOKEN SLIP MODAL */}
      {showSlipModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            {/* Modal Top Bar (Non-print) */}
            <div className="print:hidden px-4 py-3 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Token #{completedOrder.id} Generated</span>
              </div>
              <button
                onClick={handleNextCustomer}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TOKEN SLIP BODY (Small compact token matching customer panel) */}
            <div id="thermal-receipt" className="p-5 bg-white text-stone-900 text-center space-y-3">
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <BrandLogo size="sm" />
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  🟢 ACTIVE · CASH
                </span>
              </div>

              {/* Token Title & Number */}
              <div>
                <p className="text-[10px] font-extrabold text-[#FF5722] uppercase tracking-wider">
                  Digital Food Token
                </p>
                <h2 className="text-2xl font-black text-[#201611] tracking-tight mt-0.5">
                  Token #{completedOrder.id}
                </h2>
                <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                  {new Date(completedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(completedOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="relative mx-auto w-44 h-44 p-3 rounded-2xl bg-[#FFFDF9] border-2 border-stone-200 shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  value={completedOrder.qrToken}
                  size={150}
                  level="H"
                  includeMargin={false}
                  fgColor="#201611"
                />
              </div>

              {/* Counter Instruction */}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#201611]">
                  Show this QR at the canteen counter.
                </p>
                <p className="text-[11px] text-[#5C4E46]">
                  Server scans this token to verify and dispense your food.
                </p>
              </div>

              {/* Compact Items Summary */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-stone-200 text-left space-y-1 text-xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#8C7E76] uppercase tracking-wider pb-1 border-b border-stone-200">
                  <span>Items ({completedOrder.items.length})</span>
                  <span className="text-emerald-700 font-extrabold">PAID CASH</span>
                </div>
                <div className="divide-y divide-stone-200/50">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex justify-between">
                      <span className="font-semibold text-[#201611] truncate max-w-[180px]">
                        {item.name} <span className="text-stone-400 font-normal">×{item.quantity}</span>
                      </span>
                      <span className="font-bold text-[#201611]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="pt-1.5 flex justify-between font-extrabold text-xs text-[#201611]">
                    <span>Total Paid</span>
                    <span className="text-[#FF5722]">₹{completedOrder.total}</span>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-stone-400 text-center font-sans pt-1">
                Best Canteen · Cash POS Token #{completedOrder.id}
              </p>
            </div>

            {/* Modal Bottom Actions (Non-print) */}
            <div className="print:hidden p-4 bg-[#FAF8F5] border-t border-stone-200 flex gap-2.5">
              <button
                onClick={handlePrintSlip}
                className="flex-1 py-3 bg-[#201611] hover:bg-stone-800 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Token</span>
              </button>
              <button
                onClick={handleNextCustomer}
                className="flex-1 py-3 bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Next Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
