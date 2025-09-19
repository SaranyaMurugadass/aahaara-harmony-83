-- Row Level Security (RLS) Policies for Aahaara Harmony
-- This file contains all the RLS policies for data access control

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prakriti_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is doctor
CREATE OR REPLACE FUNCTION is_doctor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'doctor' FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is patient
CREATE OR REPLACE FUNCTION is_patient(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'patient' FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can view their patients" ON public.users
    FOR SELECT USING (
        is_doctor(auth.uid()) AND 
        id IN (
            SELECT user_id FROM public.patients WHERE doctor_id = auth.uid()
        )
    );

-- Doctor profiles policies
CREATE POLICY "Doctors can view their own profile" ON public.doctor_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Patients can view doctor profiles" ON public.doctor_profiles
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Doctors can insert their own profile" ON public.doctor_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Patient profiles policies
CREATE POLICY "Patients can view their own profile" ON public.patient_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can update their own profile" ON public.patient_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Doctors can view their patients' profiles" ON public.patient_profiles
    FOR SELECT USING (
        is_doctor(auth.uid()) AND 
        user_id IN (
            SELECT user_id FROM public.patients WHERE doctor_id = auth.uid()
        )
    );

CREATE POLICY "Patients can insert their own profile" ON public.patient_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Patients table policies
CREATE POLICY "Patients can view their own record" ON public.patients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can view their patients" ON public.patients
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their patients" ON public.patients
    FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert patients" ON public.patients
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

-- Disease analysis policies
CREATE POLICY "Patients can view their disease analysis" ON public.disease_analysis
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their patients' disease analysis" ON public.disease_analysis
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create disease analysis" ON public.disease_analysis
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update disease analysis" ON public.disease_analysis
    FOR UPDATE USING (doctor_id = auth.uid());

-- Prakriti analysis policies
CREATE POLICY "Patients can view their prakriti analysis" ON public.prakriti_analysis
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their patients' prakriti analysis" ON public.prakriti_analysis
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create prakriti analysis" ON public.prakriti_analysis
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update prakriti analysis" ON public.prakriti_analysis
    FOR UPDATE USING (doctor_id = auth.uid());

-- Consultations policies
CREATE POLICY "Patients can view their consultations" ON public.consultations
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their consultations" ON public.consultations
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create consultations" ON public.consultations
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update consultations" ON public.consultations
    FOR UPDATE USING (doctor_id = auth.uid());

-- Food items policies (public read access)
CREATE POLICY "Anyone can view food items" ON public.food_items
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert food items" ON public.food_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update food items" ON public.food_items
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Diet charts policies
CREATE POLICY "Patients can view their diet charts" ON public.diet_charts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their patients' diet charts" ON public.diet_charts
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create diet charts" ON public.diet_charts
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update diet charts" ON public.diet_charts
    FOR UPDATE USING (doctor_id = auth.uid());

-- Diet recommendations policies
CREATE POLICY "Patients can view their diet recommendations" ON public.diet_recommendations
    FOR SELECT USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE patient_id IN (
                SELECT id FROM public.patients WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Doctors can view diet recommendations" ON public.diet_recommendations
    FOR SELECT USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can create diet recommendations" ON public.diet_recommendations
    FOR INSERT WITH CHECK (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update diet recommendations" ON public.diet_recommendations
    FOR UPDATE USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

-- Meal plans policies
CREATE POLICY "Patients can view their meal plans" ON public.meal_plans
    FOR SELECT USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE patient_id IN (
                SELECT id FROM public.patients WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Doctors can view meal plans" ON public.meal_plans
    FOR SELECT USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can create meal plans" ON public.meal_plans
    FOR INSERT WITH CHECK (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update meal plans" ON public.meal_plans
    FOR UPDATE USING (
        diet_chart_id IN (
            SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
        )
    );

-- Meal items policies
CREATE POLICY "Patients can view their meal items" ON public.meal_items
    FOR SELECT USING (
        meal_plan_id IN (
            SELECT id FROM public.meal_plans WHERE diet_chart_id IN (
                SELECT id FROM public.diet_charts WHERE patient_id IN (
                    SELECT id FROM public.patients WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Doctors can view meal items" ON public.meal_items
    FOR SELECT USING (
        meal_plan_id IN (
            SELECT id FROM public.meal_plans WHERE diet_chart_id IN (
                SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
            )
        )
    );

CREATE POLICY "Doctors can create meal items" ON public.meal_items
    FOR INSERT WITH CHECK (
        meal_plan_id IN (
            SELECT id FROM public.meal_plans WHERE diet_chart_id IN (
                SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
            )
        )
    );

CREATE POLICY "Doctors can update meal items" ON public.meal_items
    FOR UPDATE USING (
        meal_plan_id IN (
            SELECT id FROM public.meal_plans WHERE diet_chart_id IN (
                SELECT id FROM public.diet_charts WHERE doctor_id = auth.uid()
            )
        )
    );
