-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Entry details
  entry_date DATE NOT NULL,
  entry_type TEXT CHECK (entry_type IN ('morning', 'evening', 'general')) DEFAULT 'morning',
  
  -- Morning journal fields
  gratitude_1 TEXT,
  gratitude_2 TEXT,
  gratitude_3 TEXT,
  daily_intention TEXT,
  what_would_make_today_great TEXT,
  daily_affirmation TEXT,
  franklin_morning TEXT,
  
  -- Evening journal fields
  franklin_evening TEXT,
  wins_today TEXT[],
  lessons_learned TEXT,
  tomorrow_focus TEXT,
  
  -- General fields
  free_form_entry TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Tags and categories
  tags TEXT[],
  
  -- Voice entry
  voice_transcription TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, entry_date, entry_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_type ON journal_entries(user_id, entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at DESC);

-- RLS Policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_journal_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entries_updated_at();

-- View for journal statistics
CREATE OR REPLACE VIEW journal_stats AS
SELECT 
  user_id,
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE entry_type = 'morning') as morning_entries,
  COUNT(*) FILTER (WHERE entry_type = 'evening') as evening_entries,
  MAX(entry_date) as last_entry_date,
  AVG(mood_rating) FILTER (WHERE mood_rating IS NOT NULL) as avg_mood,
  AVG(energy_level) FILTER (WHERE energy_level IS NOT NULL) as avg_energy
FROM journal_entries
GROUP BY user_id;

-- Gratitude tracking table
CREATE TABLE IF NOT EXISTS gratitude_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gratitude_text TEXT NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gratitude_user ON gratitude_items(user_id, entry_date DESC);

ALTER TABLE gratitude_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gratitude items" ON gratitude_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude items" ON gratitude_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);