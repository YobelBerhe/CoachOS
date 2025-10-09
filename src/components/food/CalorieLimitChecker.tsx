import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Flame, 
  TrendingUp,
  Dumbbell,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface CalorieLimitCheckerProps {
  userId: string;
  date: string;
  newCalories: number;
  onContinue?: () => void;
  onCancel?: () => void;
}

interface CalorieData {
  dailyGoal: number;
  consumed: number;
  remaining: number;
  percentUsed: number;
}

export default function CalorieLimitChecker({
  userId,
  date,
  newCalories,
  onContinue,
  onCancel
}: CalorieLimitCheckerProps) {
  const [calorieData, setCalorieData] = useState<CalorieData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalorieData();
  }, [userId, date]);

  async function loadCalorieData() {
    try {
      const { data: targets } = await supabase
        .from('daily_targets')
        .select('calories')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      const dailyGoal = targets?.calories || 2000;

      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', userId)
        .eq('date', date);

      const consumed = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const remaining = dailyGoal - consumed;
      const percentUsed = (consumed / dailyGoal) * 100;

      setCalorieData({
        dailyGoal,
        consumed,
        remaining,
        percentUsed
      });
    } catch (error) {
      console.error('Error loading calorie data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !calorieData) {
    return <div className="p-4">Loading...</div>;
  }

  const newTotal = calorieData.consumed + newCalories;
  const wouldExceed = newTotal > calorieData.dailyGoal;
  const excessCalories = Math.max(0, newTotal - calorieData.dailyGoal);
  const newPercentUsed = (newTotal / calorieData.dailyGoal) * 100;
  const minutesToBurn = Math.ceil(excessCalories / 5);

  return (
    <Card className={wouldExceed ? 'border-destructive border-2' : ''}>
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Progress</span>
            <span className="text-sm text-muted-foreground">
              {calorieData.consumed} / {calorieData.dailyGoal} cal
            </span>
          </div>
          <Progress value={calorieData.percentUsed} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">After Adding This Food</span>
            <span className={`text-sm font-bold ${wouldExceed ? 'text-destructive' : 'text-green-600'}`}>
              {newTotal} / {calorieData.dailyGoal} cal
            </span>
          </div>
          <Progress 
            value={newPercentUsed} 
            className="h-2"
          />
        </div>

        {wouldExceed ? (
          <Alert className="border-destructive">
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-destructive mb-1">
                    ⚠️ You'll exceed your daily goal by {excessCalories} calories
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This may slow your progress toward your goal
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        Workout Suggestion
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        To burn these extra <strong>{excessCalories} calories</strong>, 
                        you'll need approximately <strong>{minutesToBurn} minutes</strong> of 
                        moderate exercise today.
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          🏃 {minutesToBurn}min Running
                        </Badge>
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          🚴 {Math.ceil(minutesToBurn * 1.5)}min Cycling
                        </Badge>
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          🚶 {Math.ceil(minutesToBurn * 2)}min Walking
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-600">
                ✓ Great choice! You'll still have {calorieData.dailyGoal - newTotal} calories remaining
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This keeps you on track with your daily goal
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-3 p-4 bg-secondary/30 rounded-lg">
          <div className="text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{newCalories}</p>
            <p className="text-xs text-muted-foreground">Adding</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{newTotal}</p>
            <p className="text-xs text-muted-foreground">New Total</p>
          </div>
          <div className="text-center">
            {wouldExceed ? (
              <>
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
                <p className="text-2xl font-bold text-destructive">+{excessCalories}</p>
                <p className="text-xs text-destructive">Over Limit</p>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{calorieData.dailyGoal - newTotal}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1"
            >
              {wouldExceed ? 'Log Anyway' : 'Log Food'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
