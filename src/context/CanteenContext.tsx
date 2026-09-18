'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem, MealSchedule, Order, OrderItem, NotificationItem, MealCategory } from '@/types';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_MEAL_SCHEDULES,
  INITIAL_ORDERS,
} from '@/data/initialData';
import { generateOrderId, generateSecureToken, parseMinutes, formatTime12h } from '@/lib/utils';
import {
  supabase,
  safeDbSync,
  mapOrderFromDb,
  mapOrderToDb,
  mapFoodFromDb,
  mapFoodToDb,
  mapScheduleFromDb,
  mapScheduleToDb,
} from '@/lib/supabase';
import { logCanteenEvent, requestFirebaseNotificationPermission } from '@/lib/firebase';

interface ActiveMealInfo {
  category: MealCategory;
  name: string;
  label: string;
  icon: string;
  statusText: string;
  isServing: boolean;
  schedule?: MealSchedule;
}

interface CanteenContextType {
  mealSchedules: MealSchedule[];
  foods: FoodItem[];
  orders: Order[];
  favorites: string[];
  notifications: NotificationItem[];
  simulatedTime: string | null; // e.g. "13:30" or null for system clock
  activeMealInfo: ActiveMealInfo;
  effectiveTime: Date;
  currentTimeStr: string;
  isSupabaseConnected: boolean;
  setSimulatedTime: (timeStr: string | null) => void;
  updateMealSchedule: (id: string, updates: Partial<MealSchedule>) => void;
  toggleFoodAvailability: (id: string) => void;
  toggleFoodVisibility: (id: string) => void;
  addFoodItem: (food: Omit<FoodItem, 'id'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  toggleFavorite: (foodId: string) => void;
  createOrder: (
    items: OrderItem[],
    notes?: string,
    customerDetails?: { id?: string; name?: string; phone?: string; email?: string; avatarUrl?: string },
    paymentInfo?: { paymentId?: string; razorpayOrderId?: string }
  ) => Order;
  createCashPosOrder: (
    items: OrderItem[],
    customerDetails?: { name?: string; phone?: string; notes?: string }
  ) => Order;
  verifyPayment: (orderId: string, paymentId: string) => Order | null;
  serveOrder: (tokenOrId: string, serverName?: string) => {
    success: boolean;
    order?: Order;
    error?: string;
    servedAt?: string;
  };
  addNotification: (title: string, message: string, type: 'order' | 'payment' | 'menu' | 'alert', orderId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  requestDeviceNotificationPermission: () => Promise<boolean>;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export function CanteenProvider({ children }: { children: React.ReactNode }) {
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>(INITIAL_MEAL_SCHEDULES);
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [simulatedTime, setSimulatedTimeState] = useState<string | null>(null);
  const [systemClock, setSystemClock] = useState<Date>(new Date());

  // Keep system clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemClock(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initial Hydration from localStorage (with clean purge of old mock data)
  useEffect(() => {
    try {
      const savedFoods = localStorage.getItem('bc_foods');
      if (savedFoods) {
        const parsedFoods: FoodItem[] = JSON.parse(savedFoods);
        setFoods(parsedFoods);
      }

      const savedSchedules = localStorage.getItem('bc_meal_schedules');
      if (savedSchedules) {
        const parsed = JSON.parse(savedSchedules);
        const lunch = parsed.find((s: any) => s.id === 'lunch');
        if (lunch && lunch.endTime === '15:30') {
          setMealSchedules(parsed);
        } else {
          setMealSchedules(INITIAL_MEAL_SCHEDULES);
        }
      }

      const savedOrders = localStorage.getItem('bc_orders');
      if (savedOrders) {
        // Purge any old mock generated tokens and unpaid/pending orders
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        const cleanOrders = parsedOrders.filter(
          (o) => o.id !== 'BC10482' && o.id !== 'BC10420' && o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED'
        );
        setOrders(cleanOrders);
        localStorage.setItem('bc_orders', JSON.stringify(cleanOrders));
      } else {
        setOrders([]);
      }

      const savedFavs = localStorage.getItem('bc_favorites');
      if (savedFavs) {
        const parsedFavs: string[] = JSON.parse(savedFavs);
        // Purge old mock default favorites
        const cleanFavs = parsedFavs.filter(
          (id) => id !== 'food-curd-rice' && id !== 'food-medu-vada'
        );
        setFavorites(cleanFavs);
        localStorage.setItem('bc_favorites', JSON.stringify(cleanFavs));
      } else {
        setFavorites([]);
      }

      const savedNotifs = localStorage.getItem('bc_notifications');
      if (savedNotifs) {
        const parsedNotifs: NotificationItem[] = JSON.parse(savedNotifs);
        const cleanNotifs = parsedNotifs.filter(
          (n) => n.id !== 'notif-1' && n.id !== 'notif-2' && n.orderId !== 'BC10482'
        );
        setNotifications(cleanNotifs);
      } else {
        setNotifications([]);
      }

      localStorage.removeItem('bc_sim_time');
      setSimulatedTimeState(null);
    } catch {
      // ignore
    }
  }, []);


  // 2. Fetch remote data from Supabase with graceful fallback
  useEffect(() => {
    let isMounted = true;

    async function syncFromSupabase() {
      try {
        // Fetch Foods
        const { data: foodsData, error: foodsError } = await supabase
          .from('foods')
          .select('*');

        if (!foodsError && foodsData && foodsData.length > 0) {
          if (isMounted) {
            const cleanRemote = foodsData.map(mapFoodFromDb);
            setFoods(cleanRemote);
            localStorage.setItem('bc_foods', JSON.stringify(cleanRemote));
            setIsSupabaseConnected(true);
          }
        } else if (!foodsError && foodsData && foodsData.length === 0) {
          if (isMounted) setIsSupabaseConnected(true);
        }

        // Fetch Meal Schedules
        const { data: schedData, error: schedError } = await supabase
          .from('meal_schedules')
          .select('*');

        if (!schedError && schedData && schedData.length > 0) {
          if (isMounted) setMealSchedules(schedData.map(mapScheduleFromDb));
        }

        // Purge any orphan / unverified / payment pending orders from remote DB
        try {
          await supabase
            .from('orders')
            .delete()
            .or('order_status.eq.PAYMENT_PENDING,payment_status.eq.PENDING');
        } catch {}

        // Fetch Orders (strictly verified tokens)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData && ordersData.length > 0) {
          const remoteOrders = ordersData
            .map(mapOrderFromDb)
            .filter((o) => o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED');
          if (isMounted) {
            setOrders((local) => {
              const map = new Map<string, Order>();
              remoteOrders.forEach((o) => map.set(o.id, o));
              local.forEach((o) => {
                if (!map.has(o.id) && o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED') {
                  map.set(o.id, o);
                }
              });
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
            setIsSupabaseConnected(true);
          }
        }
      } catch (err) {
        console.log('Supabase fetch note (local cache active):', err);
      }
    }

    syncFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Supabase Real-time Subscriptions (Orders & Foods Live Sync)
  useEffect(() => {
    const ordersChannel = supabase
      .channel('realtime:orders_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = mapOrderFromDb(payload.new);
            // Strictly ignore any unpaid or payment pending inserts
            if (newOrder.orderStatus === 'PAYMENT_PENDING' || newOrder.paymentStatus !== 'VERIFIED') return;
            setOrders((prev) => {
              if (prev.some((o) => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapOrderFromDb(payload.new);
            setOrders((prev) => {
              // If order was cancelled or pending, remove from active list
              if (updated.orderStatus === 'PAYMENT_PENDING' || updated.paymentStatus !== 'VERIFIED') {
                return prev.filter((o) => o.id !== updated.id);
              }
              const exists = prev.some((o) => o.id === updated.id);
              if (exists) {
                return prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
              }
              return [updated, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setOrders((prev) => prev.filter((o) => o.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    const foodsChannel = supabase
      .channel('realtime:foods_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'foods' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newFood = mapFoodFromDb(payload.new);
            setFoods((prev) => {
              if (prev.some((f) => f.id === newFood.id)) return prev;
              return [newFood, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapFoodFromDb(payload.new);
            setFoods((prev) =>
              prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setFoods((prev) => prev.filter((f) => f.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(foodsChannel);
    };
  }, []);

  // Persist local backup state updates
  useEffect(() => {
    try {
      localStorage.setItem('bc_foods', JSON.stringify(foods));
    } catch {}
  }, [foods]);

  useEffect(() => {
    try {
      localStorage.setItem('bc_meal_schedules', JSON.stringify(mealSchedules));
    } catch {}
  }, [mealSchedules]);

  useEffect(() => {
    try {
      const cleanOrders = orders.filter(
        (o) => o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED'
      );
      localStorage.setItem('bc_orders', JSON.stringify(cleanOrders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bc_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const setSimulatedTime = (timeStr: string | null) => {
    setSimulatedTimeState(timeStr);
    try {
      if (timeStr) localStorage.setItem('bc_sim_time', timeStr);
      else localStorage.removeItem('bc_sim_time');
    } catch {}
  };

  // Compute effective time
  const effectiveTime = useMemo(() => {
    if (!simulatedTime) return systemClock;
    const [hours, mins] = simulatedTime.split(':').map(Number);
    const d = new Date(systemClock);
    d.setHours(hours || 12, mins || 0, 0, 0);
    return d;
  }, [simulatedTime, systemClock]);

  const currentTimeStr = useMemo(() => {
    const h = effectiveTime.getHours().toString().padStart(2, '0');
    const m = effectiveTime.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }, [effectiveTime]);

  // Determine active meal dynamically based on admin-defined meal schedules
  const activeMealInfo = useMemo<ActiveMealInfo>(() => {
    const currentMins = effectiveTime.getHours() * 60 + effectiveTime.getMinutes();

    for (const schedule of mealSchedules || []) {
      if (!schedule || !schedule.isActive || schedule.isAllDay) continue;
      const start = parseMinutes(schedule.startTime || '00:00');
      const end = parseMinutes(schedule.endTime || '23:59');

      if (currentMins >= start && currentMins < end) {
        return {
          category: schedule.id as MealCategory,
          name: schedule.name,
          label: schedule.label,
          icon: schedule.icon,
          statusText: `Serving now · Until ${formatTime12h(schedule.endTime)}`,
          isServing: true,
          schedule,
        };
      }
    }

    const snacks = mealSchedules.find((m) => m.id === 'snacks' && m.isActive);
    return {
      category: 'snacks',
      name: 'Snacks',
      label: '🍪 Snacks',
      icon: '🍪',
      statusText: 'Available all day · Fresh & Hot',
      isServing: true,
      schedule: snacks,
    };
  }, [mealSchedules, effectiveTime]);

  // Admin schedule update
  const updateMealSchedule = (id: string, updates: Partial<MealSchedule>) => {
    setMealSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          safeDbSync(() => supabase.from('meal_schedules').upsert(mapScheduleToDb(updated)));
          return updated;
        }
        return item;
      })
    );
  };

  // Food actions with Supabase persistence
  const toggleFoodAvailability = (id: string) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newStatus = !f.isAvailable;
          safeDbSync(() => supabase.from('foods').update({ is_available: newStatus }).eq('id', id));
          return { ...f, isAvailable: newStatus };
        }
        return f;
      })
    );
  };

  const toggleFoodVisibility = (id: string) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newVis = !f.isVisible;
          safeDbSync(() => supabase.from('foods').update({ is_visible: newVis }).eq('id', id));
          return { ...f, isVisible: newVis };
        }
        return f;
      })
    );
  };

  const addFoodItem = (newFood: Omit<FoodItem, 'id'>) => {
    const id = `food-${Date.now()}`;
    const fullFood: FoodItem = {
      ...newFood,
      id,
    };
    setFoods((prev) => [fullFood, ...prev]);

    safeDbSync(() => supabase.from('foods').insert(mapFoodToDb(fullFood)));
    logCanteenEvent('food_item_added', { food_id: id, food_name: newFood.name, price: newFood.price });

    addNotification(
      `New Dish Added: ${newFood.name}`,
      `Fresh on the menu! ${newFood.name} (₹${newFood.price}) is now available at Best Canteen. Check it out!`,
      'menu'
    );
  };

  const updateFoodItem = (id: string, updates: Partial<FoodItem>) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates };
          safeDbSync(() => supabase.from('foods').update(mapFoodToDb(updated)).eq('id', id));
          return updated;
        }
        return f;
      })
    );
  };

  const deleteFoodItem = (id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id));
    safeDbSync(() => supabase.from('foods').delete().eq('id', id));
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  // Order Lifecycle
  const createOrder = (
    items: OrderItem[],
    notes?: string,
    customerDetails?: { id?: string; name?: string; phone?: string; email?: string; avatarUrl?: string },
    paymentInfo?: { paymentId?: string; razorpayOrderId?: string }
  ): Order => {
    const id = generateOrderId();
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const tax = 0;
    const total = subtotal + tax;
    const qrToken = generateSecureToken(id);

    let activeUserId = customerDetails?.id;
    let activeUserName = customerDetails?.name;
    let activeUserPhone = customerDetails?.phone;
    let activeUserEmail = customerDetails?.email;
    let activeUserAvatar = customerDetails?.avatarUrl;

    if ((!activeUserId || !activeUserEmail) && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bc_custom_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          activeUserId = activeUserId || parsed.id;
          activeUserName = activeUserName || parsed.name;
          activeUserPhone = activeUserPhone || parsed.phone;
          activeUserEmail = activeUserEmail || parsed.email;
          activeUserAvatar = activeUserAvatar || parsed.avatarUrl;
        }
      } catch {}
    }

    const paymentId = paymentInfo?.paymentId || `pay_RPZ${Date.now()}`;
    const razorpayOrderId = paymentInfo?.razorpayOrderId || `order_RPZ${Date.now().toString().slice(-6)}`;

    // An order is strictly created as a verified paid food token
    const newOrder: Order = {
      id,
      userId: activeUserId || 'customer-online',
      userName: activeUserName || 'Online Customer',
      userPhone: activeUserPhone || undefined,
      userEmail: activeUserEmail || undefined,
      userAvatar: activeUserAvatar || undefined,
      items,
      subtotal,
      tax,
      total,
      orderStatus: 'READY',
      paymentStatus: 'VERIFIED',
      paymentId,
      razorpayOrderId,
      qrToken,
      createdAt: new Date().toISOString(),
      notes,
    };

    setOrders((prev) => [
      newOrder,
      ...prev.filter((o) => o.orderStatus !== 'PAYMENT_PENDING' && o.paymentStatus === 'VERIFIED'),
    ]);

    safeDbSync(() => supabase.from('orders').insert(mapOrderToDb(newOrder)));
    logCanteenEvent('order_created', {
      order_id: id,
      total,
      item_count: items.length,
      payment_id: paymentId,
    });

    addNotification(
      `Payment Verified: #${id}`,
      `Payment confirmed. Your Digital QR token #${id} is active for pickup at Counter 1.`,
      'payment',
      id
    );

    return newOrder;
  };

  const createCashPosOrder = (
    items: OrderItem[],
    customerDetails?: { name?: string; phone?: string; notes?: string }
  ): Order => {
    const id = generateOrderId();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = 0;
    const total = subtotal + tax;
    const qrToken = generateSecureToken(id);

    const newOrder: Order = {
      id,
      userId: 'pos-counter-walkin',
      userName: customerDetails?.name?.trim() || 'Walk-in Cash Customer',
      userPhone: customerDetails?.phone?.trim() || 'POS Counter',
      items,
      subtotal,
      tax,
      total,
      orderStatus: 'READY',
      paymentStatus: 'VERIFIED',
      paymentId: `CASH_POS_${Date.now()}`,
      razorpayOrderId: `POS_CASH_TILL_${Date.now().toString().slice(-6)}`,
      qrToken,
      createdAt: new Date().toISOString(),
      notes: customerDetails?.notes || 'Paid in Cash at Admin POS Counter',
    };

    setOrders((prev) => [newOrder, ...prev]);

    safeDbSync(() => supabase.from('orders').insert(mapOrderToDb(newOrder)));
    logCanteenEvent('cash_pos_order', {
      order_id: id,
      total,
      customer: newOrder.userName,
    });

    addNotification(
      `Cash POS Token #${newOrder.id} Generated`,
      `Token #${newOrder.id} for ${newOrder.userName} generated at counter. Amount: ₹${total}`,
      'payment',
      newOrder.id
    );

    return newOrder;
  };

  const verifyPayment = (orderId: string, paymentId: string): Order | null => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          updatedOrder = {
            ...ord,
            orderStatus: 'READY',
            paymentStatus: 'VERIFIED',
            paymentId,
            razorpayOrderId: `order_RPZ${Date.now().toString().slice(-6)}`,
          };

          safeDbSync(() =>
            supabase
              .from('orders')
              .update({
                order_status: 'READY',
                payment_status: 'VERIFIED',
                payment_id: paymentId,
                razorpay_order_id: updatedOrder?.razorpayOrderId,
              })
              .eq('id', orderId)
          );

          return updatedOrder;
        }
        return ord;
      })
    );

    if (updatedOrder) {
      logCanteenEvent('payment_verified', {
        order_id: orderId,
        payment_id: paymentId,
      });

      addNotification(
        `Payment Verified: #${orderId}`,
        `Payment confirmed. Your Digital QR token is ready for canteen counter collection.`,
        'payment',
        orderId
      );
    }
    return updatedOrder;
  };

