-- Add customer photos to reviews
ALTER TABLE recipe_reviews 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- Create index for photos
CREATE INDEX IF NOT EXISTS idx_reviews_with_photos 
ON recipe_reviews(recipe_id) 
WHERE photo_count > 0;

-- Function to update photo count
CREATE OR REPLACE FUNCTION update_review_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.photo_count := COALESCE(array_length(NEW.photos, 1), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update photo count
DROP TRIGGER IF EXISTS trigger_update_photo_count ON recipe_reviews;
CREATE TRIGGER trigger_update_photo_count
BEFORE INSERT OR UPDATE ON recipe_reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_photo_count();

-- Add deals/promotions to recipes
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_on_deal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deal_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deal_percentage INTEGER,
ADD COLUMN IF NOT EXISTS deal_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deal_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deal_description TEXT;

-- Create index for active deals
CREATE INDEX IF NOT EXISTS idx_recipes_active_deals 
ON recipes(is_on_deal, deal_end_date) 
WHERE is_on_deal = TRUE;

-- Function to check if deal is active
CREATE OR REPLACE FUNCTION is_deal_active(recipe recipes)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN recipe.is_on_deal 
    AND recipe.deal_start_date <= NOW() 
    AND recipe.deal_end_date >= NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire deals
CREATE OR REPLACE FUNCTION expire_old_deals()
RETURNS void AS $$
BEGIN
  UPDATE recipes
  SET is_on_deal = FALSE
  WHERE is_on_deal = TRUE
    AND deal_end_date < NOW();
END;
$$ LANGUAGE plpgsql;