-- ============================================
-- RECIPE REVIEWS & RATINGS
-- ============================================

CREATE TABLE recipe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  -- Customer Photos
  photos TEXT[] DEFAULT '{}',
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Verification
  verified_purchase BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one review per user per recipe
  CONSTRAINT unique_recipe_review UNIQUE(recipe_id, user_id)
);

CREATE INDEX idx_recipe_reviews_recipe ON recipe_reviews(recipe_id);
CREATE INDEX idx_recipe_reviews_user ON recipe_reviews(user_id);
CREATE INDEX idx_recipe_reviews_rating ON recipe_reviews(rating DESC);

-- Enable RLS
ALTER TABLE recipe_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reviews"
ON recipe_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON recipe_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON recipe_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON recipe_reviews FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- RECIPE UNLOCKS (for paid recipes)
-- ============================================

CREATE TABLE recipe_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Payment Info
  amount_paid DECIMAL(8,2) NOT NULL,
  platform_fee DECIMAL(8,2) NOT NULL,
  creator_payout DECIMAL(8,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_recipe_unlock UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_recipe_unlocks_user ON recipe_unlocks(user_id);
CREATE INDEX idx_recipe_unlocks_recipe ON recipe_unlocks(recipe_id);

-- Enable RLS
ALTER TABLE recipe_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own unlocks"
ON recipe_unlocks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own unlocks"
ON recipe_unlocks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RECIPE VIEWS (for analytics)
-- ============================================

CREATE TABLE recipe_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_views_recipe ON recipe_views(recipe_id);
CREATE INDEX idx_recipe_views_created ON recipe_views(created_at DESC);

-- Enable RLS
ALTER TABLE recipe_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow anyone to insert views, but only admins to read
CREATE POLICY "Anyone can track views"
ON recipe_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own view history"
ON recipe_views FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment recipe log count
CREATE OR REPLACE FUNCTION increment_recipe_logs(recipe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE recipes
  SET total_logs = COALESCE(total_logs, 0) + 1
  WHERE id = recipe_id;
END;
$$;