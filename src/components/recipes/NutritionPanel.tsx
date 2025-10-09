import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, TrendingUp, Zap, Heart, Moon, Coffee } from 'lucide-react';

interface NutritionPanelProps {
  recipe: {
    calories_per_serving: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    good_for_weight_loss?: boolean;
    good_for_muscle_gain?: boolean;
    good_for_heart_health?: boolean;
    good_for_energy?: boolean;
    good_for_late_night?: boolean;
    good_for_fasting?: boolean;
  };
}

export default function NutritionPanel({ recipe }: NutritionPanelProps) {
  const totalMacros = recipe.protein_g + recipe.carbs_g + recipe.fats_g;
  
  const proteinPercent = totalMacros > 0 ? (recipe.protein_g / totalMacros) * 100 : 0;
  const carbsPercent = totalMacros > 0 ? (recipe.carbs_g / totalMacros) * 100 : 0;
  const fatsPercent = totalMacros > 0 ? (recipe.fats_g / totalMacros) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Nutrition Facts
        </CardTitle>
        <p className="text-sm text-muted-foreground">Per serving</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calories */}
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-4xl font-bold">{recipe.calories_per_serving}</div>
          <div className="text-sm text-muted-foreground">Calories</div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{recipe.protein_g}g</div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{recipe.carbs_g}g</div>
            <div className="text-xs text-muted-foreground">Carbs</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{recipe.fats_g}g</div>
            <div className="text-xs text-muted-foreground">Fats</div>
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Protein</span>
              <span className="font-medium">{Math.round(proteinPercent)}%</span>
            </div>
            <Progress value={proteinPercent} className="h-2 bg-secondary [&>div]:bg-green-500" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Carbs</span>
              <span className="font-medium">{Math.round(carbsPercent)}%</span>
            </div>
            <Progress value={carbsPercent} className="h-2 bg-secondary [&>div]:bg-blue-500" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Fats</span>
              <span className="font-medium">{Math.round(fatsPercent)}%</span>
            </div>
            <Progress value={fatsPercent} className="h-2 bg-secondary [&>div]:bg-yellow-500" />
          </div>
        </div>

        {/* Additional Nutrition */}
        {(recipe.fiber_g || recipe.sugar_g || recipe.sodium_mg) && (
          <div className="pt-4 border-t space-y-2">
            {recipe.fiber_g && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fiber</span>
                <span className="font-medium">{recipe.fiber_g}g</span>
              </div>
            )}
            {recipe.sugar_g && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sugar</span>
                <span className="font-medium">{recipe.sugar_g}g</span>
              </div>
            )}
            {recipe.sodium_mg && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sodium</span>
                <span className="font-medium">{recipe.sodium_mg}mg</span>
              </div>
            )}
          </div>
        )}

        {/* Good For Tags */}
        {(recipe.good_for_weight_loss || 
          recipe.good_for_muscle_gain || 
          recipe.good_for_heart_health ||
          recipe.good_for_energy ||
          recipe.good_for_late_night ||
          recipe.good_for_fasting) && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Good For:</p>
            <div className="flex flex-wrap gap-2">
              {recipe.good_for_weight_loss && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Weight Loss
                </Badge>
              )}
              {recipe.good_for_muscle_gain && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Muscle Gain
                </Badge>
              )}
              {recipe.good_for_heart_health && (
                <Badge variant="outline" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Heart Health
                </Badge>
              )}
              {recipe.good_for_energy && (
                <Badge variant="outline" className="text-xs">
                  <Coffee className="w-3 h-3 mr-1" />
                  Energy
                </Badge>
              )}
              {recipe.good_for_late_night && (
                <Badge variant="outline" className="text-xs">
                  <Moon className="w-3 h-3 mr-1" />
                  Late Night
                </Badge>
              )}
              {recipe.good_for_fasting && (
                <Badge variant="outline" className="text-xs">
                  <Flame className="w-3 h-3 mr-1" />
                  Fasting Friendly
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
