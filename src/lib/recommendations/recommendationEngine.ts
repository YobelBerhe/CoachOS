import { supabase } from '@/integrations/supabase/client';

export interface Recipe {
  id: string;
  name: string;
  images: string[];
  thumbnail_index: number;
  average_rating: number;
  total_reviews: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  meal_types: string[];
  cuisine_types: string[];
  tags: string[];
  is_paid: boolean;
  price?: number;
  servings: number;
  category: string;
  description?: string;
  difficulty?: string;
  prep_time_min?: number;
  cook_time_min?: number;
}

/**
 * STRATEGY 1: Collaborative Filtering
 * "Users who liked this also liked..."
 */
export async function getCollaborativeRecommendations(
  userId: string,
  limit: number = 10
): Promise<Recipe[]> {
  try {
    const { data: userFavorites } = await supabase
      .from('recipe_interactions')
      .select('recipe_id')
      .eq('user_id', userId)
      .eq('favorited', true);

    if (!userFavorites || userFavorites.length === 0) {
      return [];
    }

    const favoriteIds = userFavorites.map(f => f.recipe_id);

    const { data: similarUsers } = await supabase
      .from('recipe_interactions')
      .select('user_id, recipe_id')
      .in('recipe_id', favoriteIds)
      .eq('favorited', true)
      .neq('user_id', userId);

    if (!similarUsers || similarUsers.length === 0) {
      return [];
    }

    const recipeCounts = new Map<string, number>();
    similarUsers.forEach(interaction => {
      if (!favoriteIds.includes(interaction.recipe_id)) {
        recipeCounts.set(
          interaction.recipe_id,
          (recipeCounts.get(interaction.recipe_id) || 0) + 1
        );
      }
    });

    const topRecipeIds = Array.from(recipeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topRecipeIds.length === 0) {
      return [];
    }

    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
      .in('id', topRecipeIds)
      .eq('status', 'published');

    return recipes || [];
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return [];
  }
}

/**
 * STRATEGY 2: Content-Based Filtering
 * Based on user's taste profile
 */
