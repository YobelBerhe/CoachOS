-- Drop trigger first, then recreate function with proper search_path
DROP TRIGGER IF EXISTS update_shopping_lists_updated_at_trigger ON shopping_lists;
DROP FUNCTION IF EXISTS update_shopping_lists_updated_at();

CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_shopping_lists_updated_at_trigger
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();