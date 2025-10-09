-- ============================================
-- USER INTERACTIONS TRACKING
-- ============================================

-- Enhanced recipe views with engagement time
ALTER TABLE recipe_views 
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scrolled_to_ingredients BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scrolled_to_instructions BOOLEAN DEFAULT FALSE;

-- Recipe interactions (likes, saves, shares)
CREATE TABLE IF NOT EXISTS recipe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Interaction types
  viewed BOOLEAN DEFAULT FALSE,
  favorited BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  logged_to_diary BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  view_duration_seconds INTEGER DEFAULT 0,
  
  -- Timestamps
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  favorited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_recipe_interaction UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_interactions_user ON recipe_interactions(user_id);
CREATE INDEX idx_interactions_recipe ON recipe_interactions(recipe_id);
CREATE INDEX idx_interactions_favorited ON recipe_interactions(favorited) WHERE favorited = TRUE;
CREATE INDEX idx_interactions_logged ON recipe_interactions(logged_to_diary) WHERE logged_to_diary = TRUE;

-- ============================================
-- USER PREFERENCES & TASTE PROFILE
-- ============================================

CREATE TABLE IF NOT EXISTS user_taste_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferred attributes (calculated from interactions)
  preferred_cuisines TEXT[] DEFAULT '{}',
  preferred_tags TEXT[] DEFAULT '{}',
  preferred_difficulty TEXT,
  
  -- Dietary preferences (from interactions)
  prefers_high_protein BOOLEAN DEFAULT FALSE,
  prefers_low_carb BOOLEAN DEFAULT FALSE,
  prefers_vegetarian BOOLEAN DEFAULT FALSE,
  prefers_quick_meals BOOLEAN DEFAULT FALSE,
  
  -- Engagement patterns
  avg_calories_preferred INTEGER,
  avg_prep_time_preferred INTEGER,
  preferred_meal_times TEXT[] DEFAULT '{}',
  
  -- Collaborative filtering vectors
  taste_vector JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_taste_profile UNIQUE(user_id)
);

CREATE INDEX idx_taste_profiles_user ON user_taste_profiles(user_id);

-- ============================================
-- RECIPE SIMILARITY & RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  similar_recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Similarity score (0-100)
  similarity_score DECIMAL(5,2) NOT NULL,
  
  -- Similarity reasons
  similar_by_cuisine BOOLEAN DEFAULT FALSE,
  similar_by_tags BOOLEAN DEFAULT FALSE,
  similar_by_ingredients BOOLEAN DEFAULT FALSE,
  similar_by_nutrition BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_recipe_similarity UNIQUE(recipe_id, similar_recipe_id),
  CONSTRAINT no_self_similarity CHECK (recipe_id != similar_recipe_id)
);

CREATE INDEX idx_similarities_recipe ON recipe_similarities(recipe_id, similarity_score DESC);
CREATE INDEX idx_similarities_similar ON recipe_similarities(similar_recipe_id);

-- ============================================
-- TRENDING SCORES (Pre-calculated)
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_trending_scores (
  recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Trending score (higher = more trending)
  trending_score DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Component scores
  view_score DECIMAL(10,2) DEFAULT 0,
  favorite_score DECIMAL(10,2) DEFAULT 0,
  unlock_score DECIMAL(10,2) DEFAULT 0,
  review_score DECIMAL(10,2) DEFAULT 0,
  recency_score DECIMAL(10,2) DEFAULT 0,
  
  -- Velocity (change rate)
  score_velocity DECIMAL(10,2) DEFAULT 0,
  
  -- Time windows (for decay)
  last_24h_views INTEGER DEFAULT 0,
  last_7d_views INTEGER DEFAULT 0,
  last_30d_views INTEGER DEFAULT 0,
  
  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trending_score ON recipe_trending_scores(trending_score DESC);
CREATE INDEX idx_trending_velocity ON recipe_trending_scores(score_velocity DESC);

-- ============================================
-- PERSONALIZED RECOMMENDATIONS CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS personalized_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recommendation list (ordered by score)
  recipe_ids UUID[] NOT NULL,
  
  -- Strategy used
  strategy TEXT NOT NULL,
  
  -- Metadata
  score_threshold DECIMAL(5,2),
  recipe_count INTEGER,
  
  -- Validity
  expires_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_strategy UNIQUE(user_id, strategy)
);

