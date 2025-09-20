-- Fix Supabase RLS Policies for Analysis Tables
-- This script updates the Row Level Security policies to allow proper access

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own analyses" ON prakriti_analyses;
DROP POLICY IF EXISTS "Users can view their own disease analyses" ON disease_analyses;
DROP POLICY IF EXISTS "Users can view their own consultations" ON consultations;

-- 2. Create more permissive policies for development/testing
-- Note: In production, you should implement proper authentication-based policies

-- Prakriti Analyses Policies
CREATE POLICY "Allow all operations on prakriti_analyses" ON prakriti_analyses
    FOR ALL USING (true) WITH CHECK (true);

-- Disease Analyses Policies  
CREATE POLICY "Allow all operations on disease_analyses" ON disease_analyses
    FOR ALL USING (true) WITH CHECK (true);

-- Consultations Policies
CREATE POLICY "Allow all operations on consultations" ON consultations
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Alternative: Disable RLS temporarily for development
-- Uncomment these lines if you want to disable RLS completely:
-- ALTER TABLE prakriti_analyses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE disease_analyses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- 4. Grant additional permissions
GRANT ALL ON prakriti_analyses TO anon;
GRANT ALL ON disease_analyses TO anon;
GRANT ALL ON consultations TO anon;

GRANT ALL ON prakriti_analyses TO authenticated;
GRANT ALL ON disease_analyses TO authenticated;
GRANT ALL ON consultations TO authenticated;

-- 5. Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('prakriti_analyses', 'disease_analyses', 'consultations');