export async function getContentBasedRecommendations(
  userId: string,
  limit: number = 10
): Promise<Recipe[]> {
  try {
    const { data: profile } = await supabase
      .from('user_taste_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return [];
    }

    const { data: interactions } = await supabase
      .from('recipe_interactions')
      .select('recipe_id')
      .eq('user_id', userId);

    const excludeIds = interactions?.map(i => i.recipe_id) || [];

    let query = supabase
      .from('recipes')
      .select('*')
      .eq('status', 'published')
      .limit(limit * 2);

    if (profile.preferred_cuisines && profile.preferred_cuisines.length > 0) {
      query = query.overlaps('cuisine_types', profile.preferred_cuisines);
    }

    if (profile.preferred_tags && profile.preferred_tags.length > 0) {
      query = query.overlaps('tags', profile.preferred_tags);
    }

    if (profile.avg_calories_preferred) {
      query = query
        .gte('calories_per_serving', profile.avg_calories_preferred - 200)
        .lte('calories_per_serving', profile.avg_calories_preferred + 200);
    }

    const { data: recipes } = await query;

    if (!recipes) {
      return [];
    }

    const filtered = recipes.filter(r => !excludeIds.includes(r.id));

    const scored = filtered.map(recipe => {
      let score = 0;

      const cuisineMatches = recipe.cuisine_types?.filter(c =>
        profile.preferred_cuisines?.includes(c)
      ).length || 0;
      score += cuisineMatches * 10;

      const tagMatches = recipe.tags?.filter(t =>
        profile.preferred_tags?.includes(t)
      ).length || 0;
      score += tagMatches * 5;

      if (profile.avg_calories_preferred && recipe.calories_per_serving) {
        const calorieDiff = Math.abs(
          recipe.calories_per_serving - profile.avg_calories_preferred
        );
        score += Math.max(0, 20 - calorieDiff / 10);
      }

      score += (recipe.average_rating || 0) * 3;

      return { recipe, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.recipe);
  } catch (error) {
    console.error('Content-based filtering error:', error);
    return [];
  }
}

/**
 * STRATEGY 3: Trending Recipes
 */
export async function getTrendingRecommendations(
  limit: number = 10
): Promise<Recipe[]> {
  try {
    const { data: trending } = await supabase
      .from('recipe_trending_scores')
      .select(`
        recipe_id,
        trending_score,
        recipes (*)
      `)
      .order('trending_score', { ascending: false })
      .limit(limit);

    if (!trending) {
      return [];
    }

    return trending
      .map(t => t.recipes as any)
      .filter(r => r && r.status === 'published');
  } catch (error) {
    console.error('Trending recommendations error:', error);
    return [];
  }
}

/**
 * STRATEGY 4: Goal-Based Recommendations
 */
export async function getGoalBasedRecommendations(
  userId: string,
  limit: number = 10
): Promise<Recipe[]> {
  try {
    const { data: goal } = await supabase
      .from('goals')
      .select('type')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!goal) {
      return [];
    }

    const { data: interactions } = await supabase
      .from('recipe_interactions')
      .select('recipe_id')
      .eq('user_id', userId);

    const excludeIds = interactions?.map(i => i.recipe_id) || [];

    const goalFilters: Record<string, string> = {
      'Lose Weight': 'good_for_weight_loss',
      'Gain Muscle': 'good_for_muscle_gain',
      'Improve Heart Health': 'good_for_heart_health',
      'Increase Energy': 'good_for_energy',
      'Better Sleep': 'good_for_late_night'
    };

    const filterColumn = goalFilters[goal.type];

    if (!filterColumn) {
      return [];
    }

    // Fetch all recipes and filter in JS to avoid TS deep instantiation issues
    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('status', 'published')
      .order('average_rating', { ascending: false });

    if (!recipes) {
      return [];
    }

    const filtered = recipes
      .filter((r: any) => r[filterColumn] === true)
      .filter(r => !excludeIds.includes(r.id))
      .slice(0, limit);

    return filtered;
  } catch (error) {
    console.error('Goal-based recommendations error:', error);
    return [];
  }
}

/**
 * HYBRID RECOMMENDATION ENGINE
 */
export async function getHybridRecommendations(
  userId: string,
  limit: number = 20
): Promise<Recipe[]> {
  try {
    const [collaborative, contentBased, goalBased, trending] = await Promise.all([
      getCollaborativeRecommendations(userId, 10),
      getContentBasedRecommendations(userId, 10),
      getGoalBasedRecommendations(userId, 10),
      getTrendingRecommendations(10)
    ]);

    const allRecipes = new Map<string, { recipe: Recipe; score: number }>();

    collaborative.forEach((recipe, index) => {
      allRecipes.set(recipe.id, {
        recipe,
        score: (collaborative.length - index) * 3
      });
    });

    contentBased.forEach((recipe, index) => {
      const existing = allRecipes.get(recipe.id);
      const score = (contentBased.length - index) * 2.5;
      if (existing) {
        existing.score += score;
      } else {
        allRecipes.set(recipe.id, { recipe, score });
      }
    });

    goalBased.forEach((recipe, index) => {
      const existing = allRecipes.get(recipe.id);
      const score = (goalBased.length - index) * 2;
      if (existing) {
        existing.score += score;
      } else {
        allRecipes.set(recipe.id, { recipe, score });
      }
    });

    trending.forEach((recipe, index) => {
      const existing = allRecipes.get(recipe.id);
      const score = (trending.length - index) * 1.5;
      if (existing) {
        existing.score += score;
      } else {
        allRecipes.set(recipe.id, { recipe, score });
      }
    });

    const sorted = Array.from(allRecipes.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.recipe);

    return sorted;
  } catch (error) {
    console.error('Hybrid recommendations error:', error);
    return [];
  }
}

/**
 * Track user interaction
 */
export async function trackInteraction(
  userId: string,
  recipeId: string,
  interactionType: 'view' | 'favorite' | 'unfavorite' | 'log' | 'share' | 'review'
) {
  try {
    if (interactionType === 'view') {
      const { data: existing } = await supabase
        .from('recipe_interactions')
        .select('view_count, first_viewed_at')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .maybeSingle();
      
      await supabase
        .from('recipe_interactions')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          viewed: true,
          last_viewed_at: new Date().toISOString(),
          view_count: existing ? (existing.view_count || 0) + 1 : 1,
          first_viewed_at: existing?.first_viewed_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recipe_id'
        });
    } else if (interactionType === 'favorite') {
      await supabase
        .from('recipe_interactions')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          favorited: true,
          favorited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recipe_id'
        });
      
      await supabase.rpc('update_user_taste_profile', { p_user_id: userId });
    } else if (interactionType === 'unfavorite') {
      await supabase
        .from('recipe_interactions')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          favorited: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recipe_id'
        });
    } else if (interactionType === 'log') {
      await supabase
        .from('recipe_interactions')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          logged_to_diary: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recipe_id'
        });
      
      await supabase.rpc('update_user_taste_profile', { p_user_id: userId });
    } else if (interactionType === 'review') {
      await supabase
        .from('recipe_interactions')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          reviewed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recipe_id'
        });
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}