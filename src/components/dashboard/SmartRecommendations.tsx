import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Apple,
  Dumbbell,
  Droplet,
  ChevronRight,
  X
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'nutrition' | 'workout' | 'hydration' | 'health';
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
  icon: any;
}

interface SmartRecommendationsProps {
  userId: string;
}

export default function SmartRecommendations({ userId }: SmartRecommendationsProps) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [userId]);

  async function generateRecommendations() {
    try {
      const recs: Recommendation[] = [];
      const today = new Date().toISOString().split('T')[0];

      // 1. Check for low biomarkers
      const { data: lowBiomarkers } = await supabase.rpc('get_low_biomarkers', {
        p_user_id: userId
      });

      if (lowBiomarkers && lowBiomarkers.length > 0) {
        const biomarker = lowBiomarkers[0];
        const foodSuggestions: Record<string, string> = {
          'Potassium (K)': 'bananas, sweet potatoes, spinach',
          'Magnesium (Mg)': 'almonds, dark chocolate, avocados',
          'Vitamin D': 'salmon, egg yolks, fortified milk',
          'Iron': 'red meat, lentils, spinach',
        };

        const foods = foodSuggestions[biomarker.biomarker_name] || 'nutrient-rich foods';
        
        recs.push({
          id: 'biomarker-low',
          type: 'nutrition',
          title: `Low ${biomarker.biomarker_name} Detected`,
          description: `Your ${biomarker.biomarker_name} is below normal. Try adding ${foods} to your meals today.`,
          action: 'View Recipes',
          actionUrl: '/recipes',
          priority: 'high',
          icon: Apple
        });
      }

      // 2. Check today's nutrition
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories, protein_g')
        .eq('user_id', userId)
        .eq('date', today);

      const { data: targets } = await supabase
        .from('daily_targets')
        .select('calories, protein_g')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (foodLogs && targets) {
        const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein_g || 0), 0);

        if (totalProtein < targets.protein_g * 0.5) {
          recs.push({
            id: 'protein-low',
            type: 'nutrition',
            title: 'Protein Goal Behind',
            description: `You've only consumed ${Math.round(totalProtein)}g of ${targets.protein_g}g protein today. Add a protein-rich meal!`,
            action: 'Find High-Protein Recipes',
            actionUrl: '/recipes',
            priority: 'medium',
            icon: TrendingUp
          });
        }

        if (totalCalories > targets.calories) {
          const excess = totalCalories - targets.calories;
          const minutes = Math.ceil(excess / 8);
          recs.push({
            id: 'calories-over',
            type: 'workout',
            title: 'Over Calorie Goal',
            description: `You're ${excess} calories over your goal. Add ${minutes} minutes of cardio to balance it out!`,
            action: 'Quick Workout',
            actionUrl: '/train',
            priority: 'high',
            icon: Dumbbell
          });
        }
      }

      // 3. Check hydration
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount_oz')
        .eq('user_id', userId)
        .eq('date', today);

      const totalWater = waterLogs?.reduce((sum, log) => sum + log.amount_oz, 0) || 0;
      const waterGoal = 64; // 64 oz

      if (totalWater < waterGoal * 0.5 && new Date().getHours() > 12) {
        recs.push({
          id: 'hydration-low',
          type: 'hydration',
          title: 'Hydration Alert',
          description: `You've only had ${totalWater}oz of water today. Stay hydrated for better performance!`,
          action: 'Track More',
          actionUrl: '/dashboard',
          priority: 'medium',
          icon: Droplet
        });
      }

      // 4. Check workout compliance
      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const completedWorkouts = workouts?.filter(w => w.completed_at).length || 0;
      
      if (completedWorkouts < 3) {
        recs.push({
          id: 'workout-reminder',
          type: 'workout',
          title: 'Stay Active This Week',
          description: `You've completed ${completedWorkouts} workouts this week. Let's hit your 3-day minimum!`,
          action: 'Start Workout',
          actionUrl: '/train',
          priority: 'medium',
          icon: Dumbbell
        });
      }

      // Filter out dismissed recommendations
      const filtered = recs.filter(r => !dismissedIds.includes(r.id));
      
      // Sort by priority
      filtered.sort((a, b) => {
        const priority = { high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      });

      setRecommendations(filtered.slice(0, 3)); // Show max 3
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  function dismissRecommendation(id: string) {
    setDismissedIds(prev => [...prev, id]);
    setRecommendations(prev => prev.filter(r => r.id !== id));
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nutrition': return 'from-green-500 to-emerald-500';
      case 'workout': return 'from-blue-500 to-cyan-500';
      case 'hydration': return 'from-cyan-500 to-blue-400';
      case 'health': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold">Smart Recommendations</h3>
      </div>

      <AnimatePresence>
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          const gradient = getTypeColor(rec.type);

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 + index * 0.1 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <div className="flex items-center gap-1">
                          {rec.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs px-2">
                              High
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => dismissRecommendation(rec.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>

                      <Button
                        size="sm"
                        onClick={() => navigate(rec.actionUrl)}
                        className={`h-8 bg-gradient-to-r ${gradient} hover:opacity-90`}
                      >
                        {rec.action}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
