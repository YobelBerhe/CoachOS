-- ========================================
-- COACHOS DATABASE EXTENSIONS
-- Missing Features Implementation
-- ========================================

-- ========================================
-- STEP 1: ADD WORKOUT PREFERENCES TO PROFILES
-- ========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS workout_preference TEXT,
ADD COLUMN IF NOT EXISTS workout_frequency INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS workout_location TEXT DEFAULT 'Gym',
ADD COLUMN IF NOT EXISTS workout_experience TEXT DEFAULT 'Beginner';

COMMENT ON COLUMN profiles.workout_preference IS 'User workout split preference: "Push/Pull/Legs", "Upper/Lower", "Full Body", "Bro Split"';
COMMENT ON COLUMN profiles.workout_frequency IS 'Number of workout days per week (3-6)';
COMMENT ON COLUMN profiles.workout_location IS 'Preferred workout location: "Home" or "Gym"';
COMMENT ON COLUMN profiles.workout_experience IS 'Experience level: "Beginner", "Intermediate", "Advanced"';


-- ========================================
-- STEP 2: CREATE USER ALLERGIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  allergen_name TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
  reaction_symptoms TEXT,
  diagnosed_by TEXT,
  diagnosed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, allergen_name)
);

CREATE INDEX IF NOT EXISTS idx_user_allergies_user ON user_allergies(user_id);

ALTER TABLE user_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allergies" ON user_allergies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies" ON user_allergies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies" ON user_allergies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies" ON user_allergies
  FOR DELETE USING (auth.uid() = user_id);


-- ========================================
-- STEP 3: CREATE BIOMARKERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  biomarker_name TEXT NOT NULL,
  biomarker_value DECIMAL(10,2),
  unit TEXT,
  normal_range_min DECIMAL(10,2),
  normal_range_max DECIMAL(10,2),
  is_normal BOOLEAN,
  test_date DATE DEFAULT CURRENT_DATE,
  lab_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_biomarkers_user ON user_biomarkers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_biomarkers_test_date ON user_biomarkers(user_id, test_date DESC);

ALTER TABLE user_biomarkers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own biomarkers" ON user_biomarkers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biomarkers" ON user_biomarkers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biomarkers" ON user_biomarkers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own biomarkers" ON user_biomarkers
  FOR DELETE USING (auth.uid() = user_id);


-- ========================================
-- STEP 4: ADD ALLERGEN FIELDS TO FOOD_LOGS
-- ========================================
ALTER TABLE food_logs
ADD COLUMN IF NOT EXISTS contains_allergens TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allergen_warning_shown BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN food_logs.contains_allergens IS 'Array of allergens detected in this food item';
COMMENT ON COLUMN food_logs.allergen_warning_shown IS 'Whether user was warned about allergens before logging';


-- ========================================
-- STEP 5: CREATE COMMON ALLERGENS REFERENCE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.common_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  common_in TEXT[],
  alternative_names TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO common_allergens (name, category, common_in, alternative_names) VALUES
  ('Peanuts', 'Nuts', ARRAY['peanut butter', 'thai food', 'african dishes', 'satay sauce'], ARRAY['groundnuts']),
  ('Tree Nuts', 'Nuts', ARRAY['almonds', 'walnuts', 'cashews', 'pistachios', 'hazelnuts'], ARRAY['almonds', 'walnuts', 'cashews', 'pecans']),
  ('Milk', 'Dairy', ARRAY['cheese', 'yogurt', 'butter', 'cream', 'ice cream'], ARRAY['dairy', 'lactose', 'casein', 'whey']),
  ('Eggs', 'Animal Products', ARRAY['mayonnaise', 'baked goods', 'pasta', 'meringue'], ARRAY['egg whites', 'egg yolks', 'albumin']),
  ('Wheat', 'Grains', ARRAY['bread', 'pasta', 'cereal', 'baked goods', 'flour'], ARRAY['gluten', 'flour', 'semolina']),
  ('Soy', 'Legumes', ARRAY['tofu', 'soy sauce', 'edamame', 'miso', 'tempeh'], ARRAY['soya', 'soybean']),
  ('Fish', 'Seafood', ARRAY['salmon', 'tuna', 'cod', 'fish sauce', 'anchovies'], ARRAY['seafood']),
  ('Shellfish', 'Seafood', ARRAY['shrimp', 'crab', 'lobster', 'oysters', 'clams'], ARRAY['crustaceans', 'mollusks']),
  ('Sesame', 'Seeds', ARRAY['tahini', 'sesame oil', 'hummus', 'halva'], ARRAY['sesame seeds']),
  ('Gluten', 'Grains', ARRAY['wheat', 'barley', 'rye', 'bread', 'pasta'], ARRAY['wheat', 'barley', 'rye']),
  ('Lactose', 'Dairy', ARRAY['milk', 'ice cream', 'soft cheese'], ARRAY['milk sugar']),
  ('Sulfites', 'Additives', ARRAY['wine', 'dried fruits', 'pickled foods'], ARRAY['sulphites', 'sulfur dioxide']),
  ('Mustard', 'Seeds', ARRAY['mustard sauce', 'salad dressings', 'pickles'], ARRAY['mustard seed']),
  ('Celery', 'Vegetables', ARRAY['celery salt', 'soups', 'stews'], ARRAY['celeriac']),
  ('Lupin', 'Legumes', ARRAY['flour', 'baked goods', 'pasta'], ARRAY['lupine'])
