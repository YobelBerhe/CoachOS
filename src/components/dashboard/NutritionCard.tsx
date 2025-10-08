import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Apple, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NutritionCardProps {
  targets: any;
  foodLogs: any[];
  fastingPlan: any;
}

export default function NutritionCard({ targets, foodLogs, fastingPlan }: NutritionCardProps) {
  const navigate = useNavigate();

  // Calculate totals
  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein_g || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs_g || 0), 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + (log.fats_g || 0), 0);

  const calorieTarget = targets?.calories || 2000;
  const proteinTarget = targets?.protein_g || 150;
  const carbsTarget = targets?.carbs_g || 200;
  const fatsTarget = targets?.fats_g || 60;

  const caloriePercentage = Math.min((totalCalories / calorieTarget) * 100, 100);
  const proteinPercentage = Math.min((totalProtein / proteinTarget) * 100, 100);
  const carbsPercentage = Math.min((totalCarbs / carbsTarget) * 100, 100);
  const fatsPercentage = Math.min((totalFats / fatsTarget) * 100, 100);

  // Check if within eating window
  const isInEatingWindow = () => {
    if (!fastingPlan) return true;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= fastingPlan.eating_window_start && currentTime <= fastingPlan.eating_window_end;
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="nutrition" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 rounded-t-lg transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Nutrition</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(totalCalories)} / {calorieTarget} cal ({Math.round(caloriePercentage)}%)
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full ${proteinPercentage >= 80 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${carbsPercentage >= 80 ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${fatsPercentage >= 80 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <CardContent className="space-y-4 pt-4">
            {/* Fasting Status */}
            {fastingPlan && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${isInEatingWindow() ? 'bg-green-100 dark:bg-green-900/20' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
                <Clock className={`w-4 h-4 ${isInEatingWindow() ? 'text-green-600' : 'text-orange-600'}`} />
                <span className="text-sm font-medium">
                  {isInEatingWindow() ? '🍽️ Eating window open' : '🔒 Fasting'}
                </span>
              </div>
            )}

            {/* Calorie Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Calories</span>
                <span className="text-muted-foreground">
                  {Math.round(totalCalories)} / {calorieTarget} cal
                </span>
              </div>
              <Progress value={caloriePercentage} className="h-3" />
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-lg font-bold text-green-600">{Math.round(totalProtein)}g</p>
                  <p className="text-xs text-muted-foreground">/ {proteinTarget}g</p>
                </div>
                <Progress value={proteinPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-lg font-bold text-blue-600">{Math.round(totalCarbs)}g</p>
                  <p className="text-xs text-muted-foreground">/ {carbsTarget}g</p>
                </div>
                <Progress value={carbsPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Fats</p>
                  <p className="text-lg font-bold text-yellow-600">{Math.round(totalFats)}g</p>
                  <p className="text-xs text-muted-foreground">/ {fatsTarget}g</p>
                </div>
                <Progress value={fatsPercentage} className="h-2" />
              </div>
            </div>

            {/* Meal Timeline */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">Today's Meals</p>
              {foodLogs.length === 0 ? (
                <div className="text-center py-8 bg-secondary/20 rounded-lg">
                  <Apple className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No meals logged yet</p>
                  <p className="text-xs text-muted-foreground">Start tracking your nutrition!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {foodLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex justify-between items-center p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => navigate('/eat')}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{log.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.time} • {log.meal_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{Math.round(log.calories)} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P:{Math.round(log.protein_g)} C:{Math.round(log.carbs_g)} F:{Math.round(log.fats_g)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => navigate('/eat')}
                className="flex-1"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Food
              </Button>
              <Button
                onClick={() => navigate('/recipes')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Recipes
              </Button>
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
