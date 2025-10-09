import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Leaf,
  Beef,
  Fish,
  Apple,
  Sparkles,
  TrendingUp,
  BookmarkPlus,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  category: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Array<{ item: string; amount: string }>;
  instructions: string[];
  is_favorite?: boolean;
}

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken Caesar Salad',
    description: 'Classic Caesar with perfectly grilled chicken breast, crisp romaine, and homemade dressing',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 2,
    calories_per_serving: 380,
    protein_g: 42,
    carbs_g: 12,
    fats_g: 18,
    category: 'Lunch',
    tags: ['High Protein', 'Low Carb', 'Keto Friendly'],
    difficulty: 'Easy',
    ingredients: [
      { item: 'Chicken breast', amount: '8 oz' },
      { item: 'Romaine lettuce', amount: '4 cups' },
      { item: 'Parmesan cheese', amount: '1/4 cup' },
      { item: 'Caesar dressing', amount: '2 tbsp' },
      { item: 'Olive oil', amount: '1 tbsp' }
    ],
    instructions: [
      'Season chicken breast with salt, pepper, and olive oil',
      'Grill chicken for 6-7 minutes per side until internal temp reaches 165°F',
      'Let chicken rest for 5 minutes, then slice',
      'Toss romaine with Caesar dressing',
      'Top with sliced chicken and parmesan cheese'
    ]
  },
  {
    id: '2',
    name: 'Overnight Protein Oats',
    description: 'Creamy overnight oats packed with protein, topped with fresh berries and almond butter',
    image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&h=600&fit=crop',
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    calories_per_serving: 420,
    protein_g: 30,
    carbs_g: 48,
    fats_g: 12,
    category: 'Breakfast',
    tags: ['High Protein', 'Meal Prep', 'Vegetarian'],
    difficulty: 'Easy',
    ingredients: [
      { item: 'Rolled oats', amount: '1/2 cup' },
      { item: 'Protein powder', amount: '1 scoop' },
      { item: 'Greek yogurt', amount: '1/4 cup' },
      { item: 'Almond milk', amount: '1/2 cup' },
      { item: 'Mixed berries', amount: '1/2 cup' },
      { item: 'Almond butter', amount: '1 tbsp' }
    ],
    instructions: [
      'Combine oats, protein powder, Greek yogurt, and almond milk in a jar',
      'Stir well until everything is mixed',
      'Cover and refrigerate overnight (or at least 4 hours)',
      'In the morning, top with fresh berries and almond butter',
      'Enjoy cold or microwave for 1 minute for warm oats'
    ]
  },
  {
    id: '3',
    name: 'Salmon Teriyaki Bowl',
    description: 'Pan-seared salmon with homemade teriyaki glaze, served over brown rice with steamed vegetables',
    image_url: 'https://images.unsplash.com/photo-1580959375944-0b58cd8e7c24?w=800&h=600&fit=crop',
    prep_time_min: 10,
    cook_time_min: 25,
    servings: 2,
    calories_per_serving: 520,
    protein_g: 38,
    carbs_g: 52,
    fats_g: 16,
    category: 'Dinner',
    tags: ['High Protein', 'Omega-3', 'Asian'],
    difficulty: 'Medium',
    ingredients: [
      { item: 'Salmon fillet', amount: '10 oz' },
      { item: 'Brown rice', amount: '1 cup cooked' },
      { item: 'Broccoli', amount: '2 cups' },
      { item: 'Soy sauce', amount: '3 tbsp' },
      { item: 'Honey', amount: '2 tbsp' },
      { item: 'Ginger', amount: '1 tsp minced' },
      { item: 'Garlic', amount: '2 cloves' }
    ],
    instructions: [
      'Make teriyaki sauce: combine soy sauce, honey, ginger, and garlic',
      'Season salmon with salt and pepper',
      'Heat pan over medium-high, cook salmon 4-5 min per side',
      'Pour teriyaki sauce over salmon, cook 2 more minutes',
      'Steam broccoli for 5 minutes',
      'Serve salmon over brown rice with broccoli on the side'
    ]
  },
  {
    id: '4',
    name: 'Greek Yogurt Protein Pancakes',
    description: 'Fluffy, protein-packed pancakes made with Greek yogurt and oats - guilt-free breakfast!',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 3,
    calories_per_serving: 280,
    protein_g: 22,
    carbs_g: 32,
    fats_g: 6,
    category: 'Breakfast',
    tags: ['High Protein', 'Vegetarian', 'Quick'],
    difficulty: 'Easy',
    ingredients: [
      { item: 'Greek yogurt', amount: '1 cup' },
      { item: 'Eggs', amount: '2 large' },
      { item: 'Oats', amount: '1 cup' },
      { item: 'Protein powder', amount: '1 scoop' },
      { item: 'Baking powder', amount: '1 tsp' },
      { item: 'Vanilla extract', amount: '1 tsp' }
    ],
    instructions: [
      'Blend all ingredients until smooth batter forms',
      'Let batter rest for 5 minutes',
      'Heat non-stick pan over medium heat',
      'Pour 1/4 cup batter per pancake',
      'Cook 2-3 minutes per side until golden',
      'Serve with fresh berries and maple syrup'
    ]
  },
  {
    id: '5',
    name: 'Beef Stir-Fry with Vegetables',
    description: 'Quick and flavorful beef stir-fry with colorful bell peppers, snap peas, and savory sauce',
    image_url: 'https://images.unsplash.com/photo-1603073421866-756e8c0b9add?w=800&h=600&fit=crop',
    prep_time_min: 15,
    cook_time_min: 12,
    servings: 3,
    calories_per_serving: 380,
    protein_g: 35,
    carbs_g: 28,
    fats_g: 14,
    category: 'Dinner',
    tags: ['High Protein', 'Asian', 'Quick'],
    difficulty: 'Medium',
    ingredients: [
      { item: 'Beef sirloin', amount: '1 lb sliced' },
      { item: 'Bell peppers', amount: '2 cups sliced' },
      { item: 'Snap peas', amount: '1 cup' },
      { item: 'Soy sauce', amount: '3 tbsp' },
      { item: 'Sesame oil', amount: '1 tbsp' },
      { item: 'Ginger', amount: '1 tbsp minced' },
      { item: 'Garlic', amount: '3 cloves minced' }
    ],
    instructions: [
      'Slice beef against the grain into thin strips',
      'Heat wok or large pan over high heat',
      'Stir-fry beef for 2-3 minutes, remove and set aside',
      'Add vegetables, stir-fry 3-4 minutes until tender-crisp',
      'Return beef to pan, add sauce ingredients',
      'Toss everything together for 1-2 minutes',
      'Serve immediately over rice or noodles'
    ]
  },
  {
    id: '6',
    name: 'Quinoa Power Bowl',
    description: 'Nutrient-dense bowl with quinoa, roasted chickpeas, avocado, and tahini dressing',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    prep_time_min: 15,
    cook_time_min: 30,
    servings: 2,
    calories_per_serving: 480,
    protein_g: 18,
    carbs_g: 56,
    fats_g: 20,
    category: 'Lunch',
    tags: ['Vegetarian', 'Vegan', 'High Fiber', 'Meal Prep'],
    difficulty: 'Easy',
    ingredients: [
      { item: 'Quinoa', amount: '1 cup cooked' },
      { item: 'Chickpeas', amount: '1 can' },
      { item: 'Sweet potato', amount: '1 medium cubed' },
      { item: 'Kale', amount: '2 cups' },
      { item: 'Avocado', amount: '1/2 sliced' },
      { item: 'Tahini', amount: '2 tbsp' },
      { item: 'Lemon juice', amount: '2 tbsp' }
    ],
    instructions: [
      'Roast sweet potato and chickpeas at 400°F for 25 minutes',
      'Cook quinoa according to package directions',
      'Massage kale with a bit of olive oil and lemon',
      'Make tahini dressing by mixing tahini, lemon juice, and water',
      'Assemble bowl with quinoa base',
      'Top with roasted vegetables, kale, avocado, and drizzle dressing'
    ]
  },
  {
    id: '7',
    name: 'Turkey Meatballs with Marinara',
    description: 'Lean turkey meatballs baked to perfection, served with homemade marinara sauce',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=600&fit=crop',
    prep_time_min: 20,
    cook_time_min: 25,
    servings: 4,
    calories_per_serving: 320,
    protein_g: 36,
    carbs_g: 18,
    fats_g: 10,
    category: 'Dinner',
    tags: ['High Protein', 'Meal Prep', 'Low Carb'],
    difficulty: 'Medium',
    ingredients: [
      { item: 'Ground turkey', amount: '1.5 lbs' },
      { item: 'Breadcrumbs', amount: '1/2 cup' },
      { item: 'Egg', amount: '1 large' },
      { item: 'Parmesan cheese', amount: '1/4 cup' },
      { item: 'Marinara sauce', amount: '2 cups' },
      { item: 'Italian seasoning', amount: '2 tsp' },
      { item: 'Garlic powder', amount: '1 tsp' }
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Mix turkey, breadcrumbs, egg, parmesan, and seasonings',
      'Form into 16 meatballs (about 2 tbsp each)',
      'Place on baking sheet, bake 20-25 minutes',
      'Heat marinara sauce in a pan',
      'Add cooked meatballs to sauce, simmer 5 minutes',
      'Serve over zucchini noodles or whole wheat pasta'
    ]
  },
  {
    id: '8',
    name: 'Chocolate Protein Smoothie Bowl',
    description: 'Thick, creamy chocolate smoothie bowl topped with granola, banana, and nut butter',
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    calories_per_serving: 380,
    protein_g: 28,
    carbs_g: 44,
    fats_g: 12,
    category: 'Breakfast',
    tags: ['High Protein', 'Vegetarian', 'Quick', 'Post-Workout'],
    difficulty: 'Easy',
    ingredients: [
      { item: 'Frozen banana', amount: '1 large' },
      { item: 'Chocolate protein powder', amount: '1 scoop' },
      { item: 'Almond milk', amount: '1/2 cup' },
      { item: 'Spinach', amount: '1 cup' },
      { item: 'Granola', amount: '1/4 cup' },
      { item: 'Peanut butter', amount: '1 tbsp' },
      { item: 'Cacao nibs', amount: '1 tsp' }
    ],
    instructions: [
      'Blend frozen banana, protein powder, almond milk, and spinach until thick',
      'Add ice if needed for thicker consistency',
      'Pour into bowl',
      'Top with granola, sliced banana, peanut butter drizzle',
      'Add cacao nibs and any other desired toppings',
      'Eat immediately with a spoon'
    ]
  }
];

