import { createClient } from '@supabase/supabase-js';
import { FoodItem, MealSchedule, Order, MealCategory } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oetxksvlvswqovfuwucu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mEIkOgDAVdfgMPEi_7cBAw_u_lhrU5S';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper: Database Order to App Order
export function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id || 'pos-counter-walkin',
    userName: row.user_name || 'Walk-in Customer',
    userPhone: row.user_phone || '',
    items: Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]'),
    subtotal: Number(row.subtotal) || 0,
    tax: Number(row.tax) || 0,
    total: Number(row.total) || 0,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    paymentId: row.payment_id || undefined,
    razorpayOrderId: row.razorpay_order_id || undefined,
    qrToken: row.qr_token || row.id,
    createdAt: row.created_at || new Date().toISOString(),
    servedAt: row.served_at || undefined,
    servedBy: row.served_by || undefined,
    notes: row.notes || undefined,
  };
}

// Helper: App Order to Database Record
export function mapOrderToDb(order: Order) {
  return {
    id: order.id,
    user_id: order.userId,
    user_name: order.userName,
    user_phone: order.userPhone,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    payment_id: order.paymentId || null,
    razorpay_order_id: order.razorpayOrderId || null,
    qr_token: order.qrToken,
    created_at: order.createdAt,
    served_at: order.servedAt || null,
    served_by: order.servedBy || null,
    notes: order.notes || null,
  };
}

// Helper: Database Food to App FoodItem
export function mapFoodFromDb(row: any): FoodItem {
  const cat = (row.category || 'lunch') as MealCategory;
  const rawMeals = Array.isArray(row.available_meals) ? row.available_meals : [];
  
  // Sanitize legacy bug where [category, 'snacks'] was automatically saved
  let availableMeals: MealCategory[];
  if (rawMeals.length > 0) {
    const validMeals = rawMeals.filter((m: any) =>
      ['breakfast', 'lunch', 'snacks', 'dinner'].includes(m)
    ) as MealCategory[];
    
    // If rawMeals only contains the category and 'snacks', and category is NOT 'snacks', strip legacy 'snacks'
    if (validMeals.length === 2 && validMeals.includes('snacks') && validMeals.includes(cat) && cat !== 'snacks') {
      availableMeals = [cat];
    } else if (validMeals.length > 0) {
      availableMeals = validMeals.includes(cat) ? validMeals : [...validMeals, cat];
    } else {
      availableMeals = [cat];
    }
  } else {
    availableMeals = [cat];
  }

  return {
    id: row.id,
    name: row.name,
    tamilName: row.tamil_name || undefined,
    description: row.description || '',
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rating: Number(row.rating) || 4.8,
    ratingCount: Number(row.rating_count) || 120,
    category: cat,
    availableMeals,
    imageUrl: row.image_url || '/logo.png',
    isAvailable: row.is_available !== false,
    isVisible: row.is_visible !== false,
    isVeg: Boolean(row.is_veg),
    isPopular: Boolean(row.is_popular),
    calories: row.calories || undefined,
    preparationTime: row.preparation_time || undefined,
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
  };
}

// Helper: App FoodItem to Database Record
export function mapFoodToDb(food: FoodItem) {
  const cat = food.category || 'lunch';
  const availableMeals = Array.isArray(food.availableMeals) && food.availableMeals.length > 0
    ? (food.availableMeals.includes(cat) ? food.availableMeals : [...food.availableMeals, cat])
    : [cat];

  return {
    id: food.id,
    name: food.name,
    tamil_name: food.tamilName || null,
    description: food.description,
    price: food.price,
    original_price: food.originalPrice || null,
    rating: food.rating,
    rating_count: food.ratingCount,
    category: cat,
    available_meals: availableMeals,
    image_url: food.imageUrl,
    is_available: food.isAvailable ?? true,
    is_visible: food.isVisible ?? true,
    is_veg: food.isVeg,
    is_popular: food.isPopular ?? false,
    calories: food.calories || null,
    preparation_time: food.preparationTime || null,
    ingredients: food.ingredients || [],
  };
}

// Helper: Database Schedule to App MealSchedule
export function mapScheduleFromDb(row: any): MealSchedule {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    icon: row.icon,
    startTime: row.start_time,
    endTime: row.end_time,
    isAllDay: Boolean(row.is_all_day),
    isActive: Boolean(row.is_active),
  };
}

export function mapScheduleToDb(schedule: MealSchedule) {
  return {
    id: schedule.id,
    name: schedule.name,
    label: schedule.label,
    icon: schedule.icon,
    start_time: schedule.startTime,
    end_time: schedule.endTime,
    is_all_day: schedule.isAllDay ?? false,
    is_active: schedule.isActive ?? true,
  };
}

// Safe async runner that handles PostgrestBuilder / PromiseLike gracefully
export function safeDbSync(action: () => any) {
  try {
    const res = action();
    if (res && typeof res.then === 'function') {
      res.then(
        () => {},
        (err: any) => console.log('Supabase sync notice (safe fallback):', err?.message || err)
      );
    }
  } catch (err: any) {
    console.log('Supabase sync notice (safe fallback):', err?.message || err);
  }
}

// Upload images to Supabase Storage bucket ('food-images' or 'canteen-media')
export async function uploadImageToSupabase(
  file: File | Blob,
  bucket = 'food-images',
  customFileName?: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    const fileExt = file.type ? file.type.split('/')[1] || 'jpg' : 'jpg';
    const fileName =
      customFileName || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { publicUrl: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { publicUrl: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { publicUrl: null, error: err?.message || 'Storage upload error' };
  }
}


