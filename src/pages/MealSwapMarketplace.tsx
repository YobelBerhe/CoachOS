import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, User, Star, MapPin, Clock, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateMealForm from '@/components/CreateMealForm';

interface MealSwap {
  id: string;
  title: string;
  description: string;
  meal_type: string;
  cuisine_type: string;
  portions: number;
  calories_per_portion: number;
  protein: number;
  carbs: number;
  fats: number;
  dietary_tags: string[];
  allergens: string[];
  prep_date: string;
  best_before: string;
  pickup_location: string;
  swap_type: string;
  credits_value: number;
  user_id: string;
}

export default function MealSwapMarketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [meals, setMeals] = useState<MealSwap[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function loadMarketplace() {
    try {
      const { data, error } = await supabase
        .from('meal_swaps')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error loading meals:', error);
      toast({
        title: "Error loading meals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

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
                <h1 className="text-2xl font-bold">🤝 Meal Swap Marketplace</h1>
                <p className="text-sm text-muted-foreground">Share meals, reduce waste</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Meal
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meals...</p>
          </div>
        ) : meals.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No meals available</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share a meal with your community!
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal, idx) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{meal.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{meal.pickup_location}</span>
                        </div>
                      </div>
                      {meal.swap_type === 'free' ? (
                        <Badge className="bg-green-500">FREE</Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                          {meal.credits_value} credits
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Tags */}
                    {meal.dietary_tags && meal.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {meal.dietary_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {meal.dietary_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{meal.dietary_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Nutrition */}
                    <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                      <div className="text-center p-2 rounded bg-secondary">
                        <p className="font-bold">{meal.calories_per_portion}</p>
                        <p className="text-muted-foreground">cal</p>
                      </div>
                      <div className="text-center p-2 rounded bg-secondary">
                        <p className="font-bold">{meal.protein}g</p>
                        <p className="text-muted-foreground">protein</p>
                      </div>
                      <div className="text-center p-2 rounded bg-secondary">
                        <p className="font-bold">{meal.carbs}g</p>
                        <p className="text-muted-foreground">carbs</p>
                      </div>
                      <div className="text-center p-2 rounded bg-secondary">
                        <p className="font-bold">{meal.fats}g</p>
                        <p className="text-muted-foreground">fats</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Best by: {new Date(meal.best_before).toLocaleDateString()}</span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500">
                        Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Meal Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Post a Meal</DialogTitle>
            <DialogDescription>
              Share your meal prep with the community
            </DialogDescription>
          </DialogHeader>

          <CreateMealForm
            onSuccess={() => {
              setShowCreateModal(false);
              loadMarketplace();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