CREATE INDEX idx_recommendations_user ON personalized_recommendations(user_id);
CREATE INDEX idx_recommendations_expires ON personalized_recommendations(expires_at);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE recipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_trending_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON recipe_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interactions" ON recipe_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own taste profile" ON user_taste_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view recipe similarities" ON recipe_similarities
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view trending scores" ON recipe_trending_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can view own recommendations" ON personalized_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR RECOMMENDATION ENGINE
-- ============================================

-- Function: Update user taste profile
CREATE OR REPLACE FUNCTION update_user_taste_profile(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_cuisines TEXT[];
  v_tags TEXT[];
  v_avg_calories INTEGER;
  v_avg_prep_time INTEGER;
  v_meal_times TEXT[];
BEGIN
  -- Get most interacted cuisines
  SELECT ARRAY_AGG(DISTINCT cuisine ORDER BY interaction_count DESC)
  INTO v_cuisines
  FROM (
    SELECT UNNEST(r.cuisine_types) as cuisine, COUNT(*) as interaction_count
    FROM recipes r
    JOIN recipe_interactions ri ON r.id = ri.recipe_id
    WHERE ri.user_id = p_user_id 
      AND (ri.favorited = TRUE OR ri.logged_to_diary = TRUE)
    GROUP BY cuisine
    LIMIT 5
  ) t;

  -- Get most interacted tags
  SELECT ARRAY_AGG(DISTINCT tag ORDER BY interaction_count DESC)
  INTO v_tags
  FROM (
    SELECT UNNEST(r.tags) as tag, COUNT(*) as interaction_count
    FROM recipes r
    JOIN recipe_interactions ri ON r.id = ri.recipe_id
    WHERE ri.user_id = p_user_id 
      AND (ri.favorited = TRUE OR ri.logged_to_diary = TRUE)
    GROUP BY tag
    LIMIT 10
  ) t;

  -- Get average preferred calories
  SELECT AVG(r.calories_per_serving)::INTEGER
  INTO v_avg_calories
  FROM recipes r
  JOIN recipe_interactions ri ON r.id = ri.recipe_id
  WHERE ri.user_id = p_user_id 
    AND (ri.favorited = TRUE OR ri.logged_to_diary = TRUE);

  -- Get average preferred prep time
  SELECT AVG(r.prep_time_min + r.cook_time_min)::INTEGER
  INTO v_avg_prep_time
  FROM recipes r
  JOIN recipe_interactions ri ON r.id = ri.recipe_id
  WHERE ri.user_id = p_user_id 
    AND (ri.favorited = TRUE OR ri.logged_to_diary = TRUE);

  -- Get preferred meal times
  SELECT ARRAY_AGG(DISTINCT meal_type ORDER BY meal_count DESC)
  INTO v_meal_times
  FROM (
    SELECT UNNEST(r.meal_types) as meal_type, COUNT(*) as meal_count
    FROM recipes r
    JOIN recipe_interactions ri ON r.id = ri.recipe_id
    WHERE ri.user_id = p_user_id 
      AND (ri.favorited = TRUE OR ri.logged_to_diary = TRUE)
    GROUP BY meal_type
  ) t;

  -- Upsert taste profile
  INSERT INTO user_taste_profiles (
    user_id,
    preferred_cuisines,
    preferred_tags,
    avg_calories_preferred,
    avg_prep_time_preferred,
    preferred_meal_times,
    prefers_high_protein,
    prefers_low_carb,
    prefers_vegetarian,
    updated_at
  )
  VALUES (
    p_user_id,
    COALESCE(v_cuisines, '{}'),
    COALESCE(v_tags, '{}'),
    v_avg_calories,
    v_avg_prep_time,
    COALESCE(v_meal_times, '{}'),
    'High Protein' = ANY(COALESCE(v_tags, '{}')),
    'Low Carb' = ANY(COALESCE(v_tags, '{}')) OR 'Keto' = ANY(COALESCE(v_tags, '{}')),
    'Vegetarian' = ANY(COALESCE(v_tags, '{}')) OR 'Vegan' = ANY(COALESCE(v_tags, '{}')),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_cuisines = EXCLUDED.preferred_cuisines,
    preferred_tags = EXCLUDED.preferred_tags,
    avg_calories_preferred = EXCLUDED.avg_calories_preferred,
    avg_prep_time_preferred = EXCLUDED.avg_prep_time_preferred,
    preferred_meal_times = EXCLUDED.preferred_meal_times,
    prefers_high_protein = EXCLUDED.prefers_high_protein,
    prefers_low_carb = EXCLUDED.prefers_low_carb,
    prefers_vegetarian = EXCLUDED.prefers_vegetarian,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(p_recipe_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_age_hours DECIMAL;
  v_views_24h INTEGER;
  v_views_7d INTEGER;
  v_favorites INTEGER;
  v_unlocks INTEGER;
  v_reviews INTEGER;
  v_rating DECIMAL;
  v_score DECIMAL;
BEGIN
  -- Get recipe age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
  INTO v_age_hours
  FROM recipes
  WHERE id = p_recipe_id;

  -- Get metrics
  SELECT 
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours'),
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')
  INTO v_views_24h, v_views_7d
  FROM recipe_views
  WHERE recipe_id = p_recipe_id;

  SELECT 
    COUNT(*) FILTER (WHERE favorited = TRUE),
    COUNT(*) FILTER (WHERE logged_to_diary = TRUE)
  INTO v_favorites, v_unlocks
  FROM recipe_interactions
  WHERE recipe_id = p_recipe_id;

  SELECT total_reviews, average_rating
  INTO v_reviews, v_rating
  FROM recipes
  WHERE id = p_recipe_id;

  -- Calculate weighted score with time decay
  v_score := (
    (v_views_24h * 5) +
    (v_views_7d * 2) +
    (v_favorites * 10) +
    (v_unlocks * 20) +
    (v_reviews * 8) +
    (v_rating * 15)
  ) / POWER(v_age_hours + 2, 1.5);

  -- Update trending scores table
  INSERT INTO recipe_trending_scores (
    recipe_id, trending_score, last_24h_views, last_7d_views, calculated_at
  )
  VALUES (
    p_recipe_id, v_score, v_views_24h, v_views_7d, NOW()
  )
  ON CONFLICT (recipe_id) DO UPDATE SET
    trending_score = EXCLUDED.trending_score,
    last_24h_views = EXCLUDED.last_24h_views,
    last_7d_views = EXCLUDED.last_7d_views,
    calculated_at = NOW();

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Calculate recipe similarity
CREATE OR REPLACE FUNCTION calculate_recipe_similarity(
  p_recipe_id UUID,
  p_compare_recipe_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_r1 RECORD;
  v_r2 RECORD;
  v_cuisine_match INTEGER := 0;
  v_tag_match INTEGER := 0;
  v_nutrition_score DECIMAL := 0;
  v_total_score DECIMAL := 0;
BEGIN
  -- Get both recipes
  SELECT * INTO v_r1 FROM recipes WHERE id = p_recipe_id;
  SELECT * INTO v_r2 FROM recipes WHERE id = p_compare_recipe_id;

  -- Check cuisine overlap
  SELECT COUNT(*)
  INTO v_cuisine_match
  FROM UNNEST(v_r1.cuisine_types) c1
  JOIN UNNEST(v_r2.cuisine_types) c2 ON c1 = c2;

  -- Check tag overlap
  SELECT COUNT(*)
  INTO v_tag_match
  FROM UNNEST(v_r1.tags) t1
  JOIN UNNEST(v_r2.tags) t2 ON t1 = t2;

  -- Nutrition similarity (inverse of difference)
  v_nutrition_score := 100 - LEAST(100, 
    ABS(COALESCE(v_r1.calories_per_serving, 0) - COALESCE(v_r2.calories_per_serving, 0)) / 10.0 +
    ABS(COALESCE(v_r1.protein_g, 0) - COALESCE(v_r2.protein_g, 0)) * 2 +
    ABS(COALESCE(v_r1.carbs_g, 0) - COALESCE(v_r2.carbs_g, 0)) * 1.5
  );

  -- Weighted total
  v_total_score := (
    (v_cuisine_match * 25) +
    (v_tag_match * 15) +
    (v_nutrition_score * 0.6)
  );

  RETURN LEAST(100, v_total_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;