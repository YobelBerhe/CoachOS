-- Add duration and volume tracking to workout sessions
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS duration_min INTEGER,
ADD COLUMN IF NOT EXISTS total_volume_lbs INTEGER DEFAULT 0;