  // Duplicate QR protection & Order Serving
  const serveOrder = (tokenOrId: string, serverName = 'Canteen Staff') => {
    let cleanToken = (tokenOrId || '').trim();
    if (cleanToken.includes('/orders/')) {
      const match = cleanToken.match(/\/orders\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        cleanToken = match[1];
      }
    }
    const cleanId = cleanToken.replace(/^#/, '').trim();
    const order = orders.find(
      (o) =>
        o.id.toUpperCase() === cleanId.toUpperCase() ||
        o.id.toUpperCase() === cleanToken.toUpperCase() ||
        o.qrToken === cleanToken ||
        o.qrToken === tokenOrId.trim()
    );

    if (!order) {
      return {
        success: false,
        error: 'Invalid token or Order not found in the canteen database.',
      };
    }

    if (order.paymentStatus !== 'VERIFIED') {
      return {
        success: false,
        order,
        error: 'Payment not verified for this order. Please advise customer to complete payment.',
      };
    }

    // DUPLICATE QR PROTECTION
    if (order.orderStatus === 'SERVED') {
      const servedTime = order.servedAt
        ? new Date(order.servedAt).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'earlier today';
      return {
        success: false,
        order,
        servedAt: servedTime,
        error: `ORDER ALREADY SERVED at ${servedTime}. This token cannot be used again.`,
      };
    }

    // Mark as served
    const nowIso = new Date().toISOString();
    const updatedOrder: Order = {
      ...order,
      orderStatus: 'SERVED',
      servedAt: nowIso,
      servedBy: serverName,
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? updatedOrder : o))
    );

