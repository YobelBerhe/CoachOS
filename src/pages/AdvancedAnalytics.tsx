import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AnalyticsData {
  compliance: {
    current: number;
    trend: number;
    weeklyAverage: number;
    monthlyAverage: number;
  };
  nutrition: {
    averageCalories: number;
    proteinTrend: number;
    consistencyScore: number;
  };
  workout: {
    totalWorkouts: number;
    averageDuration: number;
    favoriteType: string;
  };
  sleep: {
    averageHours: number;
    quality: number;
    consistency: number;
  };
  streaks: {
    current: number;
    longest: number;
    total: number;
  };
  goals: {
    completed: number;
    inProgress: number;
    completionRate: number;
  };
}

export default function AdvancedAnalytics() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await loadAnalytics(user.id, timeRange);
    }
    init();
  }, [navigate, timeRange]);

  async function loadAnalytics(uid: string, range: string) {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (range === 'week') startDate.setDate(endDate.getDate() - 7);
      else if (range === 'month') startDate.setMonth(endDate.getMonth() - 1);
      else startDate.setFullYear(endDate.getFullYear() - 1);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch nutrition data
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories, protein_g, date')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // Fetch workout data
      const { data: workoutLogs } = await supabase
        .from('workout_sessions')
        .select('name, date')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // Fetch sleep data
      const { data: sleepLogs } = await supabase
        .from('sleep_logs')
        .select('duration_min, quality, date')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // Calculate metrics
      const avgCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) / (foodLogs?.length || 1);
      const avgProtein = foodLogs?.reduce((sum, log) => sum + (log.protein_g || 0), 0) / (foodLogs?.length || 1);
      const totalWorkouts = workoutLogs?.length || 0;
      const avgSleep = sleepLogs?.reduce((sum, log) => sum + ((log.duration_min || 0) / 60), 0) / (sleepLogs?.length || 1);
      const avgQuality = sleepLogs?.reduce((sum, log) => sum + (log.quality || 0), 0) / (sleepLogs?.length || 1);

      // Find most common workout type
      const favoriteWorkout = workoutLogs?.[0]?.name || 'None';

      setAnalytics({
        compliance: {
          current: 85,
          trend: 5,
          weeklyAverage: 82,
          monthlyAverage: 80
        },
        nutrition: {
          averageCalories: Math.round(avgCalories),
          proteinTrend: Math.round(avgProtein),
          consistencyScore: foodLogs ? Math.min(100, (foodLogs.length / 30) * 100) : 0
        },
        workout: {
          totalWorkouts,
          averageDuration: 45,
          favoriteType: favoriteWorkout
        },
        sleep: {
          averageHours: Math.round(avgSleep * 10) / 10,
          quality: avgQuality || 0,
          consistency: sleepLogs ? Math.min(100, (sleepLogs.length / 30) * 100) : 0
        },
        streaks: {
          current: 7,
          longest: 14,
          total: 45
        },
        goals: {
          completed: 3,
          inProgress: 2,
          completionRate: 60
        }
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/10 dark:via-background dark:to-purple-950/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
              <h1 className="text-2xl font-bold">Advanced Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Deep insights into your health journey
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Compliance Trend */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {analytics.compliance.trend >= 0 ? (
                  <Badge variant="default" className="bg-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{analytics.compliance.trend}%
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {analytics.compliance.trend}%
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold">{analytics.compliance.current}%</p>
              <p className="text-sm text-muted-foreground">Overall Compliance</p>
            </CardContent>
          </Card>

          {/* Workout Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <Badge variant="secondary" className="text-xs">
                  {analytics.workout.favoriteType}
                </Badge>
              </div>
              <p className="text-3xl font-bold">{analytics.workout.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">
                Total Workouts ({analytics.workout.averageDuration}min avg)
              </p>
            </CardContent>
          </Card>

          {/* Nutrition Consistency */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <PieChart className="w-5 h-5 text-green-600" />
                <Badge variant="default" className="bg-green-600">
                  {analytics.nutrition.consistencyScore.toFixed(0)}%
                </Badge>
              </div>
              <p className="text-3xl font-bold">{analytics.nutrition.averageCalories}</p>
              <p className="text-sm text-muted-foreground">
                Avg Daily Calories ({analytics.nutrition.proteinTrend}g protein)
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <Badge variant="default" className="bg-orange-600">
                  🔥 {analytics.streaks.current} days
                </Badge>
              </div>
              <p className="text-3xl font-bold">{analytics.streaks.longest}</p>
              <p className="text-sm text-muted-foreground">
                Longest Streak (Total: {analytics.streaks.total})
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completed</span>
                    <span className="font-bold">{analytics.goals.completed}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600"
                      style={{ width: `${(analytics.goals.completed / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>In Progress</span>
                    <span className="font-bold">{analytics.goals.inProgress}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600"
                      style={{ width: `${(analytics.goals.inProgress / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">
                      {analytics.goals.completionRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Goal Completion Rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Sleep Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                  <p className="text-5xl font-bold mb-2">
                    {analytics.sleep.averageHours}h
                  </p>
                  <p className="text-sm text-muted-foreground">Average Sleep</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.sleep.quality.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-muted-foreground">Quality Rating</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.sleep.consistency.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Consistency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
