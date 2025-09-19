-- Fix Supabase schema for Django integration
-- Run this in your Supabase SQL Editor

-- Drop the existing users table and recreate it without foreign key constraints
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the new users table (standalone, not linked to auth.users)
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    django_id INTEGER UNIQUE, -- Reference to Django user ID
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    password_hash VARCHAR(255), -- Store password hash for Django users
    is_active BOOLEAN DEFAULT true,
    is_staff BOOLEAN DEFAULT false,
    is_superuser BOOLEAN DEFAULT false,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update doctor_profiles table to reference the new users table
ALTER TABLE public.doctor_profiles 
DROP CONSTRAINT IF EXISTS doctor_profiles_user_id_fkey;

ALTER TABLE public.doctor_profiles 
ADD CONSTRAINT doctor_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update patient_profiles table to reference the new users table
ALTER TABLE public.patient_profiles 
DROP CONSTRAINT IF EXISTS patient_profiles_user_id_fkey;

ALTER TABLE public.patient_profiles 
ADD CONSTRAINT patient_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_django_id ON public.users(django_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
