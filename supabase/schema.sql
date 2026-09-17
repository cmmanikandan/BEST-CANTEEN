-- ==============================================================================
-- BEST CANTEEN V1 - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/oetxksvlvswqovfuwucu/sql
-- ==============================================================================

-- 1. Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tamil_name TEXT,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    rating NUMERIC DEFAULT 4.8,
    rating_count INTEGER DEFAULT 120,
    category TEXT NOT NULL,
    available_meals TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_veg BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    calories TEXT,
    preparation_time TEXT,
    ingredients TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Meal Schedules Table
CREATE TABLE IF NOT EXISTS public.meal_schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'CREATED',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    payment_id TEXT,
    razorpay_order_id TEXT,
    qr_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    served_at TIMESTAMPTZ,
    served_by TEXT,
    notes TEXT
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TEXT,
    read BOOLEAN DEFAULT false,
    order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Allow web client anon access for seamless Canteen operations)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon full access to foods" ON public.foods;
    CREATE POLICY "Allow anon full access to foods" ON public.foods FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon full access to meal_schedules" ON public.meal_schedules;
    CREATE POLICY "Allow anon full access to meal_schedules" ON public.meal_schedules FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon full access to orders" ON public.orders;
    CREATE POLICY "Allow anon full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon full access to notifications" ON public.notifications;
    CREATE POLICY "Allow anon full access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 7. Enable Realtime Replication for Live Sync
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'foods'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.foods;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'meal_schedules'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_schedules;
    END IF;
END $$;

-- 8. Seed Initial Meal Schedules
INSERT INTO public.meal_schedules (id, name, label, icon, start_time, end_time, is_all_day, is_active)
VALUES 
    ('breakfast', 'Breakfast', '🌅 Breakfast', '🌅', '07:00', '10:30', false, true),
    ('lunch', 'Lunch', '🍛 Lunch', '🍛', '11:45', '15:30', false, true),
    ('snacks', 'Snacks', '🍪 Snacks', '🍪', '15:30', '18:30', false, true),
    ('dinner', 'Dinner', '🌙 Dinner', '🌙', '19:00', '22:30', false, true)
ON CONFLICT (id) DO NOTHING;

-- 9. Setup Supabase Storage Bucket for Food Images & Assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view food images" ON storage.objects;
    CREATE POLICY "Public can view food images" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');

    DROP POLICY IF EXISTS "Allow upload to food images" ON storage.objects;
    CREATE POLICY "Allow upload to food images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images');

    DROP POLICY IF EXISTS "Allow update food images" ON storage.objects;
    CREATE POLICY "Allow update food images" ON storage.objects FOR UPDATE USING (bucket_id = 'food-images');
END $$;

