-- Food Database Schema for Ayurvedic Foods
-- This table stores comprehensive information about Indian foods with Ayurvedic properties

CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    serving_size VARCHAR(100) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g DECIMAL(5,2) NOT NULL,
    carbs_g DECIMAL(5,2) NOT NULL,
    fat_g DECIMAL(5,2) NOT NULL,
    fiber_g DECIMAL(5,2) NOT NULL,
    
    -- Ayurvedic Properties
    rasa TEXT[], -- Array of tastes (Sweet, Sour, Salty, Pungent, Bitter, Astringent)
    guna TEXT[], -- Array of qualities (Heavy, Light, Hot, Cold, Oily, Dry, etc.)
    virya VARCHAR(50), -- Potency (Heating, Cooling, Neutral)
    
    -- Dosha Effects
    vata_effect VARCHAR(20) NOT NULL, -- pacifies, aggravates, neutral
    pitta_effect VARCHAR(20) NOT NULL, -- pacifies, aggravates, neutral
    kapha_effect VARCHAR(20) NOT NULL, -- pacifies, aggravates, neutral
    
    -- Meal Categories
    meal_types TEXT[] NOT NULL, -- Array of meal types (Breakfast, Brunch, Lunch, Snacks, Dinner)
    food_category VARCHAR(100) NOT NULL, -- Main Course, Side Dish, Beverage, etc.
    
    -- Tags and Dietary Information
    tags TEXT[], -- Array of tags (Vegan, Vegetarian, Gluten-Free, Tridoshic, etc.)
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES unified_users(id),
    
    -- Indexes for better performance
    CONSTRAINT valid_vata_effect CHECK (vata_effect IN ('pacifies', 'aggravates', 'neutral')),
    CONSTRAINT valid_pitta_effect CHECK (pitta_effect IN ('pacifies', 'aggravates', 'neutral')),
    CONSTRAINT valid_kapha_effect CHECK (kapha_effect IN ('pacifies', 'aggravates', 'neutral')),
    CONSTRAINT valid_virya CHECK (virya IN ('Heating', 'Cooling', 'Neutral'))
);

-- Create indexes for better query performance
CREATE INDEX idx_food_items_meal_types ON food_items USING GIN (meal_types);
CREATE INDEX idx_food_items_tags ON food_items USING GIN (tags);
CREATE INDEX idx_food_items_rasa ON food_items USING GIN (rasa);
CREATE INDEX idx_food_items_guna ON food_items USING GIN (guna);
CREATE INDEX idx_food_items_dosha_effects ON food_items (vata_effect, pitta_effect, kapha_effect);
CREATE INDEX idx_food_items_food_category ON food_items (food_category);
CREATE INDEX idx_food_items_name ON food_items (name);

-- Enable Row Level Security
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all authenticated users to read food items" ON food_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow doctors to insert food items" ON food_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM unified_users 
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Allow doctors to update food items" ON food_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM unified_users 
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Allow doctors to delete food items" ON food_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM unified_users 
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_food_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_food_items_updated_at
    BEFORE UPDATE ON food_items
    FOR EACH ROW
    EXECUTE FUNCTION update_food_items_updated_at();

