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
  Sparkles,
  Sunrise,
  BookOpen,
  ListTodo,
  Award,
  Zap,
  Activity,
  Search,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userData, setUserData] = useState<any>(null);
  const [todayData, setTodayData] = useState<any>({
    // Sleep
    sleepHours: 0,
    sleepQuality: 0,
    
    // Morning Journal
    morningJournalDone: false,
    morningMood: 0,
    
    // Tasks
    tasksCompleted: 0,
    tasksTotal: 0,
    mitsCompleted: 0,
    mitsTotal: 0,
    
    // Workout
    workoutDone: false,
    workoutMinutes: 0,
    
    // Nutrition
    calories: 0,
    caloriesGoal: 2000,
    protein: 0,
    proteinGoal: 150,
    
    // Water
    water: 0,
    waterGoal: 64,
    
    // Evening
    eveningReflectionDone: false,
    eveningMood: 0,
    
    // Streaks
    sleepStreak: 0,
    workoutStreak: 0,
    journalStreak: 0,
    taskStreak: 0
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

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setUserData(profile);

      const today = new Date().toISOString().split('T')[0];

      // Load sleep data
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Load morning journal
      const { data: morningJournal } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'morning')
        .maybeSingle();

      // Load evening reflection
      const { data: eveningReflection } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'evening')
        .maybeSingle();

      // Load food logs
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories, protein_g')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const totalProtein = foodLogs?.reduce((sum, log) => sum + (log.protein_g || 0), 0) || 0;

      // Calculate streaks
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
        // Sleep
        sleepHours: sleepData ? sleepData.duration_min / 60 : 0,
        sleepQuality: sleepData?.quality || 0,
        
        // Morning Journal
        morningJournalDone: !!morningJournal,
        morningMood: morningJournal?.mood_rating || 0,
        
        // Tasks (mock data for now)
        tasksCompleted: 0,
        tasksTotal: 0,
        mitsCompleted: 0,
        mitsTotal: 0,
        
        // Workout (mock data for now)
        workoutDone: false,
        workoutMinutes: 0,
        
        // Nutrition
        calories: totalCalories,
        caloriesGoal: 2000,
        protein: totalProtein,
        proteinGoal: 150,
        
        // Water (mock data)
        water: 48,
        waterGoal: 64,
        
        // Evening
        eveningReflectionDone: !!eveningReflection,
        eveningMood: eveningReflection?.mood_rating || 0,
        
        // Streaks
        sleepStreak: calculateStreak(allSleep || []),
        journalStreak: calculateStreak(allJournals || []),
        workoutStreak: 0,
        taskStreak: 0
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStreak(data: any[]) {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const itemDate = new Date(data[i].entry_date || data[i].date);
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
    if (todayData.mitsCompleted === todayData.mitsTotal && todayData.mitsTotal > 0) completed++;
    if (todayData.workoutDone) completed++;
    if (todayData.calories >= todayData.caloriesGoal * 0.8) completed++;
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
      time: '9:00 AM',
      title: 'Deep Work',
      icon: Target,
      status: todayData.mitsCompleted > 0 ? 'active' : 'upcoming',
      action: () => navigate('/tasks'),
      items: [
        { label: `MITs: ${todayData.mitsCompleted}/${todayData.mitsTotal}`, done: todayData.mitsCompleted === todayData.mitsTotal },
        { label: 'Focus mode', done: false }
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
      time: '6:00 PM',
      title: 'Dinner & Family',
      icon: Heart,
      status: 'upcoming',
      action: () => navigate('/eat'),
      items: [
        { label: 'Dinner', done: false },
        { label: 'Family time', done: false }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitFlow</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workouts, meals, tasks..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5 text-gray-700" />
              </Button>
              <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate('/profile')}>
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {userData?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {userData?.full_name?.split(' ')[0] || 'Champion'}!
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Today's Progress */}
        <Card className="border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Today's Progress</h2>
                <p className="text-sm text-gray-600">
                  {getCompletionRate()}% of your daily goals complete
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - getCompletionRate() / 100)}`}
                      className="text-blue-600 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-gray-900">
                    {getCompletionRate()}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sleep */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Sleep</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {todayData.sleepHours.toFixed(1)}h
                  </span>
                </div>
                <Progress 
                  value={(todayData.sleepHours / 8) * 100} 
                  className="h-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {todayData.sleepHours >= 7 ? '✓ Goal met' : `${(8 - todayData.sleepHours).toFixed(1)}h short`}
                </p>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Tasks</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {todayData.tasksCompleted}/{todayData.tasksTotal}
                  </span>
                </div>
                <Progress 
                  value={todayData.tasksTotal > 0 ? (todayData.tasksCompleted / todayData.tasksTotal) * 100 : 0} 
                  className="h-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {todayData.mitsCompleted === todayData.mitsTotal && todayData.mitsTotal > 0 ? '✓ All MITs done!' : `${todayData.mitsTotal - todayData.mitsCompleted} MITs left`}
                </p>
              </div>

              {/* Workout */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Workout</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {todayData.workoutMinutes}min
                  </span>
                </div>
                <Progress 
                  value={todayData.workoutDone ? 100 : 0} 
                  className="h-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {todayData.workoutDone ? '✓ Workout complete' : 'No workout yet'}
                </p>
              </div>

              {/* Nutrition */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Calories</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {todayData.calories}/{todayData.caloriesGoal}
                  </span>
                </div>
                <Progress 
                  value={(todayData.calories / todayData.caloriesGoal) * 100} 
                  className="h-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {todayData.caloriesGoal - todayData.calories} cal remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { 
                icon: BookOpen, 
                label: todayData.morningJournalDone ? 'View Journal' : 'Morning Journal', 
                color: 'bg-purple-50 text-purple-700 border-purple-200',
                done: todayData.morningJournalDone,
                path: '/morning-journal' 
              },
              { 
                icon: ListTodo, 
                label: 'My Tasks', 
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                badge: `${todayData.tasksTotal - todayData.tasksCompleted}`,
                path: '/tasks' 
              },
              { 
                icon: Dumbbell, 
                label: todayData.workoutDone ? 'View Workout' : 'Log Workout', 
                color: 'bg-red-50 text-red-700 border-red-200',
                done: todayData.workoutDone,
                path: '/train' 
              },
              { 
                icon: Coffee, 
                label: 'Log Meal', 
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                path: '/eat' 
              },
              { 
                icon: Moon, 
                label: todayData.eveningReflectionDone ? 'View Reflection' : 'Evening Reflection', 
                color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                done: todayData.eveningReflectionDone,
                path: '/evening-reflection' 
              }
            ].map((action, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`border-2 shadow-sm cursor-pointer hover:shadow-md transition-all ${action.color} relative`}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-4">
                    {action.done && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    {action.badge && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        {action.badge}
                      </Badge>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mb-3">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold">{action.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Day Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Day</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View Schedule <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {dayTimeline.map((slot, idx) => {
              const Icon = slot.icon;
              return (
                <Card 
                  key={idx}
                  className={`flex-shrink-0 w-80 border cursor-pointer hover:shadow-md transition-all ${
                    slot.status === 'active' 
                      ? 'border-blue-500 shadow-md bg-blue-50' 
                      : slot.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  onClick={slot.action}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">{slot.time}</span>
                      {slot.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {slot.status === 'active' && (
                        <Badge className="bg-blue-600">Now</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        slot.status === 'completed' ? 'bg-green-100' : 
                        slot.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          slot.status === 'completed' ? 'text-green-600' : 
                          slot.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{slot.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {slot.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.done ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={item.done ? 'line-through' : ''}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* MITs */}
            {todayData.mitsTotal > 0 && (
              <Card className="border-2 border-orange-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-bold text-gray-900">Today's MITs</h3>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">
                      {todayData.mitsCompleted}/{todayData.mitsTotal}
                    </Badge>
                  </div>
                  {todayData.mitsCompleted === todayData.mitsTotal && todayData.mitsTotal > 0 ? (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-900">All MITs Complete! 🎉</p>
                      <p className="text-sm text-green-700">The rest of your day is gravy!</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Target className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <p className="text-gray-600 mb-3">
                        {todayData.mitsTotal - todayData.mitsCompleted} MIT{todayData.mitsTotal - todayData.mitsCompleted > 1 ? 's' : ''} remaining
                      </p>
                      <Button onClick={() => navigate('/tasks')} className="bg-orange-600 hover:bg-orange-700">
                        View Tasks
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Streaks */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Your Streaks</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <Moon className="w-8 h-8 text-indigo-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{todayData.sleepStreak}</p>
                    <p className="text-sm text-gray-600">Sleep streak</p>
                    <p className="text-xs text-gray-500 mt-1">7+ hours</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{todayData.journalStreak}</p>
                    <p className="text-sm text-gray-600">Journal streak</p>
                    <p className="text-xs text-gray-500 mt-1">Daily entries</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <Dumbbell className="w-8 h-8 text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{todayData.workoutStreak}</p>
                    <p className="text-sm text-gray-600">Workout streak</p>
                    <p className="text-xs text-gray-500 mt-1">Consecutive days</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <Target className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{todayData.taskStreak}</p>
                    <p className="text-sm text-gray-600">Task streak</p>
                    <p className="text-xs text-gray-500 mt-1">All MITs done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Droplet className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{todayData.water}oz</p>
                  <p className="text-xs text-gray-600">Water today</p>
                  <Progress value={(todayData.water / todayData.waterGoal) * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{todayData.protein}g</p>
                  <p className="text-xs text-gray-600">Protein today</p>
                  <Progress value={(todayData.protein / todayData.proteinGoal) * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{todayData.workoutMinutes}</p>
                  <p className="text-xs text-gray-600">Active minutes</p>
                  <Progress value={Math.min((todayData.workoutMinutes / 30) * 100, 100)} className="h-1 mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Insights */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Today's Insights
                </h3>
                <div className="space-y-3">
                  {todayData.sleepHours >= 7 && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <p className="text-sm font-semibold text-green-900 mb-1">✓ Great Sleep!</p>
                      <p className="text-xs text-green-700">
                        {todayData.sleepHours.toFixed(1)}h - You're in the top 20% of sleepers
                      </p>
                    </div>
                  )}
                  {todayData.sleepHours < 7 && todayData.sleepHours > 0 && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                      <p className="text-sm font-semibold text-orange-900 mb-1">😴 More Sleep Needed</p>
                      <p className="text-xs text-orange-700">
                        Try going to bed 30 minutes earlier tonight
                      </p>
                    </div>
                  )}
                  {todayData.mitsTotal > 0 && todayData.mitsCompleted === 0 && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-sm font-semibold text-blue-900 mb-1">🎯 Focus Time</p>
                      <p className="text-xs text-blue-700">
                        Tackle your MITs now while willpower is high
                      </p>
                    </div>
                  )}
                  {!todayData.workoutDone && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-sm font-semibold text-red-900 mb-1">💪 Workout Reminder</p>
                      <p className="text-xs text-red-700">
                        Your afternoon workout is coming up
                      </p>
                    </div>
                  )}
                  {!todayData.morningJournalDone && new Date().getHours() < 10 && (
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <p className="text-sm font-semibold text-purple-900 mb-1">📝 Morning Journal</p>
                      <p className="text-xs text-purple-700">
                        Set your intentions for the day (5 minutes)
                      </p>
                    </div>
                  )}
                  {new Date().getHours() >= 20 && !todayData.eveningReflectionDone && (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="text-sm font-semibold text-indigo-900 mb-1">🌙 Evening Reflection</p>
                      <p className="text-xs text-indigo-700">
                        Time to reflect on your day and celebrate wins
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ Upcoming</h3>
                <div className="space-y-3">
                  {[
                    { time: '12:00 PM', task: 'Lunch break', icon: '🍽️' },
                    { time: '3:00 PM', task: 'Workout time', icon: '💪' },
                    { time: '6:00 PM', task: 'Dinner', icon: '🌮' },
                    { time: '9:00 PM', task: 'Evening reflection', icon: '🌙' }
                  ].filter(item => {
                    const hour = parseInt(item.time.split(':')[0]);
                    const isPM = item.time.includes('PM');
                    const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
                    return hour24 > new Date().getHours();
                  }).slice(0, 4).map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <span className="text-2xl">{reminder.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{reminder.task}</p>
                        <p className="text-xs text-gray-600">{reminder.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">💭 Daily Motivation</h3>
                <p className="text-sm text-gray-700 italic mb-2">
                  "The secret of getting ahead is getting started."
                </p>
                <p className="text-xs text-gray-600">- Mark Twain</p>
              </CardContent>
            </Card>

            {/* Explore */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Explore</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/eat')}
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Food Diary
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/shopping-list')}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Shopping List
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/meal-swap-marketplace')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Meal Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
