import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Flame,
  Dumbbell,
  Apple,
  Moon,
  Droplet,
  Calendar,
  Download,
  Share2,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

export default function Reports() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  
  // Analytics data
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<any[]>([]);
  
  // Summary stats
  const [stats, setStats] = useState({
    avgCompliance: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    avgSleep: 0,
    weeklyChange: 0,
    streak: 0
  });

  useEffect(() => {
    init();
  }, [timeframe]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadAnalytics(user.id);
  }

  async function loadAnalytics(uid: string) {
    try {
      const daysBack = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Load compliance scores
      const { data: compliance } = await supabase
        .from('compliance_scores')
        .select('*')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (compliance) {
        setComplianceData(compliance.map(c => ({
          date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: c.overall_score,
          nutrition: c.nutrition_score,
          workout: c.workout_score,
          sleep: c.sleep_score,
          hydration: c.hydration_score || 0
        })));

        // Calculate average
        const avg = compliance.reduce((sum, c) => sum + c.overall_score, 0) / compliance.length;
        setStats(prev => ({ ...prev, avgCompliance: Math.round(avg) }));
      }

      // Load nutrition data
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('date, calories, protein_g, carbs_g, fats_g')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (foodLogs) {
        // Aggregate by date
        const nutritionByDate = foodLogs.reduce((acc: any, log) => {
          if (!acc[log.date]) {
            acc[log.date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
          }
          acc[log.date].calories += log.calories || 0;
          acc[log.date].protein += log.protein_g || 0;
          acc[log.date].carbs += log.carbs_g || 0;
          acc[log.date].fats += log.fats_g || 0;
          return acc;
        }, {});

        setNutritionData(Object.entries(nutritionByDate).map(([date, data]: [string, any]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...data
        })));

        const totalCals = Object.values(nutritionByDate).reduce((sum: number, d: any) => sum + d.calories, 0);
        setStats(prev => ({ ...prev, totalCalories: Math.round(totalCals) }));
      }

      // Load workout data
      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('date, duration_min, total_volume_lbs, completed_at')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .not('completed_at', 'is', null)
        .order('date', { ascending: true });

      if (workouts) {
        setWorkoutData(workouts.map(w => ({
          date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          duration: w.duration_min || 0,
          volume: w.total_volume_lbs || 0
        })));
        setStats(prev => ({ ...prev, totalWorkouts: workouts.length }));
      }

      // Load sleep data
      const { data: sleep } = await supabase
        .from('sleep_logs')
        .select('date, duration_min, quality')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (sleep) {
        setSleepData(sleep.map(s => ({
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hours: (s.duration_min / 60).toFixed(1),
          quality: s.quality || 0
        })));

        const avgSleepHours = sleep.reduce((sum, s) => sum + s.duration_min, 0) / sleep.length / 60;
        setStats(prev => ({ ...prev, avgSleep: parseFloat(avgSleepHours.toFixed(1)) }));
      }

      // Load body metrics
      const { data: weights } = await supabase
        .from('weight_logs')
        .select('date, weight_kg')
        .eq('user_id', uid)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (weights && weights.length > 1) {
        setBodyMetrics(weights.map(w => ({
          date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: w.weight_kg
        })));

        const weightChange = weights[weights.length - 1].weight_kg - weights[0].weight_kg;
        setStats(prev => ({ ...prev, weeklyChange: parseFloat(weightChange.toFixed(1)) }));
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-lg p-3 shadow-xl">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Radar chart data for health balance
  const radarData = complianceData.length > 0 ? [
    {
      category: 'Nutrition',
      value: complianceData[complianceData.length - 1]?.nutrition || 0,
      fullMark: 100
    },
    {
      category: 'Workout',
      value: complianceData[complianceData.length - 1]?.workout || 0,
      fullMark: 100
    },
    {
      category: 'Sleep',
      value: complianceData[complianceData.length - 1]?.sleep || 0,
      fullMark: 100
    },
    {
      category: 'Hydration',
      value: complianceData[complianceData.length - 1]?.hydration || 0,
      fullMark: 100
    }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <BarChart3 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background pb-24">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Analytics
                </h1>
                <p className="text-sm text-muted-foreground">Your health insights</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="capitalize"
              >
                {tf === 'week' ? '7 Days' : tf === 'month' ? '30 Days' : 'Year'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.3), transparent 50%)',
                  'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.3), transparent 50%)',
                  'radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.3), transparent 50%)',
                  'radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.3), transparent 50%)',
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            <CardContent className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge className="mb-2 bg-purple-500">Overall Health Score</Badge>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold">{stats.avgCompliance}</span>
                    <span className="text-2xl text-muted-foreground">/ 100</span>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl"
                >
                  <Award className="w-16 h-16 text-white" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.streak}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>

                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Workouts</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>

                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Calories</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalCalories.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">consumed</p>
                </div>

                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Avg Sleep</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgSleep}h</p>
                  <p className="text-xs text-muted-foreground">per night</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-secondary/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-background">
              <Apple className="w-4 h-4 mr-2" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="fitness" className="data-[state=active]:bg-background">
              <Dumbbell className="w-4 h-4 mr-2" />
              Fitness
            </TabsTrigger>
            <TabsTrigger value="recovery" className="data-[state=active]:bg-background">
              <Moon className="w-4 h-4 mr-2" />
              Recovery
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Compliance Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-purple-500" />
                        Compliance Score Trend
                      </h3>
                      <p className="text-sm text-muted-foreground">Your daily health score over time</p>
                    </div>
                    <Badge variant={stats.avgCompliance >= 80 ? 'default' : 'secondary'}>
                      {stats.avgCompliance >= 80 ? 'Excellent' : stats.avgCompliance >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={complianceData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fill="url(#scoreGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Balance Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Health Balance (Today)
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#333" opacity={0.2} />
                      <PolarAngleAxis dataKey="category" stroke="#888" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#888" />
                      <Radar 
                        name="Score" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {radarData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm font-medium">{item.category}</span>
                        <Badge variant={item.value >= 80 ? 'default' : 'secondary'}>
                          {item.value}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Body Metrics */}
            {bodyMetrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Weight Progress
                        </h3>
                        <p className="text-sm text-muted-foreground">Track your body composition</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold flex items-center gap-2">
                          {stats.weeklyChange > 0 ? (
                            <TrendingUp className="w-5 h-5 text-red-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-green-500" />
                          )}
                          {Math.abs(stats.weeklyChange)}kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.weeklyChange > 0 ? 'gained' : 'lost'}
                        </p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={bodyMetrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            {/* Calorie Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Daily Calorie Intake
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="calories" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Macro Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    Macronutrient Breakdown
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} name="Protein (g)" />
                      <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} name="Carbs (g)" />
                      <Line type="monotone" dataKey="fats" stroke="#f59e0b" strokeWidth={2} name="Fats (g)" />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            {/* Workout Volume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    Workout Volume
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Volume (lbs)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Workout Duration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Workout Duration
                  </h3>

                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={workoutData}>
                      <defs>
                        <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fill="url(#durationGradient)"
                        name="Minutes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Recovery Tab */}
          <TabsContent value="recovery" className="space-y-6">
            {/* Sleep Duration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    Sleep Duration
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#a855f7" 
                        strokeWidth={3}
                        dot={{ fill: '#a855f7', r: 4 }}
                        name="Hours"
                      />
                      {/* Reference line for 8 hours */}
                      <Line 
                        type="monotone" 
                        dataKey={() => 8} 
                        stroke="#888" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Goal (8h)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-center">
                      💤 Average: <strong>{stats.avgSleep}h</strong> per night
                      {stats.avgSleep >= 7 ? ' - Excellent!' : ' - Try to get more rest'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sleep Quality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Sleep Quality Score
                  </h3>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} domain={[0, 5]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quality" fill="#eab308" radius={[8, 8, 0, 0]} name="Quality (1-5)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                AI Insights & Recommendations
              </h3>

              <div className="space-y-3">
                {stats.avgCompliance >= 80 && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Excellent consistency!</strong> You're maintaining an {stats.avgCompliance}% compliance rate. 
                        Keep up the great work! 🎉
                      </span>
                    </p>
                  </div>
                )}

                {stats.avgSleep < 7 && (
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm flex items-start gap-2">
                      <Moon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Sleep opportunity:</strong> You're averaging {stats.avgSleep}h per night. 
                        Aim for 7-9 hours to optimize recovery and performance. 💤
                      </span>
                    </p>
                  </div>
                )}

                {stats.totalWorkouts < 3 && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm flex items-start gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Movement matters:</strong> You've completed {stats.totalWorkouts} workouts this period. 
                        Try to hit 3-4 workouts per week for optimal results! 💪
                      </span>
                    </p>
                  </div>
                )}

                {stats.weeklyChange > 1 && (
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-sm flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Weight change detected:</strong> You've gained {stats.weeklyChange}kg. 
                        Make sure this aligns with your goals! 📊
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
