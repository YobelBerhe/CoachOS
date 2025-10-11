import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Droplet,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  Moon,
  Coffee,
  Dumbbell,
  Heart,
  ChevronRight,
  Bell,
  Settings,
  Sun,
  Sunrise,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userData, setUserData] = useState<any>(null);
  const [todayData, setTodayData] = useState<any>({
    sleepHours: 0,
    sleepQuality: 0,
    morningJournalDone: false,
    morningMood: 0,
    workoutDone: false,
    workoutMinutes: 0,
    calories: 0,
    caloriesGoal: 2000,
    protein: 0,
    proteinGoal: 150,
    water: 0,
    waterGoal: 64,
    eveningReflectionDone: false,
    eveningMood: 0,
    sleepStreak: 0,
    journalStreak: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(profile);

      const today = new Date().toISOString().split('T')[0];

      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('duration_min, quality, date')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const { data: morningJournal } = await supabase
        .from('journal_entries')
        .select('mood_rating, entry_date, entry_type')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'morning')
        .maybeSingle();

      const { data: eveningReflection } = await supabase
        .from('journal_entries')
        .select('mood_rating, entry_date, entry_type')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'evening')
        .maybeSingle();

      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories, protein_g')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const totalProtein = foodLogs?.reduce((sum, log) => sum + (log.protein_g || 0), 0) || 0;

      const { data: allSleep } = await supabase
        .from('sleep_logs')
        .select('date, duration_min')
        .eq('user_id', user.id)
        .gte('duration_min', 420)
        .order('date', { ascending: false })
        .limit(30);

      const { data: allJournals } = await supabase
        .from('journal_entries')
        .select('entry_date')
        .eq('user_id', user.id)
        .eq('entry_type', 'morning')
        .order('entry_date', { ascending: false })
        .limit(30);

      setTodayData({
        sleepHours: sleepData ? sleepData.duration_min / 60 : 0,
        sleepQuality: sleepData?.quality || 0,
        morningJournalDone: !!morningJournal,
        morningMood: morningJournal?.mood_rating || 0,
        workoutDone: false,
        workoutMinutes: 0,
        calories: totalCalories,
        caloriesGoal: 2000,
        protein: totalProtein,
        proteinGoal: 150,
        water: 0,
        waterGoal: 64,
        eveningReflectionDone: !!eveningReflection,
        eveningMood: eveningReflection?.mood_rating || 0,
        sleepStreak: calculateStreak(allSleep || [], 'date'),
        journalStreak: calculateStreak(allJournals || [], 'entry_date')
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStreak(data: any[], dateField: string) {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const itemDate = new Date(data[i][dateField]);
      itemDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getCompletionRate = () => {
    const total = 6;
    let completed = 0;
    
    if (todayData.sleepHours >= 7) completed++;
    if (todayData.morningJournalDone) completed++;
    if (todayData.workoutDone) completed++;
    if (todayData.calories >= todayData.caloriesGoal * 0.8) completed++;
    if (todayData.water >= todayData.waterGoal * 0.8) completed++;
    if (todayData.eveningReflectionDone) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const dayTimeline = [
    {
      time: '6:00 AM',
      title: 'Morning Routine',
      icon: Sunrise,
      status: todayData.morningJournalDone ? 'completed' : 'upcoming',
      action: () => navigate('/morning-journal'),
      items: [
        { label: 'Sleep logged', done: todayData.sleepHours > 0 },
        { label: 'Morning journal', done: todayData.morningJournalDone },
        { label: 'Hydration', done: todayData.water >= 16 }
      ]
    },
    {
      time: '12:00 PM',
      title: 'Lunch & Break',
      icon: Coffee,
      status: 'upcoming',
      action: () => navigate('/eat'),
      items: [
        { label: 'Meal logged', done: false },
        { label: 'Walk break', done: false }
      ]
    },
    {
      time: '3:00 PM',
      title: 'Workout',
      icon: Dumbbell,
      status: todayData.workoutDone ? 'completed' : 'upcoming',
      action: () => navigate('/train'),
      items: [
        { label: `${todayData.workoutMinutes} minutes`, done: todayData.workoutDone }
      ]
    },
    {
      time: '9:00 PM',
      title: 'Evening Routine',
      icon: Moon,
      status: todayData.eveningReflectionDone ? 'completed' : 'upcoming',
      action: () => navigate('/evening-reflection'),
      items: [
        { label: 'Reflection', done: todayData.eveningReflectionDone },
        { label: 'Reading', done: false },
        { label: 'Wind down', done: false }
      ]
    }
  ];

  const quickActions = [
    { icon: Coffee, label: 'Log Food', action: () => navigate('/eat'), color: 'orange' },
    { icon: Dumbbell, label: 'Workout', action: () => navigate('/train'), color: 'red' },
    { icon: Moon, label: 'Log Sleep', action: () => navigate('/sleep'), color: 'indigo' },
    { icon: BookOpen, label: 'Journal', action: () => navigate('/morning-journal'), color: 'purple' },
    { icon: Droplet, label: 'Water', action: () => toast({ title: 'Water logged!' }), color: 'cyan' },
    { icon: Target, label: 'Goals', action: () => navigate('/settings'), color: 'blue' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FitFlow</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate('/profile')}>
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {userData?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {getGreeting()}, {userData?.full_name?.split(' ')[0] || 'Champion'}!
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="border shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Today's Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {getCompletionRate()}% of your daily goals complete
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle
                      cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - getCompletionRate() / 100)}`}
                      className="text-primary transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold">{getCompletionRate()}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold">Sleep</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{todayData.sleepHours.toFixed(1)}h</span>
                </div>
                <Progress value={(todayData.sleepHours / 8) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {todayData.sleepHours >= 7 ? '✓ Goal met' : `${(8 - todayData.sleepHours).toFixed(1)}h short`}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold">Journal</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{todayData.morningJournalDone ? '✓' : '○'}</span>
                </div>
                <Progress value={todayData.morningJournalDone ? 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {todayData.morningJournalDone ? '✓ Completed' : 'Not started'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold">Nutrition</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{todayData.calories}</span>
                </div>
                <Progress value={(todayData.calories / todayData.caloriesGoal) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {todayData.caloriesGoal - todayData.calories} cal remaining
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold">Workout</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{todayData.workoutDone ? '✓' : '○'}</span>
                </div>
                <Progress value={todayData.workoutDone ? 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {todayData.workoutDone ? `${todayData.workoutMinutes} min` : 'Not started'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Streaks</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Sleep</p>
                      <p className="text-xs text-muted-foreground">7+ hours</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-700 text-lg px-3 py-1">
                    {todayData.sleepStreak} days
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Journal</p>
                      <p className="text-xs text-muted-foreground">Daily entries</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-700 text-lg px-3 py-1">
                    {todayData.journalStreak} days
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Day Timeline</h3>
              <div className="space-y-3">
                {dayTimeline.map((item, idx) => (
                  <motion.div
                    key={idx}
                    onClick={item.action}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      item.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                      'bg-muted/50 hover:bg-muted'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${
                          item.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-semibold">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
