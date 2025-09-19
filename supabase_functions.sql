-- Supabase Functions for Aahaara Harmony
-- This file contains database functions for data synchronization and business logic

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, email, first_name, last_name, role, supabase_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync Django user to Supabase
CREATE OR REPLACE FUNCTION public.sync_django_user(
    p_user_id UUID,
    p_username VARCHAR(50),
    p_email VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_role user_role
)
RETURNS UUID AS $$
DECLARE
    v_supabase_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_supabase_id FROM public.users WHERE id = p_user_id;
    
    IF v_supabase_id IS NULL THEN
        -- Create new user
        INSERT INTO public.users (id, username, email, first_name, last_name, role, supabase_id)
        VALUES (p_user_id, p_username, p_email, p_first_name, p_last_name, p_role, p_user_id)
        RETURNING id INTO v_supabase_id;
    ELSE
        -- Update existing user
        UPDATE public.users SET
            username = p_username,
            email = p_email,
            first_name = p_first_name,
            last_name = p_last_name,
            role = p_role,
            updated_at = NOW()
        WHERE id = p_user_id;
        v_supabase_id := p_user_id;
    END IF;
    
    RETURN v_supabase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync doctor profile
CREATE OR REPLACE FUNCTION public.sync_doctor_profile(
    p_user_id UUID,
    p_qualification VARCHAR(200),
    p_experience_years INTEGER,
    p_license_number VARCHAR(100),
    p_specialization VARCHAR(100),
    p_bio TEXT,
    p_consultation_fee DECIMAL(10,2)
)
RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO v_profile_id FROM public.doctor_profiles WHERE user_id = p_user_id;
    
    IF v_profile_id IS NULL THEN
        -- Create new profile
        INSERT INTO public.doctor_profiles (
            user_id, qualification, experience_years, license_number,
            specialization, bio, consultation_fee
        )
        VALUES (
            p_user_id, p_qualification, p_experience_years, p_license_number,
            p_specialization, p_bio, p_consultation_fee
        )
        RETURNING id INTO v_profile_id;
    ELSE
        -- Update existing profile
        UPDATE public.doctor_profiles SET
            qualification = p_qualification,
            experience_years = p_experience_years,
            license_number = p_license_number,
            specialization = p_specialization,
            bio = p_bio,
            consultation_fee = p_consultation_fee,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync patient profile
CREATE OR REPLACE FUNCTION public.sync_patient_profile(
    p_user_id UUID,
    p_age INTEGER,
    p_gender gender_type,
    p_location VARCHAR(255),
    p_phone_number VARCHAR(20)
)
RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO v_profile_id FROM public.patient_profiles WHERE user_id = p_user_id;
    
    IF v_profile_id IS NULL THEN
        -- Create new profile
        INSERT INTO public.patient_profiles (
            user_id, age, gender, location, phone_number
        )
        VALUES (
            p_user_id, p_age, p_gender, p_location, p_phone_number
        )
        RETURNING id INTO v_profile_id;
    ELSE
        -- Update existing profile
        UPDATE public.patient_profiles SET
            age = p_age,
            gender = p_gender,
            location = p_location,
            phone_number = p_phone_number,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION public.get_user_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_role user_role;
    v_result JSON;
