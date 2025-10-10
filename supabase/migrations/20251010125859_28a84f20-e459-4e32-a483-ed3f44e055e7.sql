-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT,
  receipt_date TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL DEFAULT 0,
  tax DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  estimated_total DECIMAL,
  savings DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);

-- RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts" ON receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts" ON receipts
  FOR DELETE USING (auth.uid() = user_id);