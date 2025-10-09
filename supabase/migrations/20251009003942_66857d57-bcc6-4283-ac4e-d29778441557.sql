-- Create fasting_sessions table
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_duration_hours DECIMAL(4,1) NOT NULL,
  actual_duration_hours DECIMAL(4,1),
  completed BOOLEAN DEFAULT FALSE,
  broken_early BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fasting_sessions_check CHECK (target_duration_hours > 0 AND target_duration_hours <= 48)
);

-- Add indexes
CREATE INDEX idx_fasting_sessions_user ON fasting_sessions(user_id);
CREATE INDEX idx_fasting_sessions_start_time ON fasting_sessions(start_time);

-- Enable Row Level Security
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own fasting sessions" ON fasting_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasting sessions" ON fasting_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting sessions" ON fasting_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting sessions" ON fasting_sessions
  FOR DELETE USING (auth.uid() = user_id);