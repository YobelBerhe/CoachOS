-- Add profile_completed column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Create user_conditions table
CREATE TABLE IF NOT EXISTS user_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, condition_type)
);

-- Create user_lifestyle table
CREATE TABLE IF NOT EXISTS user_lifestyle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours TEXT,
  stress_level TEXT,
  water_intake INTEGER DEFAULT 8,
  smokes BOOLEAN DEFAULT false,
  alcohol BOOLEAN DEFAULT false,
  caffeine_intake TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_fasting table
CREATE TABLE IF NOT EXISTS user_fasting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fasting_enabled BOOLEAN DEFAULT false,
  fasting_method TEXT,
  eating_window_start TIME,
  eating_window_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_meds table (medications & supplements)
CREATE TABLE IF NOT EXISTS user_meds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('medication', 'supplement')),
  name TEXT NOT NULL,
  dosage TEXT,
  time TEXT,
  purpose TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_areas TEXT[] DEFAULT '{}',
  notifications_enabled BOOLEAN DEFAULT true,
  daily_summary_email BOOLEAN DEFAULT true,
  ai_suggestions BOOLEAN DEFAULT true,
  health_data_tracking BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fasting ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_conditions
CREATE POLICY "Users can view own conditions" ON user_conditions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conditions" ON user_conditions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conditions" ON user_conditions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conditions" ON user_conditions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for user_lifestyle
CREATE POLICY "Users can view own lifestyle" ON user_lifestyle
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lifestyle" ON user_lifestyle
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lifestyle" ON user_lifestyle
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS Policies for user_fasting
CREATE POLICY "Users can view own fasting" ON user_fasting
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fasting" ON user_fasting
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fasting" ON user_fasting
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS Policies for user_meds
CREATE POLICY "Users can view own meds" ON user_meds
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meds" ON user_meds
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meds" ON user_meds
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meds" ON user_meds
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_conditions_user_id ON user_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lifestyle_user_id ON user_lifestyle(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fasting_user_id ON user_fasting(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meds_user_id ON user_meds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);