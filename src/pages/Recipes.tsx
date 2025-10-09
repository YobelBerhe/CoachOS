import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Flame,
  Clock,
  Star,
  TrendingUp,
  Heart,
  Lock,
  Sparkles,
  Filter,
  ChevronDown,
  DollarSign,
  Users,
  Award,
  Zap,
  Target,
  ChefHat,
  Play,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Recipes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<any[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockedRecipes, setUnlockedRecipes] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All Recipes', icon: '🍽️' },
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'lunch', name: 'Lunch', icon: '🥗' },
    { id: 'dinner', name: 'Dinner', icon: '🍛' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'dessert', name: 'Dessert', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' }
  ];

  const filters = [
    { id: 'high-protein', name: 'High Protein', icon: '💪' },
    { id: 'low-carb', name: 'Low Carb', icon: '🥑' },
    { id: 'keto', name: 'Keto', icon: '🥓' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
    { id: 'quick', name: 'Under 30 min', icon: '⚡' }
  ];

  useEffect(() => {
    init();
  }, [activeCategory, searchQuery]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadRecipes(user.id);
  }

  async function loadRecipes(uid: string) {
    try {
      // Load featured recipes (on deals)
      const { data: featured } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .eq('is_on_deal', true)
        .limit(5);

      if (featured) setFeaturedRecipes(featured);

      // Load trending recipes
      const { data: trending } = await supabase
        .from('recipe_trending_scores')
        .select(`
          recipe_id,
          trending_score,
          recipes (*)
        `)
        .order('trending_score', { ascending: false })
        .limit(10);

      if (trending) {
        setTrendingRecipes(trending.map(t => t.recipes).filter(Boolean));
      }

      // Load all recipes with filters
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'published');

      if (activeCategory !== 'all') {
        query = query.contains('meal_types', [activeCategory]);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data: allRecipes } = await query.order('created_at', { ascending: false }).limit(50);

      if (allRecipes) setRecipes(allRecipes);

      // Load user's favorites
      const { data: favs } = await supabase
        .from('favorite_recipes')
        .select('recipe_id')
        .eq('user_id', uid);

      if (favs) setFavorites(favs.map(f => f.recipe_id));

      // Load unlocked recipes
      const { data: unlocked } = await supabase
        .from('recipe_unlocks')
        .select('recipe_id')
        .eq('user_id', uid);

      if (unlocked) setUnlockedRecipes(unlocked.map(u => u.recipe_id));

    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(recipeId: string) {
    if (favorites.includes(recipeId)) {
      await supabase
        .from('favorite_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);
      
      setFavorites(prev => prev.filter(id => id !== recipeId));
      toast({ title: "Removed from favorites" });
    } else {
      await supabase
        .from('favorite_recipes')
        .insert({ user_id: userId, recipe_id: recipeId });
      
      setFavorites(prev => [...prev, recipeId]);
      toast({ title: "Added to favorites ❤️" });
    }
  }

  const RecipeCard = ({ recipe, featured = false }: any) => {
    const isUnlocked = !recipe.is_paid || unlockedRecipes.includes(recipe.id);
    const isFavorited = favorites.includes(recipe.id);
    const hasDiscount = recipe.is_on_deal && recipe.deal_percentage;
    const mainImage = recipe.images?.[recipe.thumbnail_index || 0] || recipe.image_url;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className={featured ? 'col-span-2' : ''}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
          {/* Recipe Image */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-muted-foreground/50" />
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {hasDiscount && (
                <Badge className="bg-red-500 text-white">
                  {recipe.deal_percentage}% OFF
                </Badge>
              )}
              {recipe.good_for_weight_loss && (
                <Badge className="bg-green-500 text-white">
                  Weight Loss
                </Badge>
              )}
              {recipe.good_for_muscle_gain && (
                <Badge className="bg-blue-500 text-white">
                  Muscle Gain
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
              />
            </motion.button>

            {/* Bottom Stats */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{recipe.average_rating?.toFixed(1) || '5.0'}</span>
                </div>
                <div className="flex items-center gap-1 text-white text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.total_time_min || 30} min</span>
                </div>
              </div>

              {!isUnlocked && recipe.is_paid && (
                <Badge className="bg-yellow-500 text-black">
                  <Lock className="w-3 h-3 mr-1" />
                  ${recipe.price || 2.99}
                </Badge>
              )}
            </div>
          </div>

          {/* Recipe Info */}
          <CardContent className="p-4" onClick={() => navigate(`/recipe/${recipe.id}`)}>
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {recipe.name}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe.description || 'Delicious and nutritious recipe'}
            </p>

            {/* Nutrition Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center p-2 rounded bg-orange-500/10">
                <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <p className="text-xs font-bold">{recipe.calories_per_serving}</p>
                <p className="text-xs text-muted-foreground">cal</p>
              </div>
              <div className="text-center p-2 rounded bg-green-500/10">
                <p className="text-xs font-bold text-green-600">{recipe.protein_g}g</p>
                <p className="text-xs text-muted-foreground">protein</p>
              </div>
              <div className="text-center p-2 rounded bg-blue-500/10">
                <p className="text-xs font-bold text-blue-600">{recipe.carbs_g}g</p>
                <p className="text-xs text-muted-foreground">carbs</p>
              </div>
              <div className="text-center p-2 rounded bg-yellow-500/10">
                <p className="text-xs font-bold text-yellow-600">{recipe.fats_g}g</p>
                <p className="text-xs text-muted-foreground">fats</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {recipe.total_unlocks || 0} unlocked
                </span>
              </div>
              <Button 
                size="sm" 
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/recipe/${recipe.id}`);
                }}
              >
                {isUnlocked ? 'View Recipe' : 'Unlock'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <ChefHat className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-500/5 to-background pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-white/20 text-white border-0">
              <Sparkles className="w-4 h-4 mr-1" />
              Recipe Marketplace
            </Badge>
            <h1 className="text-5xl font-bold mb-4">
              Discover Delicious,<br />Healthy Recipes
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Thousands of nutritionist-approved recipes from top creators. Unlock, cook, and crush your goals! 🚀
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search recipes... (e.g., high protein chicken)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur border-0 text-foreground"
              />
              <Button 
                className="absolute right-2 top-2 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 -mt-8 relative z-10 space-y-8">
        {/* Featured Deals */}
        {featuredRecipes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Flash Deals
                </h2>
                <p className="text-sm text-muted-foreground">Limited time offers - save big!</p>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.slice(0, 3).map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trending Recipes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground">Most popular recipes this week</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {trendingRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="min-w-[280px] snap-start"
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Category Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* Diet Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 whitespace-nowrap"
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.name}
              </Badge>
            ))}
          </div>
        </motion.section>

        {/* All Recipes Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Recipes</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <select className="h-9 px-3 rounded-md border border-border bg-background text-sm">
                <option>Most Popular</option>
                <option>Newest First</option>
                <option>Lowest Price</option>
                <option>Highest Rated</option>
              </select>
            </div>
          </div>

          {recipes.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No recipes found. Try a different search!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
