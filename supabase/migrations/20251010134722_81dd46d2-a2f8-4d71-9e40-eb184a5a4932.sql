-- Food Inventory Table (What's in your fridge/pantry)
CREATE TABLE IF NOT EXISTS food_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL DEFAULT 1,
  unit TEXT DEFAULT 'unit',
  purchase_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  estimated_cost DECIMAL DEFAULT 0,
  location TEXT DEFAULT 'fridge',
  barcode TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'fresh',
  consumed_date DATE,
  waste_reason TEXT,
  carbon_footprint DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Waste Log Table (Track what was wasted)
CREATE TABLE IF NOT EXISTS waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  estimated_cost DECIMAL NOT NULL,
  carbon_footprint DECIMAL NOT NULL,
  waste_reason TEXT NOT NULL,
  wasted_date DATE NOT NULL,
  could_have_saved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consumption Patterns Table (AI learns your eating habits)
CREATE TABLE IF NOT EXISTS consumption_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_category TEXT NOT NULL,
  avg_days_to_consume DECIMAL,
  typical_quantity DECIMAL,
  waste_percentage DECIMAL DEFAULT 0,
  purchase_frequency TEXT,
  preferred_brands JSONB DEFAULT '[]',
  seasonal_variation JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Carbon Savings Table (Track environmental impact)
CREATE TABLE IF NOT EXISTS carbon_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  food_saved_kg DECIMAL DEFAULT 0,
  carbon_saved_kg DECIMAL DEFAULT 0,
  money_saved DECIMAL DEFAULT 0,
  waste_prevented_count INTEGER DEFAULT 0,
  trees_equivalent DECIMAL DEFAULT 0,
  miles_driven_equivalent DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Rescue Recipes Table (AI generated recipes)
CREATE TABLE IF NOT EXISTS rescue_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  items_rescued INTEGER NOT NULL,
  money_saved DECIMAL NOT NULL,
  carbon_saved DECIMAL NOT NULL,
  cooked BOOLEAN DEFAULT false,
  cooked_date DATE,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS waste_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned_date DATE NOT NULL,
  milestone_value DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Family Waste Competition Table
CREATE TABLE IF NOT EXISTS family_waste_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  items_wasted INTEGER DEFAULT 0,
  money_wasted DECIMAL DEFAULT 0,
  waste_percentage DECIMAL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_inventory_user_id ON food_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_food_inventory_status ON food_inventory(status);
CREATE INDEX IF NOT EXISTS idx_food_inventory_expiration ON food_inventory(expiration_date);
CREATE INDEX IF NOT EXISTS idx_waste_log_user_id ON waste_log(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_log_date ON waste_log(wasted_date);
CREATE INDEX IF NOT EXISTS idx_carbon_savings_user_id ON carbon_savings(user_id);

-- RLS Policies
ALTER TABLE food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_waste_stats ENABLE ROW LEVEL SECURITY;

-- Food Inventory Policies
CREATE POLICY "Users can view own inventory" ON food_inventory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON food_inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON food_inventory
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON food_inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Waste Log Policies
CREATE POLICY "Users can view own waste log" ON waste_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste log" ON waste_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consumption Patterns Policies
CREATE POLICY "Users can view own patterns" ON consumption_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own patterns" ON consumption_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Carbon Savings Policies
CREATE POLICY "Users can view own carbon savings" ON carbon_savings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own carbon savings" ON carbon_savings
  FOR ALL USING (auth.uid() = user_id);

-- Rescue Recipes Policies
CREATE POLICY "Users can view own recipes" ON rescue_recipes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recipes" ON rescue_recipes
  FOR ALL USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view own achievements" ON waste_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON waste_achievements
  FOR ALL USING (auth.uid() = user_id);

-- Family Stats Policies
CREATE POLICY "Users can view family waste stats" ON family_waste_stats
  FOR SELECT USING (
    auth.uid() = user_id 
    OR family_group_id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can manage own stats" ON family_waste_stats
  FOR ALL USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_food_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_food_inventory_updated_at 
  BEFORE UPDATE ON food_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_food_inventory_timestamp();