const CATEGORIES = [
  { name: 'All', icon: ChefHat },
  { name: 'Breakfast', icon: Apple },
  { name: 'Lunch', icon: Beef },
  { name: 'Dinner', icon: Fish },
  { name: 'Snacks', icon: Sparkles }
];

const DIET_TAGS = [
  'High Protein',
  'Low Carb',
  'Keto Friendly',
  'Vegetarian',
  'Vegan',
  'Gluten Free',
  'Dairy Free',
  'Meal Prep',
  'Quick',
  'Post-Workout'
];

export default function Recipes() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [recipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await loadFavorites(user.id);
    }
    init();
  }, [navigate]);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, selectedCategory, selectedTags]);

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

  function filterRecipes() {
    let filtered = recipes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.size > 0) {
      filtered = filtered.filter(recipe =>
        Array.from(selectedTags).every(tag => recipe.tags.includes(tag))
      );
    }

    setFilteredRecipes(filtered);
  }

  function toggleTag(tag: string) {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  }

  async function toggleFavorite(recipeId: string) {
    if (!userId) return;

    try {
      const isFavorite = favorites.has(recipeId);
      const newFavorites = new Set(favorites);

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipeId);

        newFavorites.delete(recipeId);
        toast({ title: "Removed from favorites" });
      } else {
        // Add to favorites
        await supabase
          .from('favorite_recipes')
          .insert({ user_id: userId, recipe_id: recipeId });

        newFavorites.add(recipeId);
        toast({ title: "Added to favorites! ❤️" });
      }

      setFavorites(newFavorites);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function logRecipeToFoodDiary(recipe: Recipe) {
    if (!userId) return;

    try {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const mealType = recipe.category === 'Breakfast' ? 'Breakfast' 
                     : recipe.category === 'Lunch' ? 'Lunch'
                     : recipe.category === 'Dinner' ? 'Dinner'
                     : 'Snacks';

      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          date: today,
          food_name: recipe.name,
          calories: recipe.calories_per_serving,
          protein_g: recipe.protein_g,
          carbs_g: recipe.carbs_g,
          fats_g: recipe.fats_g,
          serving_size: `1 serving`,
          meal_type: mealType,
          time: currentTime
        });

      if (error) throw error;

      toast({
        title: "Logged to food diary! 🍽️",
        description: `${recipe.name} added to ${mealType}`
      });

      setSelectedRecipe(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const MacroBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}g</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

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
                {filteredRecipes.length} delicious recipes
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {selectedTags.size > 0 && (
              <Badge variant="default" className="ml-2">
                {selectedTags.size}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Dietary Tags</h3>
                  {selectedTags.size > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags(new Set())}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIET_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.has(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="h-8"
                    >
                      {selectedTags.has(tag) && <Check className="w-3 h-3 mr-1" />}
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No recipes found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isFavorite = favorites.has(recipe.id);
              const totalTime = recipe.prep_time_min + recipe.cook_time_min;

              return (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  {/* Recipe Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                      />
                    </button>

                    {/* Difficulty Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-3 left-3 backdrop-blur-sm bg-white/90 dark:bg-black/90"
                    >
                      {recipe.difficulty}
                    </Badge>

                    {/* Time Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-3 right-3 backdrop-blur-sm bg-white/90 dark:bg-black/90"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {totalTime}m
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    {/* Recipe Name */}
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">
                      {recipe.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-muted-foreground">Cal</span>
                        </div>
                        <p className="font-bold text-sm">{recipe.calories_per_serving}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Protein</p>
                        <p className="font-bold text-sm text-green-600">{recipe.protein_g}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                        <p className="font-bold text-sm text-blue-600">{recipe.carbs_g}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Fats</p>
                        <p className="font-bold text-sm text-yellow-600">{recipe.fats_g}g</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recipe Detail Modal */}
        <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Hero Image */}
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <img 
                      src={selectedRecipe.image_url} 
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="flex gap-2">
                        <Badge className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
                          <Users className="w-3 h-3 mr-1" />
                          {selectedRecipe.servings} servings
                        </Badge>
                        <Badge className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
                          <Clock className="w-3 h-3 mr-1" />
                          {selectedRecipe.prep_time_min + selectedRecipe.cook_time_min} min
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleFavorite(selectedRecipe.id)}
                        className="backdrop-blur-sm"
                      >
                        <Heart 
                          className={`w-4 h-4 mr-2 ${favorites.has(selectedRecipe.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                        {favorites.has(selectedRecipe.id) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground">{selectedRecipe.description}</p>

                  {/* Nutrition Info */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Nutrition per Serving
                    </h3>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white dark:bg-black/20 rounded-lg">
                        <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <div className="font-bold text-xl">{selectedRecipe.calories_per_serving}</div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-black/20 rounded-lg">
                        <div className="font-bold text-xl text-green-600">{selectedRecipe.protein_g}g</div>
                        <div className="text-xs text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-black/20 rounded-lg">
                        <div className="font-bold text-xl text-blue-600">{selectedRecipe.carbs_g}g</div>
                        <div className="text-xs text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-black/20 rounded-lg">
                        <div className="font-bold text-xl text-yellow-600">{selectedRecipe.fats_g}g</div>
                        <div className="text-xs text-muted-foreground">Fats</div>
                      </div>
                    </div>
                    
                    {/* Macro Bars */}
                    <div className="space-y-2">
                      <MacroBar label="Protein" value={selectedRecipe.protein_g} max={50} color="bg-green-500" />
                      <MacroBar label="Carbs" value={selectedRecipe.carbs_g} max={60} color="bg-blue-500" />
                      <MacroBar label="Fats" value={selectedRecipe.fats_g} max={30} color="bg-yellow-500" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-semibold mb-2">Diet Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Leaf className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tabs for Ingredients & Instructions */}
                  <Tabs defaultValue="ingredients">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ingredients" className="space-y-2 mt-4">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{ingredient.item}</span>
                          </div>
                          <Badge variant="outline">{ingredient.amount}</Badge>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="instructions" className="space-y-3 mt-4">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <div 
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-secondary/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="flex-1 text-sm leading-relaxed pt-1">
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => logRecipeToFoodDiary(selectedRecipe)}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      size="lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Log to Food Diary
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                    >
                      <BookmarkPlus className="w-5 h-5 mr-2" />
                      {favorites.has(selectedRecipe.id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
