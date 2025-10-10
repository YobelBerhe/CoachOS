-- Create scanned_products table for scan history
CREATE TABLE IF NOT EXISTS scanned_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  product_name TEXT,
  brand TEXT,
  nutrition_data JSONB,
  health_score INTEGER,
  approved BOOLEAN,
  added_to_diary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_id ON scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_barcode ON scanned_products(barcode);
CREATE INDEX IF NOT EXISTS idx_scanned_products_created_at ON scanned_products(created_at DESC);

-- Enable RLS
ALTER TABLE scanned_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own scanned products" ON scanned_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanned products" ON scanned_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scanned products" ON scanned_products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scanned products" ON scanned_products
  FOR DELETE USING (auth.uid() = user_id);