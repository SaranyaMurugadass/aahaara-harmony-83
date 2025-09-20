-- Diet Chart Schema for Supabase
-- This table stores generated diet charts for patients

CREATE TABLE IF NOT EXISTS public.diet_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    created_by UUID NOT NULL, -- Doctor who created the chart
    chart_name TEXT NOT NULL,
    chart_type TEXT NOT NULL DEFAULT '7_day', -- 7_day, 14_day, 30_day, custom
    status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed, archived
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 7,
    
    -- Patient Analysis Data (snapshot at time of creation)
    prakriti_analysis JSONB, -- Snapshot of prakriti analysis
    disease_analysis JSONB, -- Snapshot of disease analysis
    patient_preferences JSONB, -- Dietary preferences, allergies, etc.
    
    -- Chart Configuration
    target_calories INTEGER,
    meal_distribution JSONB, -- {breakfast: 0.25, lunch: 0.35, dinner: 0.25, snacks: 0.15}
    dosha_focus TEXT[], -- Which doshas to focus on (pacify/aggravate)
    food_restrictions TEXT[], -- Vegetarian, vegan, gluten-free, etc.
    
    -- Chart Content
    daily_meals JSONB NOT NULL, -- The actual meal plan for each day
    -- Structure: {day1: {breakfast: {...}, lunch: {...}, dinner: {...}}, day2: {...}}
    
    -- Metadata
    notes TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    generation_parameters JSONB, -- Parameters used for AI generation
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_diet_chart_patient FOREIGN KEY (patient_id) REFERENCES public.unified_patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_diet_chart_created_by FOREIGN KEY (created_by) REFERENCES public.unified_users(id) ON DELETE CASCADE,
    CONSTRAINT check_chart_type CHECK (chart_type IN ('7_day', '14_day', '30_day', 'custom')),
    CONSTRAINT check_status CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    CONSTRAINT check_positive_days CHECK (total_days > 0),
    CONSTRAINT check_positive_calories CHECK (target_calories IS NULL OR target_calories > 0),
    CONSTRAINT check_date_order CHECK (start_date <= end_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diet_charts_patient_id ON public.diet_charts (patient_id);
CREATE INDEX IF NOT EXISTS idx_diet_charts_created_by ON public.diet_charts (created_by);
CREATE INDEX IF NOT EXISTS idx_diet_charts_status ON public.diet_charts (status);
CREATE INDEX IF NOT EXISTS idx_diet_charts_chart_type ON public.diet_charts (chart_type);
CREATE INDEX IF NOT EXISTS idx_diet_charts_start_date ON public.diet_charts (start_date);
CREATE INDEX IF NOT EXISTS idx_diet_charts_created_at ON public.diet_charts (created_at);

-- Add GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_diet_charts_prakriti_analysis ON public.diet_charts USING GIN (prakriti_analysis);
CREATE INDEX IF NOT EXISTS idx_diet_charts_disease_analysis ON public.diet_charts USING GIN (disease_analysis);
CREATE INDEX IF NOT EXISTS idx_diet_charts_daily_meals ON public.diet_charts USING GIN (daily_meals);

-- Enable Row Level Security (RLS)
ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;

-- Policy for doctors to read all diet charts
DROP POLICY IF EXISTS "Allow doctors to read all diet charts" ON public.diet_charts;
CREATE POLICY "Allow doctors to read all diet charts"
ON public.diet_charts FOR SELECT
TO authenticated
USING (TRUE); -- All authenticated users can read (doctors and patients)

-- Policy for doctors to insert diet charts
DROP POLICY IF EXISTS "Allow doctors to insert diet charts" ON public.diet_charts;
CREATE POLICY "Allow doctors to insert diet charts"
ON public.diet_charts FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Policy for doctors to update diet charts
DROP POLICY IF EXISTS "Allow doctors to update diet charts" ON public.diet_charts;
CREATE POLICY "Allow doctors to update diet charts"
ON public.diet_charts FOR UPDATE
TO authenticated
USING (TRUE);

-- Policy for doctors to delete diet charts
DROP POLICY IF EXISTS "Allow doctors to delete diet charts" ON public.diet_charts;
CREATE POLICY "Allow doctors to delete diet charts"
ON public.diet_charts FOR DELETE
TO authenticated
USING (TRUE);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_diet_charts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_diet_charts_updated_at ON public.diet_charts;
CREATE TRIGGER trigger_update_diet_charts_updated_at
    BEFORE UPDATE ON public.diet_charts
    FOR EACH ROW
    EXECUTE FUNCTION update_diet_charts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.diet_charts IS 'Stores generated diet charts for patients with full meal plans and analysis data';
COMMENT ON COLUMN public.diet_charts.daily_meals IS 'JSONB structure containing the complete meal plan for each day';
COMMENT ON COLUMN public.diet_charts.prakriti_analysis IS 'Snapshot of prakriti analysis data at the time of chart creation';
COMMENT ON COLUMN public.diet_charts.disease_analysis IS 'Snapshot of disease analysis data at the time of chart creation';
COMMENT ON COLUMN public.diet_charts.meal_distribution IS 'Percentage distribution of calories across meals';
COMMENT ON COLUMN public.diet_charts.dosha_focus IS 'Array of doshas to focus on (e.g., ["pacify_vata", "aggravate_kapha"])';
COMMENT ON COLUMN public.diet_charts.generation_parameters IS 'Parameters used for AI generation (model version, preferences, etc.)';

