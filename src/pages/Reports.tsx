import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target,
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComplianceScore {
  date: string;
  overall_score: number;
  nutrition_score: number;
  workout_score: number;
  hydration_score: number;
  fasting_score: number;
  sleep_score: number;
  meds_score?: number;
}

interface WeightLog {
  date: string;
  weight_kg: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  avgDuration: number;
}

export default function Reports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(true);

  // Data states
  const [complianceData, setComplianceData] = useState<ComplianceScore[]>([]);
  const [weightData, setWeightData] = useState<WeightLog[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [sleepStats, setSleepStats] = useState<any>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchAllData(user.id);
    }
    init();
  }, [navigate, timeRange]);

  async function fetchAllData(uid: string) {
    try {
      setLoading(true);
      
      const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateStr = startDate.toISOString().split('T')[0];

      await Promise.all([
        fetchComplianceData(uid, startDateStr),
        fetchWeightData(uid, startDateStr),
        fetchWorkoutStats(uid, startDateStr),
        fetchNutritionStats(uid, startDateStr),
        fetchSleepStats(uid, startDateStr),
        fetchStreaks(uid)
      ]);

    } catch (error: any) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplianceData(uid: string, startDate: string) {
    const { data, error } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('user_id', uid)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) throw error;
    setComplianceData(data || []);
  }

  async function fetchWeightData(uid: string, startDate: string) {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', uid)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) throw error;
    setWeightData(data || []);
  }

  async function fetchWorkoutStats(uid: string, startDate: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', uid)
      .gte('date', startDate)
      .not('completed_at', 'is', null);

    if (error) throw error;

    if (data && data.length > 0) {
      let totalSets = 0;
      let totalReps = 0;
      let totalVolume = 0;
      
      data.forEach((workout: any) => {
        if (workout.exercise_logs) {
          workout.exercise_logs.forEach((log: any) => {
            if (Array.isArray(log.sets)) {
              totalSets += log.sets.length;
              log.sets.forEach((set: any) => {
                totalReps += set.reps || 0;
                totalVolume += (set.weight || 0) * (set.reps || 0);
              });
            }
          });
        }
      });

      const stats: WorkoutStats = {
        totalWorkouts: data.length,
        totalSets,
        totalReps,
        totalVolume,
        avgDuration: 0 // Not tracking duration currently
      };
      setWorkoutStats(stats);
    }
  }

  async function fetchNutritionStats(uid: string, startDate: string) {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', uid)
      .gte('date', startDate);

    if (error) throw error;

    if (data && data.length > 0) {
      const avgCalories = Math.round(
        data.reduce((sum, log) => sum + log.calories, 0) / data.length
      );
      const avgProtein = Math.round(
        data.reduce((sum, log) => sum + log.protein_g, 0) / data.length
      );
      const avgCarbs = Math.round(
        data.reduce((sum, log) => sum + log.carbs_g, 0) / data.length
      );
      const avgFats = Math.round(
        data.reduce((sum, log) => sum + log.fats_g, 0) / data.length
      );

      setNutritionStats({
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFats,
        totalMeals: data.length
      });
    }
  }

  async function fetchSleepStats(uid: string, startDate: string) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', uid)
      .gte('date', startDate);

    if (error) throw error;

    if (data && data.length > 0) {
      const avgDuration = data.reduce((sum, log) => sum + log.duration_min, 0) / data.length;
      const avgQuality = data.reduce((sum, log) => sum + (log.quality || 0), 0) / data.length;

      setSleepStats({
        avgHours: Math.floor(avgDuration / 60),
        avgMinutes: Math.round(avgDuration % 60),
        avgQuality: avgQuality.toFixed(1),
        totalNights: data.length
      });
    }
  }

  async function fetchStreaks(uid: string) {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', uid)
      .eq('type', 'Overall Compliance')
      .maybeSingle();

    if (error) throw error;
    if (data) {
      setCurrentStreak(data.current_streak || 0);
      setLongestStreak(data.longest_streak || 0);
    }
  }

  // Calculate insights
  const avgCompliance = complianceData.length > 0
    ? Math.round(complianceData.reduce((sum, s) => sum + s.overall_score, 0) / complianceData.length)
    : 0;

  const complianceTrend = complianceData.length >= 2
    ? complianceData[complianceData.length - 1].overall_score - complianceData[0].overall_score
    : 0;

  const weightChange = weightData.length >= 2
    ? parseFloat(((weightData[weightData.length - 1].weight_kg - weightData[0].weight_kg) * 2.20462).toFixed(1))
    : 0;

  // Chart data
  const complianceChartData = complianceData.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overall: s.overall_score,
    nutrition: s.nutrition_score,
    workout: s.workout_score,
    sleep: s.sleep_score
  }));

  const weightChartData = weightData.map(w => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat((w.weight_kg * 2.20462).toFixed(1))
  }));

  const categoryAverages = complianceData.length > 0 ? [
    {
      name: 'Nutrition',
      value: Math.round(complianceData.reduce((sum, s) => sum + s.nutrition_score, 0) / complianceData.length),
      icon: '🍎'
    },
    {
      name: 'Workout',
      value: Math.round(complianceData.reduce((sum, s) => sum + s.workout_score, 0) / complianceData.length),
      icon: '💪'
    },
    {
      name: 'Hydration',
      value: Math.round(complianceData.reduce((sum, s) => sum + (s.hydration_score || 100), 0) / complianceData.length),
      icon: '💧'
    },
    {
      name: 'Sleep',
      value: Math.round(complianceData.reduce((sum, s) => sum + s.sleep_score, 0) / complianceData.length),
      icon: '😴'
    },
    {
      name: 'Fasting',
      value: Math.round(complianceData.reduce((sum, s) => sum + s.fasting_score, 0) / complianceData.length),
      icon: '⏰'
    },
    {
      name: 'Meds',
      value: Math.round(complianceData.reduce((sum, s) => sum + s.meds_score, 0) / complianceData.length),
      icon: '💊'
    }
  ] : [];

  const COLORS = ['#22c55e', '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
              <h1 className="text-2xl font-bold">Progress Reports</h1>
              <p className="text-sm text-muted-foreground">
                Track your journey and celebrate wins
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Avg Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold">{avgCompliance}%</div>
                  {complianceTrend !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${complianceTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {complianceTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{Math.abs(complianceTrend)}% vs start</span>
                    </div>
                  )}
                </div>
                <Badge variant={avgCompliance >= 80 ? 'default' : avgCompliance >= 60 ? 'secondary' : 'destructive'}>
                  {avgCompliance >= 80 ? 'Excellent' : avgCompliance >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">
                Longest: {longestStreak} days 🏆
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Weight Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {weightChange > 0 ? '+' : ''}{weightChange} lbs
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Since {timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : '90'} days ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{complianceData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((complianceData.length / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90)) * 100)}% consistency
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Compliance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {complianceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={complianceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="overall" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        name="Overall Score"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No data yet for this time period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Averages</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryAverages.length > 0 ? (
                    <div className="space-y-3">
                      {categoryAverages.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <span>{cat.icon}</span>
                              {cat.name}
                            </span>
                            <span className="text-sm font-bold">{cat.value}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                cat.value >= 80 ? 'bg-green-500' : cat.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${cat.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentStreak >= 7 && (
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-sm">Week Warrior</span>
                        </div>
                        <p className="text-xs text-muted-foreground">7+ day streak!</p>
                      </div>
                    )}
                    {currentStreak >= 30 && (
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-sm">Month Master</span>
                        </div>
                        <p className="text-xs text-muted-foreground">30+ day streak!</p>
                      </div>
                    )}
                    {workoutStats && workoutStats.totalWorkouts >= 12 && (
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-sm">Consistent Lifter</span>
                        </div>
                        <p className="text-xs text-muted-foreground">12+ workouts completed</p>
                      </div>
                    )}
                    {avgCompliance >= 80 && (
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm">Excellence Standard</span>
                        </div>
                        <p className="text-xs text-muted-foreground">80%+ average compliance</p>
                      </div>
                    )}
                    {currentStreak === 0 && avgCompliance < 60 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-2">Keep going!</p>
                        <p className="text-xs text-muted-foreground">Achievements unlock as you progress</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Category Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {complianceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={complianceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nutrition" stroke="#22c55e" strokeWidth={2} name="Nutrition" />
                      <Line type="monotone" dataKey="workout" stroke="#3b82f6" strokeWidth={2} name="Workout" />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep" />
                      <Line type="monotone" dataKey="overall" stroke="#f59e0b" strokeWidth={3} name="Overall" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No compliance data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workouts Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{workoutStats?.totalWorkouts || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workoutStats?.avgDuration || 0} min avg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(workoutStats?.totalVolume || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">lbs lifted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Sets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{workoutStats?.totalSets || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workoutStats?.totalReps || 0} total reps
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {weightChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weightChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.2}
                        name="Weight (lbs)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No weight data logged yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start logging your weight to see progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Average Daily Intake</CardTitle>
                </CardHeader>
                <CardContent>
                  {nutritionStats ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-secondary/20 rounded-lg">
                        <div className="text-4xl font-bold">{nutritionStats.avgCalories}</div>
                        <p className="text-sm text-muted-foreground">calories/day</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{nutritionStats.avgProtein}g</div>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                        <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{nutritionStats.avgCarbs}g</div>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{nutritionStats.avgFats}g</div>
                          <p className="text-xs text-muted-foreground">Fats</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          📊 {nutritionStats.totalMeals} meals logged
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No nutrition data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Macro Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {nutritionStats ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Protein', value: nutritionStats.avgProtein * 4 },
                            { name: 'Carbs', value: nutritionStats.avgCarbs * 4 },
                            { name: 'Fats', value: nutritionStats.avgFats * 9 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0, 1, 2].map((index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No macro data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recovery Tab */}
          <TabsContent value="recovery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {sleepStats ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-secondary/20 rounded-lg">
                        <div className="text-4xl font-bold">
                          {sleepStats.avgHours}h {sleepStats.avgMinutes}m
                        </div>
                        <p className="text-sm text-muted-foreground">average per night</p>
                      </div>
                      <div className="flex justify-around">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{sleepStats.avgQuality}</div>
                          <p className="text-xs text-muted-foreground">quality rating</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{sleepStats.totalNights}</div>
                          <p className="text-xs text-muted-foreground">nights logged</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No sleep data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recovery Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sleepStats && sleepStats.avgHours < 7 && (
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm font-medium">😴 Prioritize Sleep</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Aim for 7-9 hours. Quality sleep boosts recovery and performance.
                        </p>
                      </div>
                    )}
                    {sleepStats && parseFloat(sleepStats.avgQuality) < 3.5 && (
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium">💤 Improve Sleep Quality</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try: dark room, cool temp, no screens 1hr before bed.
                        </p>
                      </div>
                    )}
                    {workoutStats && workoutStats.totalWorkouts >= 4 && (
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium">💪 Great Consistency!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You're training regularly. Make sure to take rest days!
                        </p>
                      </div>
                    )}
                    {(!sleepStats || sleepStats.avgHours >= 7) && (!workoutStats || workoutStats.totalWorkouts < 4) && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Keep tracking to get personalized recovery insights!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
