-- Fix security warning: Function Search Path Mutable
DROP TRIGGER IF EXISTS update_food_inventory_updated_at ON food_inventory;
DROP FUNCTION IF EXISTS update_food_inventory_timestamp();

CREATE OR REPLACE FUNCTION update_food_inventory_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_food_inventory_updated_at 
  BEFORE UPDATE ON food_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_food_inventory_timestamp();