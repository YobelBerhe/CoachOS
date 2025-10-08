-- CoachOS Database Schema
-- Health accountability platform with unified tracking

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
  height_cm DECIMAL(5,2) NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete')),
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Fat Loss', 'Muscle Gain', 'Body Recomposition', 'Maintain')),
  current_weight_kg DECIMAL(5,2) NOT NULL,
  target_weight_kg DECIMAL(5,2) NOT NULL,
  aggression TEXT CHECK (aggression IN ('Moderate', 'Aggressive')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (user_id = auth.uid());

-- Daily Targets (calculated macros)
CREATE TABLE IF NOT EXISTS public.daily_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bmr INTEGER NOT NULL,
  tdee INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  fats_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own targets" ON public.daily_targets
  FOR ALL USING (user_id = auth.uid());

-- Food Logs
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g DECIMAL(5,1) NOT NULL DEFAULT 0,
  fats_g DECIMAL(5,1) NOT NULL DEFAULT 0,
  carbs_g DECIMAL(5,1) NOT NULL DEFAULT 0,
  serving_size TEXT,
  meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own food logs" ON public.food_logs
  FOR ALL USING (user_id = auth.uid());

-- Exercises Library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL CHECK (equipment IN ('Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Bands', 'Cables')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  instructions TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

-- Workout Sessions
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TIME,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workouts" ON public.workout_sessions
  FOR ALL USING (user_id = auth.uid());

-- Exercise Logs (sets within workout)
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets JSONB NOT NULL, -- [{ reps: 10, weightLbs: 135 }, ...]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercise logs via workout" ON public.exercise_logs
  FOR ALL USING (
    workout_session_id IN (
      SELECT id FROM public.workout_sessions WHERE user_id = auth.uid()
    )
  );

-- Fasting Plans
CREATE TABLE IF NOT EXISTS public.fasting_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('16:8', '18:6', '20:4', 'OMAD', 'Custom')),
  eating_window_start TIME NOT NULL,
  eating_window_end TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fasting_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fasting plan" ON public.fasting_plans
  FOR ALL USING (user_id = auth.uid());

-- Sleep Logs
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration_min INTEGER NOT NULL,
  quality INTEGER CHECK (quality BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs
  FOR ALL USING (user_id = auth.uid());

-- Weight Logs
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight logs" ON public.weight_logs
  FOR ALL USING (user_id = auth.uid());

-- Compliance Scores (daily accountability)
CREATE TABLE IF NOT EXISTS public.compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  nutrition_score INTEGER NOT NULL CHECK (nutrition_score BETWEEN 0 AND 100),
  workout_score INTEGER NOT NULL CHECK (workout_score BETWEEN 0 AND 100),
  fasting_score INTEGER NOT NULL CHECK (fasting_score BETWEEN 0 AND 100),
  sleep_score INTEGER NOT NULL CHECK (sleep_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compliance" ON public.compliance_scores
  FOR ALL USING (user_id = auth.uid());

-- Seed some exercises
INSERT INTO public.exercises (name, muscle_group, equipment, difficulty, instructions) VALUES
  ('Push-ups', 'Chest', 'Bodyweight', 'Beginner', 'Start in plank position, lower chest to ground, push back up'),
  ('Squats', 'Legs', 'Bodyweight', 'Beginner', 'Feet shoulder-width apart, lower hips back and down, return to standing'),
  ('Pull-ups', 'Back', 'Bodyweight', 'Intermediate', 'Hang from bar, pull body up until chin over bar'),
  ('Bench Press', 'Chest', 'Barbell', 'Intermediate', 'Lie on bench, lower barbell to chest, press back up'),
  ('Deadlift', 'Back', 'Barbell', 'Advanced', 'Bend at hips, grip bar, lift by extending hips and knees'),
  ('Dumbbell Rows', 'Back', 'Dumbbells', 'Beginner', 'Bend over, pull dumbbell to ribcage, lower with control'),
  ('Shoulder Press', 'Shoulders', 'Dumbbells', 'Beginner', 'Press dumbbells overhead from shoulder height'),
  ('Lunges', 'Legs', 'Bodyweight', 'Beginner', 'Step forward, lower hips until both knees at 90 degrees'),
  ('Bicep Curls', 'Arms', 'Dumbbells', 'Beginner', 'Curl dumbbells from thigh to shoulder, squeeze biceps'),
  ('Tricep Dips', 'Arms', 'Bodyweight', 'Intermediate', 'Support body on bars, lower by bending elbows, push back up')
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fasting_plans_updated_at BEFORE UPDATE ON public.fasting_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();