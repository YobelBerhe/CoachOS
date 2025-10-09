import { supabase } from '@/integrations/supabase/client';

interface CalorieAdjustment {
  excessCalories: number;
  recommendedWorkout: {
    type: string;
    duration: number;
    caloriesBurned: number;
  }[];
  alternativeMeals: any[];
  portionAdjustment?: {
    originalPortion: number;
    suggestedPortion: number;
    caloriesReduced: number;
  };
}

// Calorie burn rates per minute (moderate intensity)
const CALORIE_BURN_RATES = {
  running: 10,
  cycling: 8,
  swimming: 9,
  walking: 5,
  hiit: 12,
  yoga: 3,
  weightlifting: 6,
  dancing: 7,
  rowing: 9,
  jumping_rope: 13
};

export async function calculateCalorieAdjustment(
  userId: string,
  date: string,
  newCalories: number
): Promise<CalorieAdjustment> {
  
  // Get user's daily goal
  const { data: goal } = await supabase
    .from('goals')
    .select('daily_calorie_goal')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  const dailyGoal = goal?.daily_calorie_goal || 2000;

  // Get current consumption
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('calories')
    .eq('user_id', userId)
    .eq('date', date);

  const currentCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
  const totalAfterNew = currentCalories + newCalories;
  const excessCalories = Math.max(0, totalAfterNew - dailyGoal);

  // Calculate workout recommendations
  const recommendedWorkout = Object.entries(CALORIE_BURN_RATES).map(([type, rate]) => ({
    type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    duration: Math.ceil(excessCalories / rate),
    caloriesBurned: excessCalories
  })).sort((a, b) => a.duration - b.duration);

  // Find alternative lower-calorie meals
  const alternativeMeals = await findAlternativeMeals(newCalories * 0.8); // 20% less calories

  // Calculate portion adjustment
  const portionAdjustment = calculatePortionAdjustment(newCalories, excessCalories);

  return {
    excessCalories,
    recommendedWorkout: recommendedWorkout.slice(0, 5), // Top 5 recommendations
    alternativeMeals,
    portionAdjustment
  };
}

async function findAlternativeMeals(targetCalories: number): Promise<any[]> {
  const { data: alternatives } = await supabase
    .from('recipes')
    .select('id, name, calories_per_serving, images, thumbnail_index')
    .eq('status', 'published')
    .gte('calories_per_serving', targetCalories * 0.8)
    .lte('calories_per_serving', targetCalories * 1.2)
    .limit(3);

  return alternatives || [];
}

function calculatePortionAdjustment(
  originalCalories: number,
  excessCalories: number
): { originalPortion: number; suggestedPortion: number; caloriesReduced: number } {
  const reductionNeeded = excessCalories / originalCalories;
  const suggestedPortion = Math.max(0.5, 1 - reductionNeeded); // Don't go below 50%

  return {
    originalPortion: 1,
    suggestedPortion: Math.round(suggestedPortion * 100) / 100,
    caloriesReduced: originalCalories * (1 - suggestedPortion)
  };
}

// Auto-adjust workout plan
export async function autoAdjustWorkoutPlan(
  userId: string,
  date: string,
  excessCalories: number
) {
  try {
    // Get today's workout plan
    const { data: workout } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .is('completed_at', null)
      .maybeSingle();

    if (!workout) {
      // Create suggestion notification
      return {
        adjusted: true,
        message: `Add ${Math.ceil(excessCalories / 8)} min cardio to burn excess calories`
      };
    } else {
      // Extend existing workout
      const additionalMinutes = Math.ceil(excessCalories / 8);

      await supabase
        .from('workout_sessions')
        .update({
          notes: `${workout.notes || ''} Extended by ${additionalMinutes}min to burn excess calories`.trim()
        })
        .eq('id', workout.id);

      return {
        adjusted: true,
        message: `Extended workout by ${additionalMinutes} minutes`
      };
    }
  } catch (error) {
    console.error('Error adjusting workout:', error);
    return { adjusted: false, message: 'Could not adjust workout' };
  }
}
