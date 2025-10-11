-- Fix goals table check constraints to match onboarding form values
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_aggression_check;
ALTER TABLE goals ADD CONSTRAINT goals_aggression_check CHECK (aggression = ANY (ARRAY['Slow'::text, 'Moderate'::text, 'Aggressive'::text]));

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_type_check;
ALTER TABLE goals ADD CONSTRAINT goals_type_check CHECK (type = ANY (ARRAY['Lose Weight'::text, 'Gain Muscle'::text, 'Maintain Weight'::text, 'Improve Energy'::text, 'Fat Loss'::text, 'Muscle Gain'::text, 'Body Recomposition'::text, 'Maintain'::text]));