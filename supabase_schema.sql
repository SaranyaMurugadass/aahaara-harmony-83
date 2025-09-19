-- Supabase Database Schema for Aahaara Harmony
-- This file contains all the table creation statements for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE prakriti_type AS ENUM ('vata', 'pitta', 'kapha', 'vata_pitta', 'vata_kapha', 'pitta_kapha', 'tridosha');

-- Users table (standalone, not linked to auth.users)
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

-- Doctor profiles table
CREATE TABLE public.doctor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    django_id INTEGER UNIQUE, -- Reference to Django doctor profile ID
    django_user_id INTEGER, -- Reference to Django user ID
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    bio TEXT,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient profiles table
CREATE TABLE public.patient_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    django_id INTEGER UNIQUE, -- Reference to Django patient profile ID
    django_user_id INTEGER, -- Reference to Django user ID
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    age INTEGER NOT NULL,
    gender gender_type NOT NULL,
    location VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (for doctor-patient relationships)
CREATE TABLE public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease analysis table
CREATE TABLE public.disease_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    severity VARCHAR(50),
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prakriti analysis table
CREATE TABLE public.prakriti_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    prakriti_type prakriti_type NOT NULL,
    vata_score INTEGER DEFAULT 0,
    pitta_score INTEGER DEFAULT 0,
    kapha_score INTEGER DEFAULT 0,
    analysis_notes TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE public.consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status consultation_status DEFAULT 'scheduled',
    notes TEXT,
    prescription TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food items table
CREATE TABLE public.food_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    calories_per_100g DECIMAL(8,2),
    protein_per_100g DECIMAL(8,2),
    carbs_per_100g DECIMAL(8,2),
    fat_per_100g DECIMAL(8,2),
    fiber_per_100g DECIMAL(8,2),
    ayurvedic_properties TEXT,
    benefits TEXT,
    contraindications TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet charts table
CREATE TABLE public.diet_charts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet recommendations table
CREATE TABLE public.diet_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    diet_chart_id UUID REFERENCES public.diet_charts(id) ON DELETE CASCADE NOT NULL,
    recommendation_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plans table
CREATE TABLE public.meal_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    diet_chart_id UUID REFERENCES public.diet_charts(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
    timing VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal items table
CREATE TABLE public.meal_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    preparation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_doctor_id ON public.patients(doctor_id);
CREATE INDEX idx_disease_analysis_patient_id ON public.disease_analysis(patient_id);
CREATE INDEX idx_disease_analysis_doctor_id ON public.disease_analysis(doctor_id);
CREATE INDEX idx_prakriti_analysis_patient_id ON public.prakriti_analysis(patient_id);
CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX idx_diet_charts_patient_id ON public.diet_charts(patient_id);
CREATE INDEX idx_meal_plans_diet_chart_id ON public.meal_plans(diet_chart_id);
CREATE INDEX idx_meal_items_meal_plan_id ON public.meal_items(meal_plan_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disease_analysis_updated_at BEFORE UPDATE ON public.disease_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prakriti_analysis_updated_at BEFORE UPDATE ON public.prakriti_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON public.food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diet_charts_updated_at BEFORE UPDATE ON public.diet_charts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diet_recommendations_updated_at BEFORE UPDATE ON public.diet_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_items_updated_at BEFORE UPDATE ON public.meal_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
