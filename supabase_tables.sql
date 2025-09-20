-- Supabase Tables for Aahaara Harmony
-- Create tables for Prakriti Analysis, Disease Analysis, and related data

-- 1. Prakriti Analysis Table
CREATE TABLE IF NOT EXISTS prakriti_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    django_id UUID NOT NULL UNIQUE,
    patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
    django_patient_id UUID NOT NULL,
    primary_dosha VARCHAR(20) NOT NULL CHECK (primary_dosha IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha')),
    secondary_dosha VARCHAR(20) CHECK (secondary_dosha IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha')),
    vata_score INTEGER NOT NULL DEFAULT 0,
    pitta_score INTEGER NOT NULL DEFAULT 0,
    kapha_score INTEGER NOT NULL DEFAULT 0,
    analysis_notes TEXT,
    recommendations TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
    analyzed_by_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
    django_analyzed_by_id UUID NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Disease Analysis Table
CREATE TABLE IF NOT EXISTS disease_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    django_id UUID NOT NULL UNIQUE,
    patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
    django_patient_id UUID NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cured', 'chronic')),
    symptoms TEXT NOT NULL,
    diagnosis_notes TEXT,
    treatment_plan TEXT,
    medications JSONB DEFAULT '[]'::jsonb,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    diagnosed_by_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
    django_diagnosed_by_id UUID NOT NULL,
    diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    django_id UUID NOT NULL UNIQUE,
    patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
    django_patient_id UUID NOT NULL,
    doctor_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
    django_doctor_id UUID NOT NULL,
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('initial', 'follow_up', 'emergency', 'routine', 'telemedicine', 'diet_review')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT NOT NULL,
    history_of_present_illness TEXT,
    physical_examination TEXT,
    vital_signs JSONB DEFAULT '{}'::jsonb,
    assessment TEXT,
    plan TEXT,
    prescription TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 30,
    actual_duration INTEGER,
    consultation_fee DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prakriti_analyses_patient_id ON prakriti_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_analyses_django_patient_id ON prakriti_analyses(django_patient_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_analyses_status ON prakriti_analyses(status);
CREATE INDEX IF NOT EXISTS idx_prakriti_analyses_analysis_date ON prakriti_analyses(analysis_date);

CREATE INDEX IF NOT EXISTS idx_disease_analyses_patient_id ON disease_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_django_patient_id ON disease_analyses(django_patient_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_status ON disease_analyses(status);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_is_active ON disease_analyses(is_active);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_django_patient_id ON consultations(django_patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_consultation_date ON consultations(consultation_date);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
CREATE TRIGGER update_prakriti_analyses_updated_at 
    BEFORE UPDATE ON prakriti_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_analyses_updated_at 
    BEFORE UPDATE ON disease_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at 
    BEFORE UPDATE ON consultations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS) for data protection
ALTER TABLE prakriti_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies (basic - can be customized based on requirements)
CREATE POLICY "Users can view their own analyses" ON prakriti_analyses
    FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY "Users can view their own disease analyses" ON disease_analyses
    FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY "Users can view their own consultations" ON consultations
    FOR SELECT USING (true); -- Adjust based on your auth requirements

-- 9. Grant necessary permissions
GRANT ALL ON prakriti_analyses TO authenticated;
GRANT ALL ON disease_analyses TO authenticated;
GRANT ALL ON consultations TO authenticated;


