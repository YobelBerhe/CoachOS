import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { voiceService } from '@/services/voiceService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import { QuickActions } from '@/components/dashboard/QuickActions';
import ProfileCompletionReminder from '@/components/ProfileCompletionReminder';
import {
  LogOut,
  Flame,
  TrendingUp,
  Apple,
  Dumbbell,
  Moon,
  Droplet,
  Pill,
  ChevronRight,
  Sparkles,
  DollarSign,
  Target,
  Trophy,
  Users,
  Brain,
  Zap,
  X,
  Leaf,
  Camera,
  CheckCircle2,
  Repeat,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  
  // Stats
  const [nutrition, setNutrition] = useState({ consumed: 0, target: 2000, percentage: 0 });
  const [workout, setWorkout] = useState({ completed: false, duration: 0 });
  const [sleep, setSleep] = useState({ hours: 0, quality: 0 });
  const [hydration, setHydration] = useState({ consumed: 0, target: 64, percentage: 0 });
  const [medications, setMedications] = useState({ taken: 0, total: 0, percentage: 0 });

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    init();
  }, []);

  // Voice greeting removed - was causing freezing on dashboard load
  // Users can enable it manually from voice settings if needed

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadAllData(user.id);
  }

  async function loadAllData(uid: string) {
    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_completed')
        .eq('id', uid)
        .maybeSingle();
      
      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0]);
      }
      
      setProfileComplete(profile?.profile_completed ?? false);

      // Load streak
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', uid)
        .eq('type', 'compliance')
        .maybeSingle();
      
      if (streakData) setStreak(streakData.current_streak);

      // Load nutrition
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', uid)
        .eq('date', todayDate);

      const { data: targets } = await supabase
        .from('daily_targets')
        .select('calories')
        .eq('user_id', uid)
        .eq('date', todayDate)
        .maybeSingle();

      const totalCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const calorieTarget = targets?.calories || 2000;
      setNutrition({
        consumed: totalCalories,
        target: calorieTarget,
        percentage: Math.min((totalCalories / calorieTarget) * 100, 100)
      });

      // Load workout
      const { data: workoutData } = await supabase
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', uid)
        .eq('date', todayDate)
        .maybeSingle();

      setWorkout({
        completed: workoutData?.completed_at ? true : false,
        duration: 0
      });

      // Load sleep
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('duration_min, quality')
        .eq('user_id', uid)
        .eq('date', todayDate)
        .maybeSingle();

      setSleep({
        hours: sleepData ? sleepData.duration_min / 60 : 0,
        quality: sleepData?.quality || 0
      });

      // Load hydration
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount_oz')
        .eq('user_id', uid)
        .eq('date', todayDate);

      const totalWater = waterLogs?.reduce((sum, log) => sum + log.amount_oz, 0) || 0;
      setHydration({
        consumed: totalWater,
        target: 64,
        percentage: Math.min((totalWater / 64) * 100, 100)
      });

      // Load medications
      const { data: meds } = await supabase
        .from('medications')
        .select('id')
        .eq('user_id', uid)
        .eq('is_active', true);

      const { data: medLogs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', uid)
        .eq('date', todayDate)
        .not('taken_at', 'is', null);

      setMedications({
        taken: medLogs?.length || 0,
        total: meds?.length || 0,
        percentage: meds?.length ? ((medLogs?.length || 0) / meds.length) * 100 : 100
      });

      // Calculate overall score
      const scores = [
        nutrition.percentage,
        workout.completed ? 100 : 0,
        sleep.hours >= 7 ? 100 : (sleep.hours / 7) * 100,
        hydration.percentage,
        medications.percentage
      ];
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      setOverallScore(Math.round(avgScore));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Animated health ring component
  const HealthRing = ({ percentage, color, size = 120, strokeWidth = 12 }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background pb-24">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              >
                Welcome back, {userName}! 👋
              </motion.h1>
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/creator-dashboard')}
                className="gap-2 hidden sm:flex"
              >
                <DollarSign className="w-4 h-4" />
                Creator
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/auth');
                }}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Streak & Score */}
          <div className="flex items-center gap-3 mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{streak} day streak</span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
              className={`px-4 py-2 rounded-full font-semibold ${
                overallScore >= 80
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600'
                  : overallScore >= 60
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-600'
                  : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 text-red-600'
              }`}
            >
              {overallScore}% Compliance
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Completion Banner */}
        {!profileComplete && showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-primary/50 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex-shrink-0"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              🎯 Complete Your Health Profile
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Unlock AI-powered meal plans, health insights, and personalized recommendations
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowBanner(false)}
                            className="flex-shrink-0 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="font-medium">Profile Completion</span>
                            <span className="text-muted-foreground">35%</span>
                          </div>
                          <Progress value={35} className="h-2" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {[
                            { icon: Brain, label: 'AI Recommendations', locked: true },
                            { icon: Pill, label: 'Med Reminders', locked: true },
                            { icon: Sparkles, label: 'Smart Insights', locked: true }
                          ].map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-2 p-3 rounded-lg bg-background/50 backdrop-blur"
                            >
                              <feature.icon className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium">{feature.label}</span>
                              {feature.locked && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  🔒 Locked
                                </Badge>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => navigate('/profile-setup')}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                            size="lg"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Complete Setup (5 min)
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowBanner(false)}
                            className="sm:w-auto"
                          >
                            Remind Me Later
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Health Rings Section - Apple Health Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Today's Activity</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reports')}
                  className="gap-1"
                >
                  Details
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Three Rings Display */}
              <div className="flex justify-around items-center py-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  className="relative"
                >
                  <HealthRing percentage={nutrition.percentage} color="#10b981" size={140} strokeWidth={14} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Flame className="w-6 h-6 text-green-500 mb-1" />
                    <span className="text-2xl font-bold">{Math.round(nutrition.percentage)}%</span>
                    <span className="text-xs text-muted-foreground">Nutrition</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.6 }}
                  className="relative"
                >
                  <HealthRing percentage={workout.completed ? 100 : 0} color="#3b82f6" size={140} strokeWidth={14} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-2xl font-bold">{workout.completed ? '✓' : '—'}</span>
                    <span className="text-xs text-muted-foreground">Workout</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.8 }}
                  className="relative"
                >
                  <HealthRing percentage={hydration.percentage} color="#06b6d4" size={140} strokeWidth={14} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Droplet className="w-6 h-6 text-cyan-500 mb-1" />
                    <span className="text-2xl font-bold">{Math.round(hydration.percentage)}%</span>
                    <span className="text-xs text-muted-foreground">Hydration</span>
                  </div>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{nutrition.consumed}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{workout.duration}min</p>
                  <p className="text-xs text-muted-foreground">Exercise</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-500">{hydration.consumed}oz</p>
                  <p className="text-xs text-muted-foreground">Water</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SmartRecommendations userId={userId} />
        </motion.div>

        {/* Secondary Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Sleep Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/sleep')}>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Moon className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sleep</h3>
                    <p className="text-sm text-muted-foreground">Last night</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{sleep.hours.toFixed(1)}h</span>
                  {sleep.hours >= 7 ? (
                    <Badge className="bg-green-500">Optimal</Badge>
                  ) : (
                    <Badge variant="secondary">Below goal</Badge>
                  )}
                </div>
                <Progress value={(sleep.hours / 8) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Medications Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/medications')}>
            <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Pill className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Medications</h3>
                    <p className="text-sm text-muted-foreground">Today's adherence</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{medications.taken}/{medications.total}</span>
                  {medications.percentage >= 80 ? (
                    <Badge className="bg-green-500">On track</Badge>
                  ) : (
                    <Badge variant="destructive">Missed</Badge>
                  )}
                </div>
                <Progress value={medications.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Food Waste Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card 
            className="border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow overflow-hidden"
            onClick={() => navigate('/food-waste')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-green-500">NEW</Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2">🌍 Food Waste Tracker</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save money, save the planet
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <p className="text-xs text-muted-foreground mb-1">Money Saved</p>
                  <p className="text-lg font-bold text-green-600">$0</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <p className="text-xs text-muted-foreground mb-1">CO2 Saved</p>
                  <p className="text-lg font-bold text-blue-600">0kg</p>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Scanner Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card 
            className="border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow overflow-hidden"
            onClick={() => navigate('/menu-scanner')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">WORLD-FIRST</Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2">🍽️ Menu Decoder AI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan any restaurant menu, get instant health analysis
              </p>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>AI-powered health scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Smart modification suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Better alternatives instantly</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                Scan Menu Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meal Swap Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card 
            className="border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow overflow-hidden"
            onClick={() => navigate('/meal-swap')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Repeat className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500">COMMUNITY</Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2">🤝 Meal Swap</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share meals, reduce waste, build community
              </p>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>Trade meal prep with neighbors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <span>Prevent food waste together</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Build community & earn credits</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                Browse Meals
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/eat')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Apple className="w-6 h-6 text-green-500" />
              </div>
              <p className="font-semibold text-sm">Log Food</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/train')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6 text-blue-500" />
              </div>
              <p className="font-semibold text-sm">Workout</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/achievements')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="font-semibold text-sm">Achievements</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/reports')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <p className="font-semibold text-sm">Progress</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/ai-coach')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <p className="font-semibold text-sm">AI Coach</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/social')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <p className="font-semibold text-sm">Community</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <QuickActions userId={userId} />
      
      {/* Profile Completion Reminder Popup */}
      <ProfileCompletionReminder />
    </div>
  );
}