    safeDbSync(() =>
      supabase
        .from('orders')
        .update({
          order_status: 'SERVED',
          served_at: nowIso,
          served_by: serverName,
        })
        .eq('id', order.id)
    );

    logCanteenEvent('order_served', {
      order_id: order.id,
      served_by: serverName,
    });

    addNotification(
      `Order #${order.id} Collected`,
      `Your food has been served at ${serverName}. Enjoy your delicious meal!`,
      'order',
      order.id
    );

    return {
      success: true,
      order: updatedOrder,
    };
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'order' | 'payment' | 'menu' | 'alert',
    orderId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      orderId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Native Device / Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/logo-icon.png',
        });
      } catch {
        // Fallback for restricted contexts
      }
    }
  };

  const requestDeviceNotificationPermission = async () => {
    const result = await requestFirebaseNotificationPermission();
    return !!result;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Automated meal time transition notification
  const lastMealCategoryRef = React.useRef<string>('');
  useEffect(() => {
    if (!activeMealInfo || !activeMealInfo.category) return;
    if (lastMealCategoryRef.current && lastMealCategoryRef.current !== activeMealInfo.category) {
      addNotification(
        `${activeMealInfo.name} is Now Serving! ${activeMealInfo.icon}`,
        `Canteen is now serving fresh ${activeMealInfo.name}. Order your meal token in advance!`,
        'alert'
      );
    }
    lastMealCategoryRef.current = activeMealInfo.category;
  }, [activeMealInfo.category, activeMealInfo.name, activeMealInfo.icon]);

  return (
    <CanteenContext.Provider
      value={{
        mealSchedules,
        foods,
        orders,
        favorites,
        notifications,
        simulatedTime,
        activeMealInfo,
        effectiveTime,
        currentTimeStr,
        isSupabaseConnected,
        setSimulatedTime,
        updateMealSchedule,
        toggleFoodAvailability,
        toggleFoodVisibility,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFavorite,
        createOrder,
        createCashPosOrder,
        verifyPayment,
        serveOrder,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        requestDeviceNotificationPermission,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const context = useContext(CanteenContext);
  if (!context) throw new Error('useCanteen must be used within a CanteenProvider');
  return context;
}
