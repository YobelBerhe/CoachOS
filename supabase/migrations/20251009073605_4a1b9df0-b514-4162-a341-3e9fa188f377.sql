-- Add nutrition and goal categorization columns to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS fiber_g DECIMAL(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sugar_g DECIMAL(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sodium_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nutrition_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS good_for_weight_loss BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS good_for_muscle_gain BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS good_for_heart_health BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS good_for_energy BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS good_for_late_night BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS good_for_fasting BOOLEAN DEFAULT FALSE;

-- Create indexes for goal-based filtering (partial indexes for better performance)
CREATE INDEX IF NOT EXISTS idx_recipes_weight_loss ON recipes(good_for_weight_loss) WHERE good_for_weight_loss = true;
CREATE INDEX IF NOT EXISTS idx_recipes_muscle_gain ON recipes(good_for_muscle_gain) WHERE good_for_muscle_gain = true;
CREATE INDEX IF NOT EXISTS idx_recipes_heart_health ON recipes(good_for_heart_health) WHERE good_for_heart_health = true;
CREATE INDEX IF NOT EXISTS idx_recipes_fasting ON recipes(good_for_fasting) WHERE good_for_fasting = true;