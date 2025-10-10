import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Repeat,
  Plus,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  MessageCircle,
  Filter,
  Search,
  Utensils,
  Calendar,
  Flame,
  Leaf,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface MealSwap {
  id: string;
  user_id: string;
  title: string;
  description: string;
  meal_type: string;
  cuisine_type: string;
  portions: number;
  calories_per_portion: number;
  protein: number;
  carbs: number;
  fats: number;
  allergens: string[];
  dietary_tags: string[];
  prep_date: string;
  best_before: string;
  pickup_location: string;
  images: string[];
  status: string;
  swap_type: string;
  credits_value: number;
  views: number;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
    rating: number;
    total_reviews: number;
  };
}

export default function MealSwapMarketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [availableSwaps, setAvailableSwaps] = useState<MealSwap[]>([]);
  const [mySwaps, setMySwaps] = useState<MealSwap[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [selectedSwap, setSelectedSwap] = useState<MealSwap | null>(null);
  const [showSwapDetail, setShowSwapDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMarketplace();
    loadMyProfile();
  }, []);

  async function loadMarketplace() {
    try {
      const { data, error } = await supabase
        .from('meal_swaps')
        .select(`
          *,
          profiles:swap_profiles!meal_swaps_user_id_fkey(
            display_name,
            avatar_url,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableSwaps(data || []);
    } catch (error) {
      console.error('Error loading marketplace:', error);
    }
  }

  async function loadMyProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if profile exists
      let { data: profile, error } = await supabase
        .from('swap_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('swap_profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            credits: 10
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      }

      setMyProfile(profile);

      // Load user's swaps
      const { data: userSwaps } = await supabase
        .from('meal_swaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setMySwaps(userSwaps || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function claimSwap(swap: MealSwap) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (swap.user_id === user.id) {
        toast({
          title: "Can't claim your own meal",
          variant: "destructive"
        });
        return;
      }

      // Check if user has enough credits
      if (swap.swap_type === 'credit' && myProfile.credits < swap.credits_value) {
        toast({
          title: "Not enough credits",
          description: "Post meals to earn more credits!",
          variant: "destructive"
        });
        return;
      }

      // Update swap status
      const { error: swapError } = await supabase
        .from('meal_swaps')
        .update({
          status: 'claimed',
          claimed_by: user.id,
          claimed_at: new Date().toISOString()
        })
        .eq('id', swap.id);

      if (swapError) throw swapError;

      // Handle credits
      if (swap.swap_type === 'credit') {
        // Deduct from claimer
        await supabase
          .from('swap_profiles')
          .update({
            credits: myProfile.credits - swap.credits_value
          })
          .eq('user_id', user.id);

        // Add to provider
        await supabase.rpc('increment_credits', {
          user_id: swap.user_id,
          amount: swap.credits_value
        });
      }

      // Create transaction
      await supabase
        .from('swap_transactions')
        .insert({
          swap_id: swap.id,
          provider_id: swap.user_id,
          receiver_id: user.id,
          transaction_type: swap.swap_type,
          credits_amount: swap.credits_value,
          status: 'pending'
        });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Meal claimed! 🎉",
        description: "Contact the provider to arrange pickup"
      });

      setShowSwapDetail(false);
      await loadMarketplace();
      await loadMyProfile();

    } catch (error) {
      console.error('Error claiming swap:', error);
      toast({
        title: "Error claiming meal",
        variant: "destructive"
      });
    }
  }

  const filteredSwaps = availableSwaps.filter(swap => {
    const matchesSearch = swap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         swap.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || swap.meal_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-500/5 to-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Repeat className="w-6 h-6 text-orange-500" />
                  Meal Swap
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share meals, reduce waste, build community
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
            >
              <Plus className="w-4 h-4" />
              Post Meal
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* User Stats */}
        {myProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-orange-500">
                      <AvatarImage src={myProfile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl font-bold">
                        {myProfile.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{myProfile.display_name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{myProfile.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {myProfile.successful_swaps} swaps
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <span className="text-3xl font-bold text-orange-600">
                        {myProfile.credits}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Credits</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                    <p className="text-2xl font-bold text-orange-600">{myProfile.meals_posted}</p>
                    <p className="text-xs text-muted-foreground">Posted</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 text-center">
                    <p className="text-2xl font-bold text-green-600">{myProfile.meals_claimed}</p>
                    <p className="text-xs text-muted-foreground">Claimed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-2xl font-bold text-blue-600">{myProfile.total_reviews}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filter */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="breakfast">🌅 Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">☀️ Lunch</TabsTrigger>
                  <TabsTrigger value="dinner">🌙 Dinner</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="browse">Browse Meals</TabsTrigger>
            <TabsTrigger value="my-swaps">My Swaps</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            {filteredSwaps.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No meals available</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to post a meal!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <Plus className="w-4 h-4" />
                    Post Your First Meal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSwaps.map((swap, idx) => (
                  <motion.div
                    key={swap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedSwap(swap);
                      setShowSwapDetail(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      {/* Image */}
                      <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-6xl">
                        {swap.meal_type === 'breakfast' ? '🍳' :
                         swap.meal_type === 'lunch' ? '🥗' :
                         swap.meal_type === 'dinner' ? '🍽️' : '🍱'}
                      </div>

                      <CardContent className="p-4">
                        {/* Title & Type */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg line-clamp-1">{swap.title}</h4>
                          <Badge className={
                            swap.swap_type === 'free' ? 'bg-green-500' : 'bg-orange-500'
                          }>
                            {swap.swap_type === 'free' ? 'FREE' : `${swap.credits_value} 💎`}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {swap.description}
                        </p>

                        {/* Details */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="w-3 h-3" />
                            <span>{swap.portions} portion{swap.portions > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <Flame className="w-3 h-3" />
                            <span>{swap.calories_per_portion} cal</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{swap.pickup_location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Best before {new Date(swap.best_before).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {swap.dietary_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {swap.dietary_tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Provider */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={swap.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {swap.profiles?.display_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold">
                              {swap.profiles?.display_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{swap.profiles?.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Swaps Tab */}
          <TabsContent value="my-swaps">
            {mySwaps.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Repeat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No swaps yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Post your first meal to get started!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Post Meal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {mySwaps.map((swap) => (
                  <Card key={swap.id} className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{swap.title}</h4>
                            <Badge className={
                              swap.status === 'available' ? 'bg-green-500' :
                              swap.status === 'claimed' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }>
                              {swap.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {swap.portions} portions • {swap.pickup_location}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Posted {new Date(swap.created_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{swap.views} views</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Swap Detail Dialog */}
      <Dialog open={showSwapDetail} onOpenChange={setShowSwapDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSwap && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{selectedSwap.title}</DialogTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={selectedSwap.swap_type === 'free' ? 'bg-green-500' : 'bg-orange-500'}>
                        {selectedSwap.swap_type === 'free' ? 'FREE' : `${selectedSwap.credits_value} Credits`}
                      </Badge>
                      <Badge variant="secondary">{selectedSwap.meal_type}</Badge>
                      {selectedSwap.cuisine_type && (
                        <Badge variant="outline">{selectedSwap.cuisine_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Image */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-8xl">
                {selectedSwap.meal_type === 'breakfast' ? '🍳' :
                 selectedSwap.meal_type === 'lunch' ? '🥗' :
                 selectedSwap.meal_type === 'dinner' ? '🍽️' : '🍱'}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedSwap.description}</p>
              </div>

              {/* Nutrition */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3">Nutrition (per portion)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-secondary">
                      <p className="text-2xl font-bold">{selectedSwap.calories_per_portion}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary">
                      <p className="text-2xl font-bold text-blue-600">{selectedSwap.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary">
                      <p className="text-2xl font-bold text-orange-600">{selectedSwap.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary">
                      <p className="text-2xl font-bold text-yellow-600">{selectedSwap.fats}g</p>
                      <p className="text-xs text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Portions Available</p>
                    <p className="text-sm text-muted-foreground">{selectedSwap.portions} portion{selectedSwap.portions > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">{selectedSwap.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Best Before</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedSwap.best_before).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedSwap.dietary_tags.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Dietary Info</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSwap.dietary_tags.map((tag, i) => (
                      <Badge key={i} className="bg-green-500">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {selectedSwap.allergens.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2 text-red-600">⚠️ Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSwap.allergens.map((allergen, i) => (
                      <Badge key={i} variant="destructive">{allergen}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3">Provider</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedSwap.profiles?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        {selectedSwap.profiles?.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{selectedSwap.profiles?.display_name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{selectedSwap.profiles?.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">
                          ({selectedSwap.profiles?.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSwapDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedSwap.user_id !== myProfile?.user_id && (
                  <Button
                    onClick={() => claimSwap(selectedSwap)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Claim Meal
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Swap Modal - Coming in next part! */}
    </div>
  );
}
