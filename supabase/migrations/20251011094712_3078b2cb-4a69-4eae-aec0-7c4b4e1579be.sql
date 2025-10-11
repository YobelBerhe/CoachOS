-- Create daily summary view for evening reflection
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
  j.user_id,
  j.entry_date,
  j.mood_rating as morning_mood,
  j.energy_level as morning_energy,
  
  -- Evening data from journal
  (SELECT mood_rating FROM journal_entries 
   WHERE user_id = j.user_id 
   AND entry_date = j.entry_date 
   AND entry_type = 'evening' 
   LIMIT 1) as evening_mood,
  
  (SELECT energy_level FROM journal_entries 
   WHERE user_id = j.user_id 
   AND entry_date = j.entry_date 
   AND entry_type = 'evening' 
   LIMIT 1) as evening_energy,
  
  -- Sleep from previous night (duration in hours)
  (SELECT (duration_min::numeric / 60) FROM sleep_logs 
   WHERE user_id = j.user_id 
   AND date = j.entry_date 
   LIMIT 1) as sleep_hours,
  
  -- Nutrition data
  (SELECT COALESCE(SUM(calories), 0)::integer FROM food_logs
   WHERE user_id = j.user_id
   AND date = j.entry_date) as calories_consumed,
  
  (SELECT COALESCE(SUM(hydration_ml), 0)::integer FROM food_logs
   WHERE user_id = j.user_id
   AND date = j.entry_date
   AND is_beverage = true) as water_intake_ml,
  
  j.created_at
FROM journal_entries j
WHERE j.entry_type = 'morning';

-- Enable RLS on the view
ALTER VIEW daily_summary SET (security_invoker = true);