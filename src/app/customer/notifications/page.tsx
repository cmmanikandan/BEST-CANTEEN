'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCanteen } from '@/context/CanteenContext';
import { Bell, ArrowLeft, X, ChevronRight } from 'lucide-react';

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    requestDeviceNotificationPermission,
  } = useCanteen();
  const [devicePushEnabled, setDevicePushEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDevicePushEnabled(Notification.permission === 'granted');
    }

    // Automatically mark all notifications as seen when user visits the notifications screen
    const timer = setTimeout(() => {
      markAllNotificationsAsRead();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDetail = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.orderId) {
      router.push('/customer/orders');
    } else if (n.foodId) {
      router.push(`/customer/food/${n.foodId}`);
    } else {
      router.push('/customer/menu');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/home"
            className="p-2 -ml-2 rounded-full text-[#5C4E46] hover:text-[#201611] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#201611] tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-[#5C4E46]">
              Real-time updates on your orders and canteen schedules
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-[#FF5722] hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl transition active:scale-95 shrink-0"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Device Push Notification Banner */}
      {!devicePushEnabled && (
        <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 border border-orange-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg">🔔</span>
            <div className="min-w-0">
              <p className="font-bold text-[#201611] truncate">Enable Device Push Notifications</p>
              <p className="text-[11px] text-[#5C4E46] truncate">Get instant pop-ups on your device when meal is ready</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const ok = await requestDeviceNotificationPermission();
              setDevicePushEnabled(ok);
            }}
            className="px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl text-xs shrink-0 shadow-xs transition active:scale-95"
          >
            Enable
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#201611]">No notifications</h3>
          <p className="text-xs text-[#5C4E46]">You are all caught up with your canteen updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={() => handleOpenDetail(n)}
                className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  !n.read
                    ? 'bg-white border-orange-200/90 shadow-xs hover:border-[#FF5722]/50'
                    : 'bg-[#FAF8F5] border-stone-200/70 opacity-85 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0 mt-0.5 ${
                      n.type === 'order'
                        ? 'bg-emerald-100 text-[#16A34A]'
                        : n.type === 'payment'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-[#FF5722]'
                    }`}
                  >
                    {n.type === 'order' ? '🟢' : n.type === 'payment' ? '💳' : '🍛'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-[#201611] truncate">
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5722] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5C4E46] mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1.5">{n.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  {/* View Detail Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(n);
                    }}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-[#FF5722] text-[#FF5722] hover:text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-2xs"
                    title="View details"
                  >
                    <span>View Detail</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {/* Delete Notification Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-xl transition"
                    title="Dismiss notification"
                    aria-label="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
