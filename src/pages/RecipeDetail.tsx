import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Users,
  ChefHat,
  Flame,
  Star,
  Lock,
  Unlock,
  ShoppingCart,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Camera,
  MessageCircle,
  ThumbsUp,
  Download,
  Printer,
  Bookmark,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

export default function RecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [similarRecipes, setSimilarRecipes] = useState<any[]>([]);
  const [servings, setServings] = useState(2);

  // Sample recipe data (you'd load this from Supabase)
  const SAMPLE_RECIPE = {
    id: recipeId,
    name: 'Grilled Salmon with Quinoa & Roasted Vegetables',
    description: 'A perfectly balanced meal featuring omega-3 rich salmon, protein-packed quinoa, and colorful roasted vegetables. This recipe is designed by professional nutritionists to maximize both flavor and nutritional value.',
    images: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1580959375944-0b58cd8e7c24?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&h=800&fit=crop'
    ],
    thumbnail_index: 0,
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    
    // Pricing & Status
    is_paid: true,
    price: 4.99,
    original_price: 9.99,
    is_on_deal: true,
    deal_percentage: 50,
    deal_description: 'Limited Time: 50% OFF - Ends in 48 hours!',
    
    // Nutrition
    calories_per_serving: 520,
    protein_g: 38,
    carbs_g: 45,
    fats_g: 18,
    fiber_g: 8,
    sugar_g: 6,
    sodium_mg: 380,
    servings: 2,
    
    // Timing
    prep_time_min: 15,
    cook_time_min: 25,
    total_time_min: 40,
    
    // Meta
    difficulty: 'Intermediate',
    cuisine: 'Mediterranean',
    category: 'Dinner',
    meal_types: ['Dinner', 'Lunch'],
    
    // Tags & Goals
    tags: ['High Protein', 'Heart Healthy', 'Omega-3', 'Gluten Free', 'Dairy Free'],
    good_for_weight_loss: true,
    good_for_muscle_gain: true,
    good_for_heart_health: true,
    good_for_energy: true,
    
    // Stats
    average_rating: 4.8,
    total_reviews: 127,
    total_unlocks: 1243,
    total_revenue: 6143.57,
    
    // Creator
    user_id: 'creator-123',
    creator: {
      name: 'Chef Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      title: 'Professional Nutritionist & Chef',
      recipes_count: 47,
      followers: 12500
    },
    
    // Equipment
    equipment: ['Grill or Grill Pan', 'Medium Pot', 'Baking Sheet', 'Mixing Bowls'],
    
    // Ingredients
    ingredients: [
      {
        category: 'Main Protein',
        items: [
          { name: 'Wild-caught salmon fillet', amount: '10 oz', notes: 'Skin-on preferred' },
          { name: 'Olive oil', amount: '2 tbsp', notes: 'Extra virgin' },
          { name: 'Lemon', amount: '1', notes: 'Zested and juiced' }
        ]
      },
      {
        category: 'Quinoa Base',
        items: [
          { name: 'Quinoa', amount: '1 cup', notes: 'Rinsed' },
          { name: 'Vegetable broth', amount: '2 cups', notes: 'Low sodium' },
          { name: 'Garlic', amount: '2 cloves', notes: 'Minced' }
        ]
      },
      {
        category: 'Roasted Vegetables',
        items: [
          { name: 'Bell peppers', amount: '2', notes: 'Mixed colors, diced' },
          { name: 'Zucchini', amount: '1 large', notes: 'Sliced' },
          { name: 'Cherry tomatoes', amount: '1 cup', notes: 'Halved' },
          { name: 'Red onion', amount: '1/2', notes: 'Sliced' }
        ]
      },
      {
        category: 'Seasonings',
        items: [
          { name: 'Dried oregano', amount: '1 tsp', notes: '' },
          { name: 'Paprika', amount: '1 tsp', notes: 'Smoked' },
          { name: 'Sea salt', amount: 'To taste', notes: '' },
          { name: 'Black pepper', amount: 'To taste', notes: 'Freshly ground' }
        ]
      }
    ],
    
    // Instructions
    instructions: [
      {
        step: 1,
        title: 'Prepare the Quinoa',
        description: 'Rinse quinoa under cold water. In a medium pot, combine quinoa, vegetable broth, and minced garlic. Bring to a boil, then reduce heat to low, cover, and simmer for 15 minutes until liquid is absorbed.',
        time_min: 15,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
        tips: 'Rinsing quinoa removes the bitter coating called saponin'
      },
      {
        step: 2,
        title: 'Prepare Vegetables',
        description: 'Preheat oven to 425°F (220°C). Toss diced vegetables with 1 tbsp olive oil, salt, pepper, and oregano. Spread on a baking sheet in a single layer.',
        time_min: 5,
        image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&h=400&fit=crop',
        tips: 'Don\'t overcrowd the pan - vegetables need space to roast properly'
      },
      {
        step: 3,
        title: 'Roast Vegetables',
        description: 'Roast vegetables in preheated oven for 20-25 minutes, stirring halfway through, until tender and slightly caramelized.',
        time_min: 22,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
        tips: 'Stirring halfway ensures even roasting'
      },
      {
        step: 4,
        title: 'Season Salmon',
        description: 'Pat salmon dry with paper towels. Rub with remaining olive oil, lemon zest, paprika, salt, and pepper. Let sit for 5 minutes.',
        time_min: 5,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop',
        tips: 'Dry salmon = better sear and crispy skin'
      },
      {
        step: 5,
        title: 'Grill Salmon',
        description: 'Heat grill or grill pan over medium-high heat. Place salmon skin-side down. Cook for 4-5 minutes per side until internal temperature reaches 145°F (63°C).',
        time_min: 10,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
        tips: 'Don\'t flip too early - let it develop a nice crust first'
      },
      {
        step: 6,
        title: 'Plate & Serve',
        description: 'Fluff quinoa with a fork. Divide quinoa between plates, top with roasted vegetables and grilled salmon. Squeeze fresh lemon juice over everything. Garnish with fresh herbs if desired.',
        time_min: 3,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
        tips: 'Plate while everything is hot for the best experience'
      }
    ],
    
    // Nutrition Breakdown
    nutrition_breakdown: {
      vitamins: [
        { name: 'Vitamin D', amount: '75%', daily_value: true },
        { name: 'Vitamin B12', amount: '120%', daily_value: true },
        { name: 'Vitamin C', amount: '85%', daily_value: true },
        { name: 'Vitamin A', amount: '45%', daily_value: true }
      ],
      minerals: [
        { name: 'Omega-3', amount: '2.5g', daily_value: false },
        { name: 'Iron', amount: '15%', daily_value: true },
        { name: 'Calcium', amount: '8%', daily_value: true },
        { name: 'Potassium', amount: '20%', daily_value: true }
      ]
    }
  };

  const SAMPLE_REVIEWS = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      rating: 5,
      title: 'Absolutely Delicious! 🔥',
      comment: 'This recipe is a game-changer! The salmon was perfectly cooked and the combination of flavors is incredible. My whole family loved it. The instructions were super clear and easy to follow. Will definitely make this again!',
      created_at: '2025-01-05',
      helpful_count: 47,
      photos: [
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1580959375944-0b58cd8e7c24?w=300&h=300&fit=crop'
      ],
      verified_purchase: true
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      rating: 5,
      title: 'Perfect for meal prep!',
      comment: 'Made a double batch for my weekly meal prep. The macros are perfect for my fitness goals. Highly recommend!',
      created_at: '2025-01-03',
      helpful_count: 23,
      photos: [],
      verified_purchase: true
    },
    {
      id: '3',
      user: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      rating: 4,
      title: 'Great recipe, minor adjustments needed',
      comment: 'Really enjoyed this! I added a bit more lemon juice because I love citrus. The only thing is it took me a bit longer than 40 minutes, but I\'m a slower cook. Still absolutely delicious!',
      created_at: '2024-12-28',
      helpful_count: 12,
      photos: [],
      verified_purchase: true
    }
  ];

  const SAMPLE_SIMILAR = [
    {
      id: '2',
      name: 'Mediterranean Chicken Bowl',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      calories: 450,
      rating: 4.7,
      price: 3.99
    },
    {
      id: '3',
      name: 'Teriyaki Tuna Steak',
      image_url: 'https://images.unsplash.com/photo-1580959375944-0b58cd8e7c24?w=400&h=300&fit=crop',
      calories: 480,
      rating: 4.9,
      price: 5.99
    },
    {
      id: '4',
      name: 'Asian Sesame Shrimp',
      image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      calories: 380,
      rating: 4.6,
      price: 4.49
    }
  ];

  useEffect(() => {
    init();
  }, [recipeId]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    
    // Load recipe from database (using sample for now)
    setRecipe(SAMPLE_RECIPE);
    setServings(SAMPLE_RECIPE.servings);
    setReviews(SAMPLE_REVIEWS);
    setSimilarRecipes(SAMPLE_SIMILAR);
    
    // Check if unlocked
    const { data: unlock } = await supabase
      .from('recipe_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();
    
    setIsUnlocked(!SAMPLE_RECIPE.is_paid || !!unlock);
    
    // Check if favorited
    const { data: fav } = await supabase
      .from('favorite_recipes')
      .select('*')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();
    
    setIsFavorited(!!fav);
    
    setLoading(false);
  }

  async function handleUnlock() {
    toast({
      title: "Purchase Feature",
      description: "Stripe integration coming soon! Recipe unlocked for demo.",
    });
    setIsUnlocked(true);
  }

  async function toggleFavorite() {
    if (isFavorited) {
      await supabase
        .from('favorite_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);
      
      setIsFavorited(false);
      toast({ title: "Removed from favorites" });
    } else {
      await supabase
        .from('favorite_recipes')
        .insert({ user_id: userId, recipe_id: recipeId });
      
      setIsFavorited(true);
      toast({ title: "Added to favorites! ❤️" });
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + recipe.images.length) % recipe.images.length);
  };

  // Nutrition pie chart data
  const nutritionChartData = recipe ? [
    { name: 'Protein', value: recipe.protein_g, color: '#10b981' },
    { name: 'Carbs', value: recipe.carbs_g, color: '#3b82f6' },
    { name: 'Fats', value: recipe.fats_g, color: '#f59e0b' }
  ] : [];

  // Macro percentages for radial chart
  const macroRadialData = recipe ? [
    {
      name: 'Protein',
      value: (recipe.protein_g / 150) * 100,
      fill: '#10b981'
    },
    {
      name: 'Carbs',
      value: (recipe.carbs_g / 200) * 100,
      fill: '#3b82f6'
    },
    {
      name: 'Fats',
      value: (recipe.fats_g / 60) * 100,
      fill: '#f59e0b'
    }
  ] : [];

  if (loading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <ChefHat className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const adjustedIngredients = recipe.ingredients.map((category: any) => ({
    ...category,
    items: category.items.map((item: any) => ({
      ...item,
      // Adjust quantities based on servings
      amount: item.amount // In a real app, you'd calculate this
    }))
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-500/5 to-background">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/recipes')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className="rounded-full"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="overflow-hidden border-0 shadow-2xl">
                {/* Main Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={recipe.images[currentImageIndex]}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {recipe.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}

                  {/* Deal Badge */}
                  {recipe.is_on_deal && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.3 }}
                      className="absolute top-4 left-4"
                    >
                      <Badge className="bg-red-500 text-white px-4 py-2 text-base">
                        <Zap className="w-4 h-4 mr-1" />
                        {recipe.deal_percentage}% OFF
                      </Badge>
                    </motion.div>
                  )}

                  {/* Video Play Button */}
                  {recipe.youtube_url && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={() => window.open(recipe.youtube_url, '_blank')}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-2xl">
                        <Play className="w-10 h-10 text-red-500 ml-1" />
                      </div>
                    </motion.button>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-white text-sm">
                    {currentImageIndex + 1} / {recipe.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {recipe.images.length > 1 && (
                  <div className="p-4 bg-secondary/30">
                    <div className="flex gap-2 overflow-x-auto">
                      {recipe.images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-primary scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recipe Title & Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{recipe.description}</p>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{recipe.average_rating}</span>
                      <span className="text-muted-foreground">({recipe.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{recipe.total_unlocks.toLocaleString()} unlocked</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span>{recipe.total_time_min} min</span>
                    </div>
                    <Badge variant="secondary">{recipe.difficulty}</Badge>
                    <Badge variant="secondary">{recipe.cuisine}</Badge>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Health Benefits */}
              <div className="flex flex-wrap gap-2">
                {recipe.good_for_weight_loss && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Weight Loss
                  </Badge>
                )}
                {recipe.good_for_muscle_gain && (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <Award className="w-3 h-3 mr-1" />
                    Muscle Gain
                  </Badge>
                )}
                {recipe.good_for_heart_health && (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    <Heart className="w-3 h-3 mr-1" />
                    Heart Healthy
                  </Badge>
                )}
                {recipe.good_for_energy && (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <Zap className="w-3 h-3 mr-1" />
                    Energy Boost
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Creator Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={recipe.creator.avatar} />
                        <AvatarFallback>{recipe.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{recipe.creator.name}</p>
                        <p className="text-sm text-muted-foreground">{recipe.creator.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{recipe.creator.recipes_count} recipes</span>
                          <span>{recipe.creator.followers.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Tabs defaultValue="ingredients" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({recipe.total_reviews})</TabsTrigger>
                </TabsList>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients">
                  <Card>
                    <CardContent className="p-6">
                      {/* Servings Adjuster */}
                      <div className="flex items-center justify-between mb-6 p-4 bg-primary/5 rounded-lg">
                        <span className="font-semibold">Servings</span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setServings(Math.max(1, servings - 1))}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold w-12 text-center">{servings}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setServings(servings + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Ingredients List */}
                      <div className="space-y-6">
                        {adjustedIngredients.map((category: any, categoryIndex: number) => (
                          <div key={categoryIndex}>
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                              <ChefHat className="w-5 h-5 text-primary" />
                              {category.category}
                            </h3>
                            <div className="space-y-2">
                              {category.items.map((item: any, itemIndex: number) => (
                                <motion.div
                                  key={itemIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05 * itemIndex }}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                >
                                  <div className="w-6 h-6 rounded-full border-2 border-primary flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-medium">{item.name}</span>
                                    {item.notes && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        ({item.notes})
                                      </span>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="flex-shrink-0">
                                    {item.amount}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Equipment Needed */}
                      {isUnlocked && (
                        <div className="mt-6 pt-6 border-t">
                          <h3 className="font-bold text-lg mb-3">Equipment Needed</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {recipe.equipment.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 rounded bg-secondary/20">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Instructions Tab */}
                <TabsContent value="instructions">
                  {!isUnlocked ? (
                    <Card className="border-2 border-dashed">
                      <CardContent className="py-12 text-center">
                        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-xl font-semibold mb-2">Unlock Full Instructions</p>
                        <p className="text-muted-foreground mb-6">
                          Purchase this recipe to access detailed step-by-step instructions with photos
                        </p>
                        <Button size="lg" onClick={handleUnlock}>
                          <Unlock className="w-5 h-5 mr-2" />
                          Unlock for ${recipe.price}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {recipe.instructions.map((step: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex gap-6">
                                {/* Step Number */}
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-xl font-bold">
                                    {step.step}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <Badge variant="outline">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {step.time_min} min
                                    </Badge>
                                  </div>

                                  <p className="text-muted-foreground mb-4">{step.description}</p>

                                  {/* Step Image */}
                                  {step.image && (
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                                      <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  {/* Pro Tip */}
                                  {step.tips && (
                                    <div className="flex gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                      <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-semibold text-blue-600 mb-1">Pro Tip</p>
                                        <p className="text-sm">{step.tips}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-6xl font-bold mb-2">{recipe.average_rating}</div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 ${
                                    star <= Math.round(recipe.average_rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Based on {recipe.total_reviews} reviews
                            </p>
                          </div>

                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-8">{rating}★</span>
                                <Progress value={rating === 5 ? 80 : rating === 4 ? 15 : 5} className="flex-1" />
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                  {rating === 5 ? '102' : rating === 4 ? '19' : '6'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Write Review (if purchased) */}
                    {isUnlocked && (
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    onClick={() => setNewReview({ ...newReview, rating })}
                                    className="transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={`w-8 h-8 ${
                                        rating <= newReview.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Your Review</label>
                              <Textarea
                                placeholder="Share your experience with this recipe..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                rows={4}
                              />
                            </div>
                            <Button>
                              Submit Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Reviews List */}
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-semibold">{review.user.name}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                              star <= review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      {review.verified_purchase && (
                                        <Badge variant="secondary" className="text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                {review.title && (
                                  <h4 className="font-semibold mb-2">{review.title}</h4>
                                )}

                                <p className="text-muted-foreground mb-3">{review.comment}</p>

                                {/* Review Photos */}
                                {review.photos.length > 0 && (
                                  <div className="flex gap-2 mb-3">
                                    {review.photos.map((photo: string, idx: number) => (
                                      <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden">
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Review Actions */}
                                <div className="flex items-center gap-4 pt-2">
                                  <Button variant="ghost" size="sm">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Helpful ({review.helpful_count})
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Similar Recipes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Similar Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarRecipes.map((similar) => (
                  <Card
                    key={similar.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/recipe/${similar.id}`)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={similar.image_url}
                        alt={similar.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{similar.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{similar.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{similar.calories} cal</span>
                        <Badge variant="secondary">${similar.price}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Nutrition Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Nutrition Facts
                    </h3>

                    {/* Calories */}
                    <div className="text-center mb-6 p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                      <div className="text-5xl font-bold mb-1">{recipe.calories_per_serving}</div>
                      <div className="text-sm text-muted-foreground">Calories per Serving</div>
                    </div>

                    {/* Macro Pie Chart */}
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={nutritionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {nutritionChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Macro Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                        <span className="font-medium text-green-600">Protein</span>
                        <span className="font-bold text-green-600">{recipe.protein_g}g</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                        <span className="font-medium text-blue-600">Carbs</span>
                        <span className="font-bold text-blue-600">{recipe.carbs_g}g</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                        <span className="font-medium text-yellow-600">Fats</span>
                        <span className="font-bold text-yellow-600">{recipe.fats_g}g</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                        <span className="font-medium text-purple-600">Fiber</span>
                        <span className="font-bold text-purple-600">{recipe.fiber_g}g</span>
                      </div>
                    </div>

                    {/* Vitamins & Minerals */}
                    {isUnlocked && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-3">Vitamins & Minerals</h4>
                        <div className="space-y-2 text-sm">
                          {recipe.nutrition_breakdown.vitamins.map((vitamin: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-muted-foreground">{vitamin.name}</span>
                              <span className="font-medium">{vitamin.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Purchase Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardContent className="p-6">
                    {!isUnlocked ? (
                      <>
                        {recipe.is_on_deal && (
                          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm font-semibold text-red-600 mb-1">
                              ⏰ Limited Time Offer
                            </p>
                            <p className="text-xs text-red-600">{recipe.deal_description}</p>
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 mb-4">
                          {recipe.is_on_deal ? (
                            <>
                              <span className="text-4xl font-bold text-green-600">
                                ${recipe.price}
                              </span>
                              <span className="text-xl text-muted-foreground line-through">
                                ${recipe.original_price}
                              </span>
                              <Badge className="bg-green-500">Save ${(recipe.original_price - recipe.price).toFixed(2)}</Badge>
                            </>
                          ) : (
                            <span className="text-4xl font-bold">${recipe.price}</span>
                          )}
                        </div>

                        <Button
                          onClick={handleUnlock}
                          size="lg"
                          className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 mb-3"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Unlock Recipe
                        </Button>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Full ingredient list
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Step-by-step instructions
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Pro tips & variations
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Lifetime access
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10">
                          <Unlock className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-600">Recipe Unlocked!</span>
                        </div>

                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Printer className="w-4 h-4 mr-2" />
                            Print Recipe
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Add to Collection
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={toggleFavorite}>
                      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Recipe
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
