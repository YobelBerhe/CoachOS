-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  goal_type TEXT,
  total_estimated_cost DECIMAL DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_active ON shopping_lists(is_active);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_shopping_lists_updated_at_trigger
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();