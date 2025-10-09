import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Flame,
  Droplet,
  Moon,
  Dumbbell,
  Pill,
  Target,
  CheckCircle,
  AlertCircle,
  Award,
  Calendar
} from 'lucide-react';

interface ComplianceMetrics {
  nutrition: number;
  workout: number;
  sleep: number;
  hydration: number;
  medication: number;
  overall: number;
}

export default function ComplianceDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<ComplianceMetrics>({
    nutrition: 0,
    workout: 0,
    sleep: 0,
    hydration: 0,
    medication: 0,
    overall: 0
  });
  const [streak, setStreak] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await calculateCompliance(user.id);
    }
    init();
  }, [navigate]);

  async function calculateCompliance(uid: string) {
    try {
      setLoading(false);

      const { data: targets } = await supabase
        .from('daily_targets')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle();

      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', uid)
        .eq('date', today);

      const totalCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const calorieGoal = targets?.calories || 2000;
      const nutritionCompliance = Math.min(100, (totalCalories / calorieGoal) * 100);

      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today);

      const workoutCompliance = workouts && workouts.length > 0 ? 100 : 0;

      const { data: sleepLog } = await supabase
        .from('sleep_logs')
        .select('duration_min')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle();

      const sleepCompliance = sleepLog 
        ? Math.min(100, (sleepLog.duration_min / 480) * 100)
        : 0;

      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount_oz')
        .eq('user_id', uid)
        .eq('date', today);

      const totalWater = waterLogs?.reduce((sum, log) => sum + (log.amount_oz || 0), 0) || 0;
      const hydrationCompliance = Math.min(100, (totalWater / 64) * 100);

      const medicationCompliance = 100;

      const overall = (
        nutritionCompliance * 0.25 +
        workoutCompliance * 0.25 +
        sleepCompliance * 0.20 +
        hydrationCompliance * 0.15 +
        medicationCompliance * 0.15
      );

      setCompliance({
        nutrition: Math.round(nutritionCompliance),
        workout: Math.round(workoutCompliance),
        sleep: Math.round(sleepCompliance),
        hydration: Math.round(hydrationCompliance),
        medication: Math.round(medicationCompliance),
        overall: Math.round(overall)
      });

      setStreak(5);

    } catch (error) {
      console.error('Error calculating compliance:', error);
      setLoading(false);
    }
  }

  function getComplianceLevel(score: number): { label: string; color: string } {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-600' };
    if (score >= 75) return { label: 'Good', color: 'bg-blue-600' };
    if (score >= 60) return { label: 'Fair', color: 'bg-yellow-600' };
    return { label: 'Needs Work', color: 'bg-red-600' };
  }

  const overallLevel = getComplianceLevel(compliance.overall);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Calculating compliance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/10 dark:via-background dark:to-blue-950/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track your daily health habits
            </p>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className={`h-2 ${overallLevel.color}`} />
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - compliance.overall / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{compliance.overall}%</span>
                  <span className="text-sm text-muted-foreground">Overall</span>
                </div>
              </div>
              <Badge className={overallLevel.color}>
                {overallLevel.label}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-bold text-2xl">{streak} Day Streak! 🔥</p>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.nutrition}%</span>
                  {compliance.nutrition >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.nutrition} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.workout}%</span>
                  {compliance.workout >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.workout} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-600" />
                Sleep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.sleep}%</span>
                  {compliance.sleep >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.sleep} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-600" />
                Hydration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.hydration}%</span>
                  {compliance.hydration >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.hydration} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Pill className="w-4 h-4 text-pink-600" />
                Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.medication}%</span>
                  {compliance.medication >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.medication} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{compliance.overall}%</span>
                  {compliance.overall >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <Progress value={compliance.overall} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
