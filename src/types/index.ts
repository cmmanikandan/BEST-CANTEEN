export type MealCategory = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'all';

export interface MealSchedule {
  id: string;
  name: string;
  label: string;
  icon: string;
  startTime: string; // "07:00"
  endTime: string;   // "10:30"
  isAllDay?: boolean;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  tamilName?: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  category: MealCategory;
  availableMeals: MealCategory[];
  imageUrl: string;
  isAvailable: boolean;
  isVisible: boolean;
  isVeg: boolean;
  isPopular?: boolean;
  calories?: string;
  preparationTime?: string;
  ingredients?: string[];
}

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'READY'
  | 'SCANNED'
  | 'SERVED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string; // e.g. "BC10482"
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  paymentId?: string;
  razorpayOrderId?: string;
  qrToken: string;
  createdAt: string;
  servedAt?: string;
  servedBy?: string;
  notes?: string;
}

export interface ServerUser {
  id: string;
  name: string;
  counterNumber: string;
  role: 'server';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatarUrl?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer';
  rollNumber?: string;
  avatarUrl?: string;
}

export type UserRole = 'customer' | 'server' | 'admin';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'menu' | 'alert';
  timestamp: string;
  read: boolean;
  orderId?: string;
}
