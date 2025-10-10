-- Create meal_swaps table
CREATE TABLE IF NOT EXISTS public.meal_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  cuisine_type TEXT,
  portions INTEGER NOT NULL DEFAULT 1,
  calories_per_portion INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fats INTEGER NOT NULL,
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  prep_date DATE NOT NULL,
  best_before DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  swap_type TEXT NOT NULL DEFAULT 'free',
  credits_value INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swap_profiles table
CREATE TABLE IF NOT EXISTS public.swap_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits INTEGER DEFAULT 10,
  meals_posted INTEGER DEFAULT 0,
  meals_received INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  bio TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swap_transactions table
CREATE TABLE IF NOT EXISTS public.swap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID REFERENCES public.meal_swaps(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  credits_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  pickup_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.meal_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_swaps
CREATE POLICY "Anyone can view available meals" ON public.meal_swaps
  FOR SELECT USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Users can create own meals" ON public.meal_swaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON public.meal_swaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON public.meal_swaps
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for swap_profiles
CREATE POLICY "Anyone can view profiles" ON public.swap_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON public.swap_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.swap_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for swap_transactions
CREATE POLICY "Users can view own transactions" ON public.swap_transactions
  FOR SELECT USING (auth.uid() = giver_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions" ON public.swap_transactions
  FOR INSERT WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Participants can update transactions" ON public.swap_transactions
  FOR UPDATE USING (auth.uid() = giver_id OR auth.uid() = receiver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_swaps_user ON public.meal_swaps(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_swaps_status ON public.meal_swaps(status);
CREATE INDEX IF NOT EXISTS idx_swap_profiles_user ON public.swap_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_swap ON public.swap_transactions(swap_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_giver ON public.swap_transactions(giver_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_receiver ON public.swap_transactions(receiver_id);

-- Create function to increment meals posted
CREATE OR REPLACE FUNCTION public.increment_meals_posted(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO swap_profiles (user_id, meals_posted)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    meals_posted = swap_profiles.meals_posted + 1,
    updated_at = NOW();
END;
$$;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_swap_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_meal_swaps_updated_at
BEFORE UPDATE ON public.meal_swaps
FOR EACH ROW
EXECUTE FUNCTION public.update_swap_updated_at();

CREATE TRIGGER update_swap_profiles_updated_at
BEFORE UPDATE ON public.swap_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_swap_updated_at();