-- Add notification columns to user_settings if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'notifications_enabled') THEN
    ALTER TABLE user_settings ADD COLUMN notifications_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'shopping_reminders') THEN
    ALTER TABLE user_settings ADD COLUMN shopping_reminders BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'shopping_time') THEN
    ALTER TABLE user_settings ADD COLUMN shopping_time TEXT DEFAULT '09:00';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'workout_reminders') THEN
    ALTER TABLE user_settings ADD COLUMN workout_reminders BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'workout_time') THEN
    ALTER TABLE user_settings ADD COLUMN workout_time TEXT DEFAULT '18:00';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'meal_prep_reminders') THEN
    ALTER TABLE user_settings ADD COLUMN meal_prep_reminders BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'meal_prep_day') THEN
    ALTER TABLE user_settings ADD COLUMN meal_prep_day TEXT DEFAULT 'Sunday';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'water_reminders') THEN
    ALTER TABLE user_settings ADD COLUMN water_reminders BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'water_interval') THEN
    ALTER TABLE user_settings ADD COLUMN water_interval INTEGER DEFAULT 2;
  END IF;
END $$;

-- Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  trigger_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_trigger_at ON scheduled_notifications(trigger_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_sent ON scheduled_notifications(sent);

-- RLS for scheduled_notifications
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scheduled_notifications' 
    AND policyname = 'Users can view own scheduled notifications'
  ) THEN
    CREATE POLICY "Users can view own scheduled notifications" ON scheduled_notifications
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scheduled_notifications' 
    AND policyname = 'Users can insert own scheduled notifications'
  ) THEN
    CREATE POLICY "Users can insert own scheduled notifications" ON scheduled_notifications
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scheduled_notifications' 
    AND policyname = 'Users can delete own scheduled notifications'
  ) THEN
    CREATE POLICY "Users can delete own scheduled notifications" ON scheduled_notifications
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;