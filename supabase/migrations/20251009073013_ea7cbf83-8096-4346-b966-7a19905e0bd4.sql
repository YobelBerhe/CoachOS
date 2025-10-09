-- Add missing columns to recipes table for enhanced functionality
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS meal_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cuisine_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Rename nutrition columns to match code expectations
ALTER TABLE recipes
RENAME COLUMN protein_g_per_serving TO protein_g;

ALTER TABLE recipes
RENAME COLUMN carbs_g_per_serving TO carbs_g;

ALTER TABLE recipes
RENAME COLUMN fats_g_per_serving TO fats_g;

-- Create index for user recipes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view public recipes" ON recipes;

CREATE POLICY "Anyone can view published recipes"
ON recipes FOR SELECT
USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can insert own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
ON recipes FOR DELETE
USING (auth.uid() = user_id);