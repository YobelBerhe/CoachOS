-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cuisine TEXT,
  image_url TEXT,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  total_time_min INTEGER,
  difficulty TEXT,
  tags TEXT[] DEFAULT '{}',
  servings INTEGER NOT NULL DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories_per_serving INTEGER,
  protein_g_per_serving NUMERIC,
  carbs_g_per_serving NUMERIC,
  fats_g_per_serving NUMERIC,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create favorite_recipes table
CREATE TABLE public.favorite_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create grocery_lists table
CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_of DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_of)
);

-- Create streaks table
CREATE TABLE public.streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_updated DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policies for recipes (public read, admin write)
CREATE POLICY "Anyone can view public recipes"
ON public.recipes
FOR SELECT
USING (is_public = true);

-- Policies for favorite_recipes
CREATE POLICY "Users can manage own favorites"
ON public.favorite_recipes
FOR ALL
USING (user_id = auth.uid());

-- Policies for grocery_lists
CREATE POLICY "Users can manage own grocery lists"
ON public.grocery_lists
FOR ALL
USING (user_id = auth.uid());

-- Policies for streaks
CREATE POLICY "Users can view own streaks"
ON public.streaks
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own streaks"
ON public.streaks
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streaks"
ON public.streaks
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Triggers
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
BEFORE UPDATE ON public.grocery_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX idx_favorite_recipes_user_id ON public.favorite_recipes(user_id);
CREATE INDEX idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);