ON CONFLICT (name) DO NOTHING;

ALTER TABLE common_allergens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view common allergens" ON common_allergens
  FOR SELECT USING (true);


-- ========================================
-- STEP 6: CREATE ALLERGEN DETECTION FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION check_food_allergens(
  p_user_id UUID,
  p_food_name TEXT
) RETURNS TEXT[] 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_allergens TEXT[];
  v_allergen TEXT;
  v_detected_allergens TEXT[] := '{}';
  v_common_allergen RECORD;
  v_alternative TEXT;
BEGIN
  SELECT ARRAY_AGG(LOWER(allergen_name))
  INTO v_user_allergens
  FROM user_allergies
  WHERE user_id = p_user_id;
  
  IF v_user_allergens IS NULL OR array_length(v_user_allergens, 1) IS NULL THEN
    RETURN v_detected_allergens;
  END IF;
  
  FOREACH v_allergen IN ARRAY v_user_allergens
  LOOP
    IF LOWER(p_food_name) LIKE '%' || v_allergen || '%' THEN
      v_detected_allergens := array_append(v_detected_allergens, v_allergen);
      CONTINUE;
    END IF;
    
    FOR v_common_allergen IN 
      SELECT alternative_names 
      FROM common_allergens 
      WHERE LOWER(name) = v_allergen AND alternative_names IS NOT NULL
    LOOP
      IF v_common_allergen.alternative_names IS NOT NULL THEN
        FOREACH v_alternative IN ARRAY v_common_allergen.alternative_names
        LOOP
          IF LOWER(p_food_name) LIKE '%' || LOWER(v_alternative) || '%' THEN
            v_detected_allergens := array_append(v_detected_allergens, v_allergen);
            EXIT;
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN v_detected_allergens;
END;
$$;


-- ========================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION get_low_biomarkers(p_user_id UUID)
RETURNS TABLE (
  biomarker_name TEXT,
  current_value DECIMAL,
  normal_min DECIMAL,
  deficit DECIMAL
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.biomarker_name,
    b.biomarker_value,
    b.normal_range_min,
    (b.normal_range_min - b.biomarker_value) as deficit
  FROM user_biomarkers b
  WHERE b.user_id = p_user_id
    AND b.biomarker_value < b.normal_range_min
    AND b.test_date >= CURRENT_DATE - INTERVAL '6 months'
  ORDER BY (b.normal_range_min - b.biomarker_value) DESC;
END;
$$;


-- ========================================
-- STEP 8: CREATE TRIGGERS FOR AUTO-UPDATES
-- ========================================
CREATE OR REPLACE FUNCTION update_user_allergies_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_user_allergies_timestamp ON user_allergies;
CREATE TRIGGER trigger_update_user_allergies_timestamp
BEFORE UPDATE ON user_allergies
FOR EACH ROW
EXECUTE FUNCTION update_user_allergies_timestamp();

CREATE OR REPLACE FUNCTION update_user_biomarkers_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_user_biomarkers_timestamp ON user_biomarkers;
CREATE TRIGGER trigger_update_user_biomarkers_timestamp
BEFORE UPDATE ON user_biomarkers
FOR EACH ROW
EXECUTE FUNCTION update_user_biomarkers_timestamp();


-- ========================================
-- STEP 9: CREATE INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_food_logs_allergens ON food_logs USING GIN (contains_allergens);
CREATE INDEX IF NOT EXISTS idx_profiles_workout_pref ON profiles(workout_preference, workout_location);