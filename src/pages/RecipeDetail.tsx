import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Users,
  ChefHat,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Lock,
  Unlock,
  Plus,
  Check,
  DollarSign,
  Flame,
  TrendingUp,
  MessageSquare,
  Camera,
  Link as LinkIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NutritionPanel from '@/components/recipes/NutritionPanel';
import ReviewsSection from '@/components/recipes/ReviewsSection';
import CustomerPhotosGallery from '@/components/recipes/CustomerPhotosGallery';
import PaymentCheckout from '@/components/payments/PaymentCheckout';
import { trackInteraction } from '@/lib/recommendations/recommendationEngine';
import type { Database } from '@/integrations/supabase/types';

type DbRecipe = Database['public']['Tables']['recipes']['Row'];

interface Recipe extends Omit<DbRecipe, 'ingredients' | 'equipment' | 'instructions'> {
  ingredients: Array<{ item: string; amount: string; unit: string }>;
  equipment: Array<{ name: string; amazon_link?: string }>;
  instructions: string[];
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Payment state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await loadRecipe(user.id);
    }
    init();
  }, [id, navigate]);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && recipe && recipe.images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === recipe.images.length - 1 ? 0 : prev + 1
        );
      }, 6000); // 6 seconds like DoorDash

      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [isAutoPlaying, recipe, currentImageIndex]);

  async function loadRecipe(uid: string) {
    try {
      setLoading(true);

      // Fetch recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) throw recipeError;
      setRecipe(recipeData as Recipe);

      // Check if unlocked (if paid)
      if (recipeData.is_paid) {
        const { data: unlockData } = await supabase
          .from('recipe_unlocks')
          .select('id')
          .eq('user_id', uid)
          .eq('recipe_id', id)
          .maybeSingle();

        setIsUnlocked(!!unlockData || recipeData.user_id === uid);
      } else {
        setIsUnlocked(true);
      }

      // Check if favorite
      const { data: favData } = await supabase
        .from('favorite_recipes')
        .select('id')
        .eq('user_id', uid)
        .eq('recipe_id', id)
        .maybeSingle();

      setIsFavorite(!!favData);

      // Track view with recommendation engine
      await trackInteraction(uid, id!, 'view');
      
      // Also track in recipe_views for legacy support
      await supabase.from('recipe_views').insert({
        recipe_id: id,
        user_id: uid
      });

    } catch (error: any) {
      console.error('Error loading recipe:', error);
      toast({
        title: "Error loading recipe",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    if (!userId || !recipe) return;

    try {
      if (isFavorite) {
        await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipe.id);

        await trackInteraction(userId, recipe.id, 'unfavorite');
        setIsFavorite(false);
        toast({ title: "Removed from favorites" });
      } else {
        await supabase
          .from('favorite_recipes')
          .insert({ user_id: userId, recipe_id: recipe.id });

        await trackInteraction(userId, recipe.id, 'favorite');
        setIsFavorite(true);
        toast({ title: "Added to favorites! ❤️" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleUnlockRecipe() {
    if (!userId || !recipe) return;

    setUnlocking(true);

    try {
      // In production, this would call Stripe
      // For now, simulate payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('recipe_unlocks')
        .insert({
          user_id: userId,
          recipe_id: recipe.id,
          amount_paid: recipe.price || 0,
          platform_fee: (recipe.price || 0) * 0.15,
          creator_payout: (recipe.price || 0) * 0.85,
          status: 'completed'
        });

      if (error) throw error;

      setIsUnlocked(true);
      setShowUnlockModal(false);

      toast({
        title: "Recipe unlocked! 🎉",
        description: "You can now access all recipe details and log it to your diary"
      });

      await loadRecipe(userId);

    } catch (error: any) {
      toast({
        title: "Unlock failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  }

  async function logToFoodDiary() {
    if (!userId || !recipe) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5);
      
      const mealType = recipe.meal_types[0] || 'Snack';

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
          quantity: 1,
          meal_type: mealType,
          time: currentTime,
          source: 'Recipe',
          recipe_id: recipe.id,
          is_from_recipe: true
        });

      if (error) throw error;

      toast({
        title: "Logged to food diary! 🍽️",
        description: `${recipe.name} added to ${mealType}`
      });

      // Update recipe log count
      await supabase.rpc('increment_recipe_logs', { recipe_id: recipe.id });

    } catch (error: any) {
      toast({
        title: "Error logging to diary",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  function shareRecipe() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: recipe?.name,
        text: recipe?.description,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  }

  const nextImage = () => {
    if (!recipe) return;
    setCurrentImageIndex((prev) => 
      prev === recipe.images.length - 1 ? 0 : prev + 1
    );
    setIsAutoPlaying(false);
  };

  const prevImage = () => {
    if (!recipe) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? recipe.images.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Recipe not found</h2>
            <p className="text-muted-foreground mb-6">
              This recipe may have been deleted or doesn't exist
            </p>
            <Button onClick={() => navigate('/recipes')}>
              Browse Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTime = recipe.prep_time_min + recipe.cook_time_min;
  const allImages = [...recipe.images];
  if (recipe.youtube_url) {
    allImages.push('youtube'); // Placeholder for YouTube
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950/10 dark:via-background dark:to-red-950/10">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/recipes')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={shareRecipe}
              >
                <Share2 className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black group">
                {/* Main Image */}
                {currentImageIndex < recipe.images.length ? (
                  <img
                    src={recipe.images[currentImageIndex]}
                    alt={`${recipe.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // YouTube Video
                  recipe.youtube_url && (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(recipe.youtube_url)}`}
                        title="Recipe Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )
                )}

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* YouTube Badge */}
                {currentImageIndex === recipe.images.length && recipe.youtube_url && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-medium flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Video Tutorial
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4 bg-secondary/20">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {recipe.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                          Main
                        </div>
                      )}
                    </button>
                  ))}

                  {/* YouTube Thumbnail */}
                  {recipe.youtube_url && (
                    <button
                      onClick={() => goToImage(recipe.images.length)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-red-600/10 flex items-center justify-center ${
                        currentImageIndex === recipe.images.length
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Play className="w-8 h-8 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Recipe Header */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title & Rating */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h1 className="text-3xl font-bold">{recipe.name}</h1>
                      {recipe.is_paid && !isUnlocked && (
                        <Badge className="bg-green-600 text-lg px-3 py-1">
                          ${recipe.price?.toFixed(2)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{recipe.average_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({recipe.total_reviews} reviews)
                        </span>
                      </div>

                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    </div>

                    <p className="text-muted-foreground">{recipe.description}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                      <div className="font-bold">{totalTime}m</div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>

                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <div className="font-bold">{recipe.servings}</div>
                      <div className="text-xs text-muted-foreground">Servings</div>
                    </div>

                    <div className="text-center">
                      <Flame className="w-5 h-5 mx-auto mb-1 text-red-600" />
                      <div className="font-bold">{recipe.calories_per_serving}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.meal_types.map(type => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                    {recipe.tags.slice(0, 5).map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {!isUnlocked ? (
                      <Button
                        onClick={() => setShowUnlockModal(true)}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        size="lg"
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        Unlock for ${recipe.price?.toFixed(2)}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={logToFoodDiary}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                          size="lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Log to Food Diary
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={toggleFavorite}
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Content - Locked/Unlocked */}
            {!isUnlocked ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">Recipe Locked</h3>
                  <p className="text-muted-foreground mb-6">
                    Unlock this recipe to access ingredients, instructions, and more!
                  </p>
                  <Button
                    onClick={() => setShowUnlockModal(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    size="lg"
                  >
                    <Unlock className="w-5 h-5 mr-2" />
                    Unlock for ${recipe.price?.toFixed(2)}
                  </Button>
                  
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      💡 <strong>What you get:</strong> Full ingredients list, step-by-step instructions,
                      equipment recommendations, and the ability to log this recipe to your food diary
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="ingredients" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                {/* INGREDIENTS TAB */}
                <TabsContent value="ingredients">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                      <div className="space-y-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{ingredient.item}</span>
                            </div>
                            <Badge variant="outline">
                              {ingredient.amount} {ingredient.unit}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* INSTRUCTIONS TAB */}
                <TabsContent value="instructions">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Instructions</h3>
                      <div className="space-y-4">
                        {recipe.instructions.map((instruction, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 pt-2">
                              <p className="leading-relaxed">{instruction}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* EQUIPMENT TAB */}
                <TabsContent value="equipment">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Special Equipment</h3>
                      {recipe.equipment.length > 0 ? (
                        <div className="space-y-3">
                          {recipe.equipment.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                            >
                              <div className="flex items-center gap-3">
                                <ChefHat className="w-5 h-5 text-primary" />
                                <span className="font-medium">{item.name}</span>
                              </div>
                              {item.amazon_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(item.amazon_link, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View on Amazon
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No special equipment needed!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Customer Photos Gallery */}
            <CustomerPhotosGallery recipeId={recipe.id} recipeName={recipe.name} />

            {/* Reviews Section */}
            <ReviewsSection recipeId={recipe.id} userId={userId} />
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Panel */}
            <NutritionPanel recipe={recipe} />

            {/* Creator Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Recipe Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    {recipe.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">Recipe Creator</p>
                    <p className="text-sm text-muted-foreground">
                      Posted {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Share Recipe</h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={shareRecipe}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Friends
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unlock Modal with Payment Checkout */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Unlock Recipe</DialogTitle>
          </DialogHeader>

          <PaymentCheckout
            recipeId={recipe.id}
            recipeName={recipe.name}
            price={recipe.price || 0}
            onSuccess={async () => {
              setShowUnlockModal(false);
              await loadRecipe(userId);
              toast({
                title: "Recipe unlocked! 🎉",
                description: "You now have full access to this recipe"
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}
