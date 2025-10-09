-- Fix search_path security warning
DROP FUNCTION IF EXISTS increment_recipe_logs(UUID);

CREATE OR REPLACE FUNCTION increment_recipe_logs(recipe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE recipes
  SET total_logs = COALESCE(total_logs, 0) + 1
  WHERE id = recipe_id;
END;
$$;