BEGIN
    -- Get user role
    SELECT role INTO v_user_role FROM public.users WHERE id = p_user_id;
    
    IF v_user_role = 'doctor' THEN
        -- Return doctor dashboard data
        SELECT json_build_object(
            'user', (SELECT to_json(u.*) FROM public.users u WHERE u.id = p_user_id),
            'profile', (SELECT to_json(dp.*) FROM public.doctor_profiles dp WHERE dp.user_id = p_user_id),
            'patients_count', (SELECT COUNT(*) FROM public.patients WHERE doctor_id = p_user_id),
            'consultations_count', (SELECT COUNT(*) FROM public.consultations WHERE doctor_id = p_user_id),
            'recent_consultations', (
                SELECT json_agg(to_json(c.*))
                FROM public.consultations c
                WHERE c.doctor_id = p_user_id
                ORDER BY c.created_at DESC
                LIMIT 5
            )
        ) INTO v_result;
    ELSIF v_user_role = 'patient' THEN
        -- Return patient dashboard data
        SELECT json_build_object(
            'user', (SELECT to_json(u.*) FROM public.users u WHERE u.id = p_user_id),
            'profile', (SELECT to_json(pp.*) FROM public.patient_profiles pp WHERE pp.user_id = p_user_id),
            'doctor', (
                SELECT to_json(d.*)
                FROM public.users d
                JOIN public.patients p ON d.id = p.doctor_id
                WHERE p.user_id = p_user_id
            ),
            'diet_charts_count', (
                SELECT COUNT(*)
                FROM public.diet_charts dc
                JOIN public.patients p ON dc.patient_id = p.id
                WHERE p.user_id = p_user_id
            ),
            'recent_consultations', (
                SELECT json_agg(to_json(c.*))
                FROM public.consultations c
                JOIN public.patients p ON c.patient_id = p.id
                WHERE p.user_id = p_user_id
                ORDER BY c.created_at DESC
                LIMIT 5
            )
        ) INTO v_result;
    ELSE
        v_result := json_build_object('error', 'Invalid user role');
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search food items
CREATE OR REPLACE FUNCTION public.search_food_items(
    p_search_term TEXT,
    p_category VARCHAR(100) DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    description TEXT,
    category VARCHAR(100),
    calories_per_100g DECIMAL(8,2),
    ayurvedic_properties TEXT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fi.id,
        fi.name,
        fi.description,
        fi.category,
        fi.calories_per_100g,
        fi.ayurvedic_properties,
        fi.image_url
    FROM public.food_items fi
    WHERE 
        (p_search_term IS NULL OR fi.name ILIKE '%' || p_search_term || '%' OR fi.description ILIKE '%' || p_search_term || '%')
        AND (p_category IS NULL OR fi.category = p_category)
    ORDER BY fi.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get diet chart with meal plans
CREATE OR REPLACE FUNCTION public.get_diet_chart_details(p_diet_chart_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'diet_chart', (SELECT to_json(dc.*) FROM public.diet_charts dc WHERE dc.id = p_diet_chart_id),
        'recommendations', (
            SELECT json_agg(to_json(dr.*))
            FROM public.diet_recommendations dr
            WHERE dr.diet_chart_id = p_diet_chart_id
            ORDER BY dr.priority
        ),
        'meal_plans', (
            SELECT json_agg(
                json_build_object(
                    'meal_plan', to_json(mp.*),
                    'meal_items', (
                        SELECT json_agg(
                            json_build_object(
                                'meal_item', to_json(mi.*),
                                'food_item', to_json(fi.*)
                            )
                        )
                        FROM public.meal_items mi
                        JOIN public.food_items fi ON mi.food_item_id = fi.id
                        WHERE mi.meal_plan_id = mp.id
                    )
                )
            )
            FROM public.meal_plans mp
            WHERE mp.diet_chart_id = p_diet_chart_id
            ORDER BY mp.day_number, mp.meal_type
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample food items
CREATE OR REPLACE FUNCTION public.create_sample_food_items()
RETURNS VOID AS $$
BEGIN
    -- Insert sample food items
    INSERT INTO public.food_items (name, description, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, ayurvedic_properties, benefits) VALUES
    ('Basmati Rice', 'Long-grain aromatic rice', 'Grains', 130, 2.7, 28, 0.3, 0.4, 'Sweet, cooling, light', 'Easy to digest, provides energy'),
    ('Moong Dal', 'Split green gram', 'Legumes', 347, 24, 60, 1.2, 16, 'Sweet, cooling, light', 'High protein, easy to digest'),
    ('Ghee', 'Clarified butter', 'Dairy', 900, 0, 0, 100, 0, 'Sweet, cooling, heavy', 'Nourishing, improves digestion'),
    ('Turmeric', 'Golden spice', 'Spices', 354, 7.8, 64.9, 9.9, 21, 'Bitter, pungent, heating', 'Anti-inflammatory, antioxidant'),
    ('Ginger', 'Fresh root', 'Spices', 80, 1.8, 17.8, 0.8, 2, 'Pungent, heating, light', 'Digestive, warming'),
    ('Cumin', 'Cumin seeds', 'Spices', 375, 17.8, 44.2, 22.3, 10.5, 'Pungent, heating, light', 'Digestive, carminative'),
    ('Coriander', 'Coriander seeds', 'Spices', 298, 12.4, 54.9, 17.8, 41.9, 'Sweet, cooling, light', 'Cooling, digestive'),
    ('Cardamom', 'Green cardamom', 'Spices', 311, 10.8, 68.5, 6.7, 28, 'Sweet, pungent, heating', 'Aromatic, digestive'),
    ('Cinnamon', 'Cinnamon bark', 'Spices', 247, 4, 80.6, 1.2, 53.1, 'Sweet, pungent, heating', 'Warming, digestive'),
    ('Fennel', 'Fennel seeds', 'Spices', 345, 15.8, 52.3, 14.9, 39.8, 'Sweet, cooling, light', 'Cooling, digestive'),
    ('Almonds', 'Raw almonds', 'Nuts', 579, 21.2, 21.6, 49.9, 12.5, 'Sweet, cooling, heavy', 'Nourishing, brain tonic'),
    ('Dates', 'Fresh dates', 'Fruits', 277, 1.8, 75, 0.2, 6.7, 'Sweet, cooling, heavy', 'Energy, natural sweetener'),
    ('Coconut', 'Fresh coconut', 'Fruits', 354, 3.3, 15.2, 33.5, 9, 'Sweet, cooling, heavy', 'Cooling, nourishing'),
    ('Milk', 'Cow milk', 'Dairy', 42, 3.4, 5, 1, 0, 'Sweet, cooling, heavy', 'Nourishing, calming'),
    ('Yogurt', 'Plain yogurt', 'Dairy', 59, 10, 3.6, 0.4, 0, 'Sour, cooling, heavy', 'Probiotic, digestive'),
    ('Honey', 'Raw honey', 'Sweeteners', 304, 0.3, 82.4, 0, 0.2, 'Sweet, heating, light', 'Natural sweetener, healing'),
    ('Jaggery', 'Cane jaggery', 'Sweeteners', 383, 0.4, 98.1, 0.1, 0, 'Sweet, heating, heavy', 'Natural sweetener, iron-rich'),
    ('Green Tea', 'Green tea leaves', 'Beverages', 1, 0.2, 0, 0, 0, 'Bitter, cooling, light', 'Antioxidant, detoxifying'),
    ('Tulsi', 'Holy basil', 'Herbs', 22, 3.2, 2.6, 0.6, 1.6, 'Pungent, heating, light', 'Adaptogenic, immune support'),
    ('Ashwagandha', 'Indian ginseng', 'Herbs', 250, 3.9, 75, 0.3, 3.5, 'Sweet, heating, heavy', 'Adaptogenic, stress relief');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
