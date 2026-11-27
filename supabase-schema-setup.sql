-- =====================================================================
-- APPOINTMENT BOOKING SYSTEM - SUPABASE DATABASE CONFIGURATION & SEED
-- =====================================================================
-- Run this in your Supabase Project: Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Ensure Services Table exists & insert initial services
CREATE TABLE IF NOT EXISTS public.services (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public and authenticated) to view active services
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

-- Seed initial services if empty
INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'General Consultation', 'Get professional medical advice, comprehensive assessment, and expert guidance from certified physicians.', 45, 25.00, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'General Consultation');

INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'Dental Care & Checkup', 'Comprehensive oral examination, hygiene cleaning, digital x-rays, and specialized dental treatment.', 60, 35.00, 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Dental Care & Checkup');

INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'Full Body Health Checkup', 'Complete vital statistics evaluation, blood pressure monitoring, heart screening, and laboratory diagnostics.', 90, 45.00, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Full Body Health Checkup');

INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'Dermatology & Skin Care', 'Specialized dermatological consultations, advanced skin analysis, allergy treatments, and skincare plans.', 45, 30.00, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Dermatology & Skin Care');

INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'Cardiology Consultation', 'Advanced cardiovascular screening, ECG tests, blood vessel health, and personalized preventive therapy.', 60, 50.00, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Cardiology Consultation');

INSERT INTO public.services (name, description, duration_minutes, price, image_url, is_active)
SELECT 'Mental Health & Therapy', 'Confidential, supportive, and compassionate sessions with experienced clinical psychologists.', 60, 40.00, 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Mental Health & Therapy');


-- 2. Ensure Time Slots Table exists & has standard slots
CREATE TABLE IF NOT EXISTS public.time_slots (
    id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view time slots" ON public.time_slots;
CREATE POLICY "Public can view time slots" 
ON public.time_slots 
FOR SELECT 
USING (true);

-- Ensure 7 default slots exist
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '09:00:00'::TIME, '10:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '09:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '10:00:00'::TIME, '11:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '10:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '11:00:00'::TIME, '12:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '11:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '13:00:00'::TIME, '14:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '13:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '14:00:00'::TIME, '15:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '14:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '15:00:00'::TIME, '16:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '15:00:00');
INSERT INTO public.time_slots (start_time, end_time, is_available)
SELECT '16:00:00'::TIME, '17:00:00'::TIME, true WHERE NOT EXISTS (SELECT 1 FROM public.time_slots WHERE start_time = '16:00:00');


-- 3. Profiles Table RLS & Auto-Trigger
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'patient',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Function and trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'patient'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Appointments Table RLS & Unique Slot Handling
CREATE TABLE IF NOT EXISTS public.appointments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Select own appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Insert own appointments
DROP POLICY IF EXISTS "Users can book own appointments" ON public.appointments;
CREATE POLICY "Users can book own appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Update own appointments (e.g. cancel)
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Availability Checking & Slot Collision Prevention
-- IMPORTANT: In a real system, cancelled appointments should free up the time slot.
-- If you currently have an unconditional UNIQUE(appointment_date, appointment_time),
-- run the following to replace it with a partial unique index where status != 'cancelled':
/*
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_appointment_date_appointment_time_key;
DROP INDEX IF EXISTS idx_unique_active_appointments;
CREATE UNIQUE INDEX idx_unique_active_appointments 
ON public.appointments (appointment_date, appointment_time) 
WHERE status != 'cancelled';
*/

-- RPC function to allow users to fetch booked slots for a specific date without exposing personal data:
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_date DATE)
RETURNS TABLE (booked_time TIME) AS $$
BEGIN
    RETURN QUERY
    SELECT appointment_time
    FROM public.appointments
    WHERE appointment_date = p_date
      AND status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_booked_slots(DATE) TO anon, authenticated;
