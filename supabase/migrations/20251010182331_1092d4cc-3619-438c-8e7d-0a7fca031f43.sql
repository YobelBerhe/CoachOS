-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scanned_menus table
CREATE TABLE IF NOT EXISTS public.scanned_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  restaurant_name TEXT,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  ocr_text TEXT,
  analyzed_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_scan_history table
CREATE TABLE IF NOT EXISTS public.menu_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_name TEXT NOT NULL,
  item_ordered TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fats INTEGER,
  health_score INTEGER,
  approved BOOLEAN,
  modifications_made TEXT,
  date_ordered DATE NOT NULL,
  meal_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
  FOR SELECT USING (true);

-- RLS Policies for scanned_menus
CREATE POLICY "Users can view own scanned menus" ON public.scanned_menus
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanned menus" ON public.scanned_menus
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scanned menus" ON public.scanned_menus
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scanned menus" ON public.scanned_menus
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for menu_scan_history
CREATE POLICY "Users can view own menu history" ON public.menu_scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menu history" ON public.menu_scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menu history" ON public.menu_scan_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menu history" ON public.menu_scan_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scanned_menus_user ON public.scanned_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_scan_history_user ON public.menu_scan_history(user_id);

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu images
CREATE POLICY "Anyone can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Users can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own menu images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own menu images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);