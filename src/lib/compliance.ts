import { supabase } from "@/integrations/supabase/client";

/**
 * Calculate daily compliance score (0-100)
 * Nutrition: 25%, Workout: 25%, Fasting: 20%, Sleep: 15%, Meds: 15%
 */
export async function calculateComplianceScore(userId: string, date: string) {
  try {
    // Get daily targets
    const { data: target } = await supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (!target) {
      return null;
    }

    // 1. NUTRITION SCORE (25%)
    const { data: foodLogs } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', userId)
      .eq('date', date);

    const totalCalories = foodLogs?.reduce((sum, log) => sum + log.calories, 0) || 0;
    const calorieVariance = Math.abs(totalCalories - target.calories);
    
    let nutritionScore = 0;
    if (calorieVariance <= 150) {
      nutritionScore = 100;
    } else if (calorieVariance <= 300) {
      nutritionScore = 50;
    }

    // 2. WORKOUT SCORE (25%)
    const { data: workout } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    const workoutScore = workout?.completed_at ? 100 : 0;

    // 3. FASTING SCORE (20%)
    const { data: fastingPlan } = await supabase
      .from('fasting_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    let fastingScore = 100; // Default if no fasting plan
    if (fastingPlan && foodLogs) {
      const windowStart = fastingPlan.eating_window_start;
      const windowEnd = fastingPlan.eating_window_end;

      const outsideWindow = foodLogs.some((log: any) => {
        const logTime = log.time;
        return logTime < windowStart || logTime > windowEnd;
      });

      fastingScore = outsideWindow ? 0 : 100;
    }

    // 4. SLEEP SCORE (15%)
    const { data: sleepLog } = await supabase
      .from('sleep_logs')
      .select('duration_min')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    let sleepScore = 0;
    if (sleepLog) {
      const hours = sleepLog.duration_min / 60;
      if (hours >= 7 && hours <= 9) {
        sleepScore = 100;
      } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
        sleepScore = 50;
      }
    }

    // 5. MEDS SCORE (15%) - Placeholder
    const medsScore = 100; // Will implement when medications table is ready

    // OVERALL SCORE (weighted average)
    const overallScore = Math.round(
      nutritionScore * 0.25 +
      workoutScore * 0.25 +
      fastingScore * 0.20 +
      sleepScore * 0.15 +
      medsScore * 0.15
    );

    // Save compliance score
    const { data, error } = await supabase
      .from('compliance_scores')
      .upsert({
        user_id: userId,
        date,
        overall_score: overallScore,
        nutrition_score: nutritionScore,
        workout_score: workoutScore,
        fasting_score: fastingScore,
        sleep_score: sleepScore
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error calculating compliance:', error);
    return null;
  }
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: string
): number {
  const baseCalc = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  
  if (sex === 'Male') {
    return baseCalc + 5;
  } else if (sex === 'Female') {
    return baseCalc - 161;
  } else {
    return baseCalc - 78; // Average
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Athlete': 1.9
  };
  
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateCalorieTarget(
  tdee: number,
  goalType: string
): number {
  switch (goalType) {
    case 'Fat Loss':
      return tdee - 500;
    case 'Muscle Gain':
      return tdee + 300;
    case 'Body Recomposition':
      return tdee;
    case 'Maintain':
      return tdee;
    default:
      return tdee;
  }
}

/**
 * Calculate macro targets
 */
export function calculateMacros(
  calories: number,
  weightKg: number,
  goalType: string
): { proteinG: number; fatsG: number; carbsG: number } {
  const weightLbs = weightKg * 2.20462;
  const proteinMultiplier = goalType === 'Muscle Gain' || goalType === 'Body Recomposition' ? 1.0 : 0.8;
  const proteinG = Math.round(weightLbs * proteinMultiplier);
  
  const fatCalories = calories * 0.27;
  const fatsG = Math.round(fatCalories / 9);
  
  const remainingCalories = calories - (proteinG * 4) - (fatsG * 9);
  const carbsG = Math.round(remainingCalories / 4);
  
  return { proteinG, fatsG, carbsG };
}

/**
 * Grade food based on nutritional quality
 */
export function gradeFood(nutrition: {
  proteinG: number;
  sugarG?: number;
  transFatG?: number;
  sodiumMg?: number;
}): {
  grade: 'APPROVE' | 'CAUTION' | 'AVOID';
  reason: string;
} {
  const { proteinG, sugarG = 0, transFatG = 0, sodiumMg = 0 } = nutrition;
  
  // AVOID criteria
  if (transFatG > 0) {
    return { grade: 'AVOID', reason: 'Contains trans fats' };
  }
  if (sugarG > 20) {
    return { grade: 'AVOID', reason: 'Very high sugar (>20g)' };
  }
  if (proteinG < 5 && sugarG > 10) {
    return { grade: 'AVOID', reason: 'Low protein + high sugar' };
  }
  if (sodiumMg > 800) {
    return { grade: 'AVOID', reason: 'Very high sodium (>800mg)' };
  }
  
  // APPROVE criteria
  if (proteinG >= 15 && sugarG <= 10 && sodiumMg < 500) {
    return { grade: 'APPROVE', reason: 'High protein, low sugar, moderate sodium' };
  }
  
  // CAUTION (everything else)
  const reasons: string[] = [];
  if (proteinG >= 5 && proteinG < 15) reasons.push('Moderate protein');
  if (sugarG > 10 && sugarG <= 20) reasons.push('Moderate sugar');
  if (sodiumMg >= 500 && sodiumMg <= 800) reasons.push('High sodium');
  
  return {
    grade: 'CAUTION',
    reason: reasons.join(', ') || 'Average nutritional profile'
  };
}
