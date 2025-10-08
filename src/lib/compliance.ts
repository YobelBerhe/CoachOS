import { supabase } from "@/integrations/supabase/client";

interface DailyData {
  userId: string;
  date: string;
  dailyTargets: any;
  foodLogs: any[];
  workout: any;
  sleepLog: any;
  fastingPlan: any;
  medications: any[];
  medicationLogs: any[];
  waterLogs: any[];
}

/**
 * Calculate compliance score for a specific date
 */
export async function calculateComplianceScore(userId: string, date: string) {
  try {
    // Fetch all data for the day
    const data = await fetchDailyData(userId, date);

    // Calculate individual scores
    const nutritionScore = calculateNutritionScore(data);
    const workoutScore = calculateWorkoutScore(data);
    const fastingScore = calculateFastingScore(data);
    const sleepScore = calculateSleepScore(data);
    const medsScore = calculateMedsScore(data);
    const hydrationScore = calculateHydrationScore(data);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      nutritionScore * 0.20 +
      workoutScore * 0.20 +
      fastingScore * 0.15 +
      sleepScore * 0.15 +
      medsScore * 0.15 +
      hydrationScore * 0.15
    );

    // Save to database
    const { data: savedScore, error } = await supabase
      .from('compliance_scores')
      .upsert({
        user_id: userId,
        date,
        overall_score: overallScore,
        nutrition_score: nutritionScore,
        workout_score: workoutScore,
        fasting_score: fastingScore,
        sleep_score: sleepScore,
        hydration_score: hydrationScore
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw error;

    // Update streak if score >= 80
    await updateStreak(userId, date, overallScore);

    return savedScore;
  } catch (error) {
    console.error('Error calculating compliance:', error);
    return null;
  }
}

/**
 * Fetch all data needed for compliance calculation
 */
async function fetchDailyData(userId: string, date: string): Promise<DailyData> {
  const dailyTargetsRes = await supabase.from('daily_targets').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
  const foodLogsRes = await supabase.from('food_logs').select('*').eq('user_id', userId).eq('date', date);
  const workoutRes = await supabase.from('workout_sessions').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
  const sleepRes = await supabase.from('sleep_logs').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
  const fastingRes = await supabase.from('fasting_plans').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle();
  const medsRes = await supabase.from('medications').select('*').eq('user_id', userId).eq('is_active', true);
  const medLogsRes = await supabase.from('medication_logs').select('*').eq('user_id', userId)
    .gte('scheduled_time', `${date}T00:00:00`)
    .lte('scheduled_time', `${date}T23:59:59`);
  const waterLogsRes = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', date);

  return {
    userId,
    date,
    dailyTargets: dailyTargetsRes.data,
    foodLogs: foodLogsRes.data || [],
    workout: workoutRes.data,
    sleepLog: sleepRes.data,
    fastingPlan: fastingRes.data,
    medications: medsRes.data || [],
    medicationLogs: medLogsRes.data || [],
    waterLogs: waterLogsRes.data || []
  };
}

/**
 * NUTRITION SCORE (0-100)
 * 100 if within ±150 cal of target
 * 50 if within ±300 cal
 * 0 otherwise
 */
function calculateNutritionScore(data: DailyData): number {
  if (!data.dailyTargets) return 0;

  const totalCalories = data.foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const target = data.dailyTargets.calories;
  const variance = Math.abs(totalCalories - target);

  if (variance <= 150) return 100;
  if (variance <= 300) return 50;
  return 0;
}

/**
 * WORKOUT SCORE (0-100)
 * 100 if workout completed
 * 0 if not completed
 */
function calculateWorkoutScore(data: DailyData): number {
  if (!data.workout) return 100; // No workout scheduled = perfect score
  return data.workout.completed_at ? 100 : 0;
}

/**
 * FASTING SCORE (0-100)
 * 100 if all meals within eating window (or no fasting plan)
 * 0 if any meal outside window
 */
function calculateFastingScore(data: DailyData): number {
  if (!data.fastingPlan || !data.fastingPlan.is_active) return 100;

  const windowStart = data.fastingPlan.eating_window_start;
  const windowEnd = data.fastingPlan.eating_window_end;

  const outsideWindow = data.foodLogs.some(log => {
    const logTime = log.time;
    return logTime < windowStart || logTime > windowEnd;
  });

  return outsideWindow ? 0 : 100;
}

/**
 * SLEEP SCORE (0-100)
 * 100 if 7-9 hours
 * 50 if 6-7 or 9-10 hours
 * 0 otherwise
 */
function calculateSleepScore(data: DailyData): number {
  if (!data.sleepLog) return 0;

  const hours = data.sleepLog.duration_min / 60;

  if (hours >= 7 && hours <= 9) return 100;
  if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) return 50;
  return 0;
}

