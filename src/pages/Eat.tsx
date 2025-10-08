import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, Apple, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  meal_type: string;
  time: string;
  serving_size?: string;
  quantity?: number;
}

export default function Eat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [targets, setTargets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodLog | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // Form state
  const [formData, setFormData] = useState({
    food_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    meal_type: 'Breakfast',
    time: currentTime,
    serving_size: '',
    quantity: '1'
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchData(user.id);
    }
    init();
  }, [navigate]);

  async function fetchData(uid: string) {
    try {
      setLoading(true);

      // Fetch daily targets
      const { data: targetsData } = await supabase
        .from('daily_targets')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle();

      setTargets(targetsData);

      // Fetch food logs
      const { data: logsData, error: logsError } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .order('time', { ascending: true });

      if (logsError) throw logsError;
      setFoodLogs(logsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      food_name: '',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fats_g: '',
      meal_type: 'Breakfast',
      time: new Date().toTimeString().slice(0, 5),
      serving_size: '',
      quantity: '1'
    });
    setEditingFood(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const foodData = {
        user_id: userId,
        date: today,
        food_name: formData.food_name,
        calories: parseFloat(formData.calories),
        protein_g: parseFloat(formData.protein_g),
        carbs_g: parseFloat(formData.carbs_g),
        fats_g: parseFloat(formData.fats_g),
        meal_type: formData.meal_type,
        time: formData.time,
        serving_size: formData.serving_size || null,
        quantity: parseFloat(formData.quantity),
        source: 'Manual'
      };

      if (editingFood) {
        // Update existing
        const { error } = await supabase
          .from('food_logs')
          .update(foodData)
          .eq('id', editingFood.id);

        if (error) throw error;

        toast({
          title: "Food updated",
          description: `${formData.food_name} has been updated`
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from('food_logs')
          .insert(foodData);

        if (error) throw error;

        toast({
          title: "Food logged",
          description: `${formData.food_name} added to your diary`
        });
      }

      await fetchData(userId);
      setDialogOpen(false);
      resetForm();

    } catch (error: any) {
      console.error('Error saving food:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (food: FoodLog) => {
    setEditingFood(food);
    setFormData({
      food_name: food.food_name,
      calories: food.calories.toString(),
      protein_g: food.protein_g.toString(),
      carbs_g: food.carbs_g.toString(),
      fats_g: food.fats_g.toString(),
      meal_type: food.meal_type,
      time: food.time,
      serving_size: food.serving_size || '',
      quantity: food.quantity.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Food deleted",
        description: `${name} removed from your diary`
      });

      await fetchData(userId!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Calculate totals
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein_g,
      carbs: acc.carbs + log.carbs_g,
      fats: acc.fats + log.fats_g
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const calorieTarget = targets?.calories || 2000;
  const proteinTarget = targets?.protein_g || 150;
  const carbsTarget = targets?.carbs_g || 200;
  const fatsTarget = targets?.fats_g || 60;

  const caloriePercentage = Math.min((totals.calories / calorieTarget) * 100, 100);
  const proteinPercentage = Math.min((totals.protein / proteinTarget) * 100, 100);
  const carbsPercentage = Math.min((totals.carbs / carbsTarget) * 100, 100);
  const fatsPercentage = Math.min((totals.fats / fatsTarget) * 100, 100);

  // Group by meal type
  const groupedLogs = foodLogs.reduce((acc, log) => {
    if (!acc[log.meal_type]) acc[log.meal_type] = [];
    acc[log.meal_type].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Apple className="w-12 h-12 animate-bounce mx-auto mb-4 text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
              <h1 className="text-2xl font-bold">Food Diary</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFood ? 'Edit Food' : 'Add Food'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="food_name">Food Name *</Label>
                  <Input
                    id="food_name"
                    value={formData.food_name}
                    onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                    placeholder="e.g., Chicken Breast"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serving_size">Serving Size</Label>
                    <Input
                      id="serving_size"
                      value={formData.serving_size}
                      onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                      placeholder="e.g., 100g"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="calories">Calories *</Label>
                  <Input
                    id="calories"
                    type="number"
                    step="1"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="e.g., 165"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="protein_g">Protein (g) *</Label>
                    <Input
                      id="protein_g"
                      type="number"
                      step="0.1"
                      value={formData.protein_g}
                      onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs_g">Carbs (g) *</Label>
                    <Input
                      id="carbs_g"
                      type="number"
                      step="0.1"
                      value={formData.carbs_g}
                      onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats_g">Fats (g) *</Label>
                    <Input
                      id="fats_g"
                      type="number"
                      step="0.1"
                      value={formData.fats_g}
                      onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meal_type">Meal Type *</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingFood ? 'Update' : 'Add Food'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Daily Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Calories</span>
                <span className="text-muted-foreground">
                  {Math.round(totals.calories)} / {calorieTarget} cal
                </span>
              </div>
              <Progress value={caloriePercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-lg font-bold text-green-600">{Math.round(totals.protein)}g</p>
                  <p className="text-xs text-muted-foreground">/ {proteinTarget}g</p>
                </div>
                <Progress value={proteinPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-lg font-bold text-blue-600">{Math.round(totals.carbs)}g</p>
                  <p className="text-xs text-muted-foreground">/ {carbsTarget}g</p>
                </div>
                <Progress value={carbsPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Fats</p>
                  <p className="text-lg font-bold text-yellow-600">{Math.round(totals.fats)}g</p>
                  <p className="text-xs text-muted-foreground">/ {fatsTarget}g</p>
                </div>
                <Progress value={fatsPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Sections */}
        <div className="space-y-4">
          {mealTypes.map(mealType => {
            const meals = groupedLogs[mealType] || [];
            const mealCalories = meals.reduce((sum, m) => sum + m.calories, 0);

            return (
              <Card key={mealType}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{mealType}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(mealCalories)} cal
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No foods logged for {mealType.toLowerCase()}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {meals.map(food => (
                        <div 
                          key={food.id}
                          className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{food.food_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {food.time} • {food.quantity} {food.serving_size || 'serving'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              P: {Math.round(food.protein_g)}g • C: {Math.round(food.carbs_g)}g • F: {Math.round(food.fats_g)}g
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                              <p className="font-semibold">{Math.round(food.calories)} cal</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(food)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(food.id, food.food_name)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
