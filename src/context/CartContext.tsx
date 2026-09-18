'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem, OrderItem } from '@/types';

export interface CartItem {
  food: FoodItem;
  quantity: number;
  isParcel?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (food: FoodItem, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  toggleParcel: (foodId: string) => void;
  getItemQuantity: (foodId: string) => number;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  parcelTotal: number;
  tax: number;
  total: number;
  toOrderItems: () => OrderItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bc_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item && item.food && typeof item.food.price === 'number'));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bc_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (food: FoodItem, quantity = 1) => {
    if (!food || !food.id || food.isAvailable === false) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.food && i.food.id === food.id);
      if (existing) {
        return prev.map((i) =>
          i.food.id === food.id ? { ...i, quantity: (i.quantity || 0) + quantity } : i
        );
      }
      return [...prev, { food, quantity, isParcel: false }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.food && i.food.id !== foodId));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.food && i.food.id === foodId ? { ...i, quantity } : i))
    );
  };

  const toggleParcel = (foodId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.food && i.food.id === foodId ? { ...i, isParcel: !i.isParcel } : i))
    );
  };

  const getItemQuantity = (foodId: string): number => {
    const item = items.find((i) => i.food && i.food.id === foodId);
    return item ? item.quantity || 0 : 0;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(() => {
    return (items || []).reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return (items || []).reduce((acc, curr) => acc + (curr?.food?.price || 0) * (curr?.quantity || 0), 0);
  }, [items]);

  // Parcel charges: ₹5 for every single dish packed as parcel
  const parcelTotal = useMemo(() => {
    return (items || []).reduce(
      (acc, curr) => acc + (curr?.isParcel ? 5 * (curr?.quantity || 0) : 0),
      0
    );
  }, [items]);

  const tax = 0; // Canteen prices are all-inclusive net prices
  const total = (subtotal || 0) + (parcelTotal || 0) + tax;

  const toOrderItems = (): OrderItem[] => {
    return (items || [])
      .filter((i) => i && i.food && i.food.id)
      .map((i) => ({
        foodId: i.food.id,
        name: i.isParcel ? `${i.food.name} (Parcel 📦)` : i.food.name,
        price: (i.food.price || 0) + (i.isParcel ? 5 : 0),
        quantity: i.quantity || 1,
        imageUrl: i.food.imageUrl || '',
      }));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleParcel,
        getItemQuantity,
        clearCart,
        totalItems,
        subtotal,
        parcelTotal,
        tax,
        total,
        toOrderItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