/**
 * MEDS SCORE (0-100)
 * Percentage of medications taken
 * 100 if no medications
 */
function calculateMedsScore(data: DailyData): number {
  if (data.medicationLogs.length === 0) return 100;

  const taken = data.medicationLogs.filter(log => log.taken_at && !log.skipped).length;
  return Math.round((taken / data.medicationLogs.length) * 100);
}

/**
 * HYDRATION SCORE (0-100)
 * 100 if >= 64 oz (daily goal)
 * Proportional if less
 */
function calculateHydrationScore(data: DailyData): number {
  const DAILY_GOAL = 64;
  const totalOz = data.waterLogs.reduce((sum, log) => sum + log.amount_oz, 0);
  return Math.min(Math.round((totalOz / DAILY_GOAL) * 100), 100);
}

/**
 * Update streak based on compliance score
 */
async function updateStreak(userId: string, date: string, score: number) {
  try {
    const isGoodDay = score >= 80;

    // Fetch current streak
    const { data: currentStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'Overall Compliance')
      .maybeSingle();

    if (isGoodDay) {
      const newCurrent = (currentStreak?.current_streak || 0) + 1;
      const newLongest = Math.max(newCurrent, currentStreak?.longest_streak || 0);

      await supabase.from('streaks').upsert({
        user_id: userId,
        type: 'Overall Compliance',
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_updated: date
      }, {
        onConflict: 'user_id,type'
      });
    } else {
      // Reset streak
      await supabase.from('streaks').upsert({
        user_id: userId,
        type: 'Overall Compliance',
        current_streak: 0,
        longest_streak: currentStreak?.longest_streak || 0,
        last_updated: date
      }, {
        onConflict: 'user_id,type'
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

/**
 * Get current streak for user
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .eq('type', 'Overall Compliance')
      .maybeSingle();

    if (error) throw error;
    return data?.current_streak || 0;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
}

/**
 * Calculate compliance for last 7 days (useful for weekly reports)
 */
export async function calculateWeeklyCompliance(userId: string) {
  const today = new Date();
  const scores = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const score = await calculateComplianceScore(userId, dateStr);
      scores.push(score);
    } catch (error) {
      console.error(`Error calculating score for ${dateStr}:`, error);
    }
  }

  return scores;
}

/**
 * Get weekly insights and recommendations
 */
export async function getWeeklyInsights(userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: scores, error } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    if (!scores || scores.length === 0) {
      return {
        avgOverall: 0,
        recommendations: ['Start tracking to get personalized insights!']
      };
    }

    const avgOverall = Math.round(scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length);
    const avgNutrition = Math.round(scores.reduce((sum, s) => sum + s.nutrition_score, 0) / scores.length);
    const avgWorkout = Math.round(scores.reduce((sum, s) => sum + s.workout_score, 0) / scores.length);
    const avgFasting = Math.round(scores.reduce((sum, s) => sum + s.fasting_score, 0) / scores.length);
    const avgSleep = Math.round(scores.reduce((sum, s) => sum + s.sleep_score, 0) / scores.length);

    const recommendations: string[] = [];

    // Overall
    if (avgOverall >= 80) {
      recommendations.push('🎉 Crushing it! Keep up the excellent consistency.');
    } else if (avgOverall >= 60) {
      recommendations.push('💪 Good effort this week. Focus on your weakest area below.');
    } else {
      recommendations.push('⚠️ Tough week. Reset tomorrow - you\'ve got this!');
    }

    // Find weakest area
    const areas = [
      { name: 'Nutrition', score: avgNutrition },
      { name: 'Workouts', score: avgWorkout },
      { name: 'Fasting', score: avgFasting },
      { name: 'Sleep', score: avgSleep }
    ];

    const weakest = areas.sort((a, b) => a.score - b.score)[0];

    if (weakest.score < 60) {
      switch (weakest.name) {
        case 'Nutrition':
          recommendations.push('🍽️ Pre-log meals in the morning to stay on track.');
          break;
        case 'Workouts':
          recommendations.push('💪 Schedule workouts like meetings - non-negotiable!');
          break;
        case 'Fasting':
          recommendations.push('⏰ Set alarms for eating window open/close times.');
          break;
        case 'Sleep':
          recommendations.push('😴 Set a bedtime alarm 30min earlier. Sleep affects everything!');
          break;
      }
    }

    return {
      avgOverall,
      avgNutrition,
      avgWorkout,
      avgFasting,
      avgSleep,
      recommendations
    };

  } catch (error) {
    console.error('Error getting weekly insights:', error);
    return {
      avgOverall: 0,
      recommendations: ['Error loading insights']
    };
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
