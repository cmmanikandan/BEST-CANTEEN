import { FoodItem, MealSchedule, Order, CustomerUser, ServerUser, AdminUser } from '@/types';

export const INITIAL_MEAL_SCHEDULES: MealSchedule[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    label: '🌅 Breakfast',
    icon: '🌅',
    startTime: '07:00',
    endTime: '11:30',
    isAllDay: false,
    isActive: true,
  },
  {
    id: 'lunch',
    name: 'Lunch',
    label: '☀️ Lunch',
    icon: '☀️',
    startTime: '11:30',
    endTime: '15:30',
    isAllDay: false,
    isActive: true,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    label: '🍪 Snacks',
    icon: '🍪',
    startTime: '00:00',
    endTime: '23:59',
    isAllDay: true,
    isActive: true,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    label: '🌙 Dinner',
    icon: '🌙',
    startTime: '18:30',
    endTime: '22:30',
    isAllDay: false,
    isActive: true,
  },
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [];

export const DEMO_CUSTOMER: CustomerUser = {
  id: '',
  name: '',
  email: '',
  role: 'customer',
};

export const DEMO_SERVER: ServerUser = {
  id: 'server-ramesh',
  name: 'Ramesh K. (Canteen Staff)',
  counterNumber: 'Canteen Food Counter',
  role: 'server',
};

export const DEMO_ADMIN: AdminUser = {
  id: 'no2L4yONk3RjjFTnY9O5OkiDqbv1',
  name: 'Manikandan Prabhu',
  email: 'manikandanprabhu37@gmail.com',
  role: 'admin',
};

export const INITIAL_ORDERS: Order[] = [];

