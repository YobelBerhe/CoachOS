-- Add hydration tracking columns to food_logs
ALTER TABLE food_logs 
ADD COLUMN IF NOT EXISTS is_beverage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hydration_ml INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS marked_done BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marked_done_at TIMESTAMPTZ;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_food_logs_marked_done ON food_logs(user_id, date, marked_done);

-- Add missing columns to goals table for compliance dashboard
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS daily_water_goal_ml INTEGER DEFAULT 2000;