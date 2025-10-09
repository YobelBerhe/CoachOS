import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Heart,
  Clock,
  Users,
  Flame,
  Plus,
  ChefHat,
  DollarSign,
  Star,
  Upload,
  X,
  Play,
  Tag,
  TrendingUp,
  Award,
  Sparkles,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string;
  images: string[];
  thumbnail_index: number;
  youtube_url?: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  meal_types: string[];
  cuisine_types: string[];
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Array<{ item: string; amount: string; unit: string }>;
  instructions: string[];
  equipment: Array<{ name: string; amazon_link?: string }>;
  is_paid: boolean;
  price?: number;
  stripe_account_id?: string;
  average_rating: number;
  total_reviews: number;
  is_favorite?: boolean;
  created_at: string;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 'Thai', 'Korean', 
  'Vietnamese', 'American', 'French', 'Spanish', 'Greek', 'Middle Eastern',
  'Filipino', 'Brazilian', 'Peruvian', 'Argentine', 'Pakistani', 'African',
  'Nigerian', 'Habesha', 'Southern', 'BBQ', 'Seafood', 'Vegan', 'Halal',
  'Pizza', 'Sushi', 'Ramen', 'Noodles', 'Soup', 'Salad', 'Desserts',
  'Healthy', 'Comfort Food', 'Steak', 'Sandwiches', 'Poke', 'Tapas'
];

const DIET_TAGS = [
  'High Protein', 'Low Carb', 'Keto', 'Vegetarian', 'Vegan', 
  'Gluten Free', 'Dairy Free', 'Paleo', 'Whole30', 'Mediterranean',
  'Quick', 'Meal Prep', 'Post-Workout', 'Pre-Workout', 'Late Night',
  'Budget Friendly', 'Family Friendly', 'Date Night', 'Party Food'
];

const MEASUREMENT_UNITS = [
  'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'L', 
  'piece', 'whole', 'pinch', 'dash', 'to taste'
];

const TIME_FILTERS = ['Under 15 min', 'Under 30 min', 'Under 45 min', 'Under 1 hour'];
const PRICE_FILTERS = ['Free', '$', '$$', '$$$'];

export default function RecipesEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [userGoal, setUserGoal] = useState<string>('');
  
  // Recipes state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealTypes, setSelectedMealTypes] = useState<Set<string>>(new Set());
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [minRating, setMinRating] = useState(0);
  const [filterByGoal, setFilterByGoal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Create recipe dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 2,
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    meal_types: [] as string[],
    cuisine_types: [] as string[],
    tags: [] as string[],
    youtube_url: '',
    is_paid: false,
    price: 0,
    ingredients: [{ item: '', amount: '', unit: 'cup' }],
    instructions: ['', '', '', '', '', ''],
    equipment: [{ name: '', amazon_link: '' }],
    images: [] as File[],
    thumbnail_index: 0
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await loadUserGoal(user.id);
      await loadRecipes();
      await loadFavorites(user.id);
    }
    init();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedMealTypes, selectedCuisines, selectedTags, selectedTime, selectedPrice, minRating, filterByGoal, recipes]);

  async function loadUserGoal(uid: string) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('type')
        .eq('user_id', uid)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (data) setUserGoal(data.type);
    } catch (error) {
      console.error('Error loading user goal:', error);
    }
  }

  async function loadRecipes() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes((data as any) || []);
      setFilteredRecipes((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading recipes",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function loadFavorites(uid: string) {
    try {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('recipe_id')
        .eq('user_id', uid);

      if (error) throw error;
      if (data) {
        setFavorites(new Set(data.map(f => f.recipe_id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  function applyFilters() {
    let filtered = [...recipes];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Meal Types
    if (selectedMealTypes.size > 0) {
      filtered = filtered.filter(r =>
        Array.from(selectedMealTypes).some(type => r.meal_types.includes(type))
      );
    }

    // Cuisines
    if (selectedCuisines.size > 0) {
      filtered = filtered.filter(r =>
        Array.from(selectedCuisines).some(cuisine => r.cuisine_types.includes(cuisine))
      );
    }

    // Tags
    if (selectedTags.size > 0) {
      filtered = filtered.filter(r =>
        Array.from(selectedTags).every(tag => r.tags.includes(tag))
      );
    }

    // Time
    if (selectedTime) {
      const maxTime = selectedTime === 'Under 15 min' ? 15
                    : selectedTime === 'Under 30 min' ? 30
                    : selectedTime === 'Under 45 min' ? 45
                    : 60;
      filtered = filtered.filter(r => (r.prep_time_min + r.cook_time_min) <= maxTime);
    }

    // Price
    if (selectedPrice) {
      if (selectedPrice === 'Free') {
        filtered = filtered.filter(r => !r.is_paid);
      } else {
        const priceLevel = selectedPrice.length;
        filtered = filtered.filter(r => {
          if (!r.is_paid) return false;
          const level = r.price <= 2.99 ? 1 : r.price <= 4.99 ? 2 : 3;
          return level === priceLevel;
        });
      }
    }

    // Rating
    if (minRating > 0) {
      filtered = filtered.filter(r => r.average_rating >= minRating);
    }

    // Filter by Goal
    if (filterByGoal && userGoal) {
      filtered = filterByUserGoal(filtered, userGoal);
    }

    setFilteredRecipes(filtered);
  }

  function filterByUserGoal(recipes: Recipe[], goal: string): Recipe[] {
    const goalKeywords: Record<string, string[]> = {
      'Lose Weight': ['Low Carb', 'Keto', 'High Protein', 'Low Calorie'],
      'Gain Muscle': ['High Protein', 'Post-Workout', 'High Calorie'],
      'Maintain Weight': ['Balanced', 'Mediterranean', 'Whole30'],
      'Improve Endurance': ['High Carb', 'Energy', 'Pre-Workout'],
      'Heart Health': ['Low Sodium', 'Heart Healthy', 'Mediterranean']
    };

    const keywords = goalKeywords[goal] || [];
    if (keywords.length === 0) return recipes;

    return recipes.filter(r =>
      keywords.some(keyword => 
        r.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      )
    );
  }

  function resetFilters() {
    setSearchQuery('');
    setSelectedMealTypes(new Set());
    setSelectedCuisines(new Set());
    setSelectedTags(new Set());
    setSelectedTime('');
    setSelectedPrice('');
    setMinRating(0);
    setFilterByGoal(false);
  }

  async function handleCreateRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (let i = 0; i < recipeForm.images.length; i++) {
        const file = recipeForm.images[i];
        const fileName = `${userId}/${Date.now()}_${i}.${file.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Filter out empty instructions
      const instructions = recipeForm.instructions.filter(i => i.trim() !== '');

      // Filter out empty ingredients
      const ingredients = recipeForm.ingredients.filter(i => i.item.trim() !== '');

      // Filter out empty equipment
      const equipment = recipeForm.equipment.filter(e => e.name.trim() !== '');

      // Create recipe
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          name: recipeForm.name,
          description: recipeForm.description,
          images: imageUrls,
          thumbnail_index: recipeForm.thumbnail_index,
          youtube_url: recipeForm.youtube_url || null,
          prep_time_min: recipeForm.prep_time_min,
          cook_time_min: recipeForm.cook_time_min,
          servings: recipeForm.servings,
          meal_types: recipeForm.meal_types,
          cuisine_types: recipeForm.cuisine_types,
          tags: recipeForm.tags,
          difficulty: recipeForm.difficulty,
          ingredients,
          instructions,
          equipment,
          is_paid: recipeForm.is_paid,
          price: recipeForm.is_paid ? recipeForm.price : null,
          category: recipeForm.meal_types[0] || 'Other',
          // Nutrition will be calculated by AI/backend
          calories_per_serving: 0,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 0
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Recipe created! 🎉",
        description: "Your recipe is now live for everyone to see"
      });

      setCreateDialogOpen(false);
      await loadRecipes();

    } catch (error: any) {
      toast({
        title: "Error creating recipe",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const activeFiltersCount = 
    selectedMealTypes.size + 
    selectedCuisines.size + 
    selectedTags.size + 
    (selectedTime ? 1 : 0) + 
    (selectedPrice ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (filterByGoal ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950/10 dark:via-background dark:to-red-950/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Recipe Collection</h1>
              <p className="text-sm text-muted-foreground">
                {filteredRecipes.length} recipes found
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {filterByGoal && userGoal && (
                <Badge variant="default" className="px-3 py-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Goal: {userGoal}
                </Badge>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* My Goal Filter */}
                {userGoal && (
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Filter by My Goal</p>
                        <p className="text-sm text-muted-foreground">
                          Show recipes optimized for: {userGoal}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={filterByGoal}
                      onCheckedChange={setFilterByGoal}
                    />
                  </div>
                )}

                {/* Time Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time to Make
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {TIME_FILTERS.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(selectedTime === time ? '' : time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Price
                  </Label>
                  <div className="flex gap-2">
                    {PRICE_FILTERS.map(price => (
                      <Button
                        key={price}
                        variant={selectedPrice === price ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPrice(selectedPrice === price ? '' : price)}
                      >
                        {price}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    <Star className="w-4 h-4 inline mr-2" />
                    Minimum Rating
                  </Label>
                  <div className="flex gap-2">
                    {[4, 4.5, 5].map(rating => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      >
                        {rating}+ ⭐
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Meal Types */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Meal Type</Label>
                  <div className="flex gap-2 flex-wrap">
                    {MEAL_TYPES.map(type => {
                      const isSelected = selectedMealTypes.has(type);
                      return (
                        <Button
                          key={type}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newSet = new Set(selectedMealTypes);
                            if (isSelected) newSet.delete(type);
                            else newSet.add(type);
                            setSelectedMealTypes(newSet);
                          }}
                        >
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Diet Tags */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Diet & Tags
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {DIET_TAGS.slice(0, 10).map(tag => {
                      const isSelected = selectedTags.has(tag);
                      return (
                        <Button
                          key={tag}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newSet = new Set(selectedTags);
                            if (isSelected) newSet.delete(tag);
                            else newSet.add(tag);
                            setSelectedTags(newSet);
                          }}
                        >
                          {tag}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">
            {filteredRecipes.length} results
          </p>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No recipes found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.has(recipe.id)}
                onToggleFavorite={() => {/* implement */}}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        )}

        {/* Create Recipe Dialog */}
        <CreateRecipeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          recipeForm={recipeForm}
          setRecipeForm={setRecipeForm}
          onSubmit={handleCreateRecipe}
        />
      </div>
    </div>
  );
}

// Recipe Card Component
function RecipeCard({ recipe, isFavorite, onToggleFavorite, onClick }: any) {
  const totalTime = recipe.prep_time_min + recipe.cook_time_min;

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.images[recipe.thumbnail_index] || recipe.images[0]} 
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Price Badge */}
        {recipe.is_paid && (
          <Badge className="absolute top-3 left-3 bg-green-600">
            ${recipe.price?.toFixed(2)}
          </Badge>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Rating & Time */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {recipe.average_rating.toFixed(1)} ({recipe.total_reviews})
          </Badge>
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
            <Clock className="w-3 h-3 mr-1" />
            {totalTime}m
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{recipe.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {recipe.description}
        </p>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
          <div className="text-center">
            <Flame className="w-3 h-3 mx-auto text-orange-500 mb-1" />
            <p className="font-bold text-sm">{recipe.calories_per_serving}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">P</p>
            <p className="font-bold text-sm text-green-600">{recipe.protein_g}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">C</p>
            <p className="font-bold text-sm text-blue-600">{recipe.carbs_g}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">F</p>
            <p className="font-bold text-sm text-yellow-600">{recipe.fats_g}g</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Create Recipe Dialog Component (Placeholder - needs full implementation)
function CreateRecipeDialog({ open, onOpenChange, recipeForm, setRecipeForm, onSubmit }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Your Recipe</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Share your culinary creation with the community! 🍳
        </p>
        {/* Form implementation continues in next part... */}
        <p className="text-center py-8 text-muted-foreground">
          Full form implementation coming in next section...
        </p>
      </DialogContent>
    </Dialog>
  );
}
