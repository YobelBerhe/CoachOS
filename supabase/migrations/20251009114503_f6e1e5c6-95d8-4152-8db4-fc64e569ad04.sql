-- Fix search_path for functions created in previous migration

-- Update photo count function with proper search path
CREATE OR REPLACE FUNCTION update_review_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.photo_count := COALESCE(array_length(NEW.photos, 1), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Update is_deal_active function with proper search path
CREATE OR REPLACE FUNCTION is_deal_active(recipe recipes)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN recipe.is_on_deal 
    AND recipe.deal_start_date <= NOW() 
    AND recipe.deal_end_date >= NOW();
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Update expire_old_deals function with proper search path
CREATE OR REPLACE FUNCTION expire_old_deals()
RETURNS void AS $$
BEGIN
  UPDATE recipes
  SET is_on_deal = FALSE
  WHERE is_on_deal = TRUE
    AND deal_end_date < NOW();
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;