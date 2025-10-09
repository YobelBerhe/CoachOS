import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { AddFoodDialog } from '@/components/nutrition/AddFoodDialog';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Flame,
  TrendingUp,
  Scan,
  Sparkles,
  Apple,
  Clock,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Eat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const [targets, setTargets] = useState({ calories: 2000, protein: 150, carbs: 200, fats: 60 });
  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [foodLogs, setFoodLogs] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadData(user.id);
  }

  async function loadData(uid: string) {
    try {
      // Load targets
      const { data: targetData } = await supabase
        .from('daily_targets')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle();

      if (targetData) {
        setTargets({
          calories: targetData.calories,
          protein: targetData.protein_g,
          carbs: targetData.carbs_g,
          fats: targetData.fats_g
        });
      }

      // Load food logs
      const { data: logs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .order('time', { ascending: false });

      if (logs) {
        setFoodLogs(logs);
        
        // Calculate consumed
        const totals = logs.reduce((acc, log) => ({
          calories: acc.calories + (log.calories || 0),
          protein: acc.protein + (log.protein_g || 0),
          carbs: acc.carbs + (log.carbs_g || 0),
          fats: acc.fats + (log.fats_g || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
        
        setConsumed(totals);
      }
    } catch (error) {
      console.error('Error loading food data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFood(id: string) {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Food deleted",
        description: "Removed from your diary"
      });

      await loadData(userId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const MacroRing = ({ label, consumed, target, color, icon: Icon }: any) => {
    const percentage = Math.min((consumed / target) * 100, 100);
    const remaining = Math.max(target - consumed, 0);

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className="relative"
      >
        <div className="text-center">
          <div className="relative inline-block">
            <svg width="100" height="100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-secondary"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={color}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={283}
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon className="w-5 h-5 mb-1" style={{ color }} />
              <span className="text-lg font-bold">{Math.round(consumed)}</span>
              <span className="text-xs text-muted-foreground">of {target}g</span>
            </div>
          </div>
          <p className="text-sm font-medium mt-2">{label}</p>
          <p className="text-xs text-muted-foreground">{Math.round(remaining)}g left</p>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Apple className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const caloriePercentage = Math.min((consumed.calories / targets.calories) * 100, 100);
  const remaining = Math.max(targets.calories - consumed.calories, 0);
  const isOverTarget = consumed.calories > targets.calories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-500/5 to-background pb-24">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-2xl font-bold">Nutrition</h1>
                <p className="text-sm text-muted-foreground">Track your meals</p>
              </div>
            </div>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="rounded-full h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search foods or meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-secondary/50 border-0"
            />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Calorie Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className={`h-2 bg-gradient-to-r ${isOverTarget ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500'}`} />
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4"
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">Daily Calories</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold">{Math.round(consumed.calories)}</span>
                    <span className="text-2xl text-muted-foreground">/ {targets.calories}</span>
                  </div>
                  
                  {isOverTarget ? (
                    <Badge variant="destructive" className="text-sm">
                      {consumed.calories - targets.calories} over goal
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-sm">
                      {remaining} remaining
                    </Badge>
                  )}
                </motion.div>
              </div>

              <Progress 
                value={caloriePercentage} 
                className={`h-4 ${isOverTarget ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
              />

              <p className="text-center text-sm text-muted-foreground mt-4">
                {Math.round(caloriePercentage)}% of daily goal
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Macro Rings - Instagram Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Macronutrients
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <MacroRing
                  label="Protein"
                  consumed={consumed.protein}
                  target={targets.protein}
                  color="#10b981"
                  icon={() => <span className="text-green-500">P</span>}
                />
                <MacroRing
                  label="Carbs"
                  consumed={consumed.carbs}
                  target={targets.carbs}
                  color="#3b82f6"
                  icon={() => <span className="text-blue-500">C</span>}
                />
                <MacroRing
                  label="Fats"
                  consumed={consumed.fats}
                  target={targets.fats}
                  color="#f59e0b"
                  icon={() => <span className="text-yellow-500">F</span>}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-primary/5"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Food</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-primary/5"
            onClick={() => toast({ title: "Coming soon!", description: "Barcode scanner feature" })}
          >
            <Scan className="w-5 h-5" />
            <span className="text-xs">Scan</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-primary/5"
            onClick={() => navigate('/recipes')}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">Recipes</span>
          </Button>
        </motion.div>

        {/* Food Log Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Meals
            </h3>
            <Badge variant="secondary">{foodLogs.length} items</Badge>
          </div>

          {foodLogs.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Apple className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                </motion.div>
                <p className="text-muted-foreground mb-2">No meals logged yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">Start tracking your nutrition!</p>
                <Button onClick={() => setShowAddDialog(true)} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Meal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {foodLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Apple className="w-8 h-8 text-green-500" />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{log.food_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {log.meal_type || 'Meal'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {log.time}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFood(log.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-3">
                              <div className="text-center p-2 bg-orange-500/10 rounded-lg">
                                <p className="text-sm font-bold">{log.calories}</p>
                                <p className="text-xs text-muted-foreground">cal</p>
                              </div>
                              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                <p className="text-sm font-bold text-green-600">{log.protein_g}g</p>
                                <p className="text-xs text-muted-foreground">protein</p>
                              </div>
                              <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                                <p className="text-sm font-bold text-blue-600">{log.carbs_g}g</p>
                                <p className="text-xs text-muted-foreground">carbs</p>
                              </div>
                              <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                                <p className="text-sm font-bold text-yellow-600">{log.fats_g}g</p>
                                <p className="text-xs text-muted-foreground">fats</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <AddFoodDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        userId={userId}
        onSuccess={() => loadData(userId)}
      />
    </div>
  );
}
