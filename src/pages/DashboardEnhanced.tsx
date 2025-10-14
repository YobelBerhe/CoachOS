import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ThemedCard from '@/components/theme/ThemedCard';
import ThemedButton from '@/components/theme/ThemedButton';
import {
  Target,
  Flame,
  Moon,
  Coffee,
  Dumbbell,
  Heart,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Sparkles,
  Award,
  BookOpen,
  Droplet,
  Activity,
  ChevronRight,
  Star,
  Brain
} from 'lucide-react';

export default function DashboardEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTheme, currentArchetypeId, playSound } = useTheme();

  const [userData, setUserData] = useState<any>(null);
  const [todayData, setTodayData] = useState<any>({
    sleepHours: 0,
    sleepQuality: 0,
    morningJournalDone: false,
    morningMood: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    mitsCompleted: 0,
    mitsTotal: 0,
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
    workoutStreak: 0,
    journalStreak: 0,
    taskStreak: 0,
    xpEarned: 0,
    currentLevel: 1,
    xpToNextLevel: 1000
  });

  const [currentTimeBlock, setCurrentTimeBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
        sleepHours: sleepData ? sleepData.duration_min / 60 : 0,
        sleepQuality: sleepData?.quality || 0,
        morningJournalDone: !!morningJournal,
        morningMood: morningJournal?.mood_rating || 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        mitsCompleted: 0,
        mitsTotal: 0,
        workoutDone: false,
        workoutMinutes: 0,
        calories: totalCalories,
        caloriesGoal: 2000,
        protein: totalProtein,
        proteinGoal: 150,
        water: 48,
        waterGoal: 64,
        eveningReflectionDone: !!eveningReflection,
        eveningMood: eveningReflection?.mood_rating || 0,
        sleepStreak: calculateStreak(allSleep || []),
        journalStreak: calculateStreak(allJournals || []),
        workoutStreak: 0,
        taskStreak: 0,
        xpEarned: 450,
        currentLevel: 7,
        xpToNextLevel: 1000
      });

      // Load current time block
      loadCurrentTimeBlock();

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

  function loadCurrentTimeBlock() {
    const hour = currentTime.getHours();
    
    // Define time blocks based on archetype (this would be dynamic from DB)
    const timeBlocks = [
      { time: '06:00', title: 'Morning Routine', icon: '🌅', startHour: 6, endHour: 7 },
      { time: '07:00', title: 'Exercise', icon: '💪', startHour: 7, endHour: 8 },
      { time: '08:00', title: 'Breakfast', icon: '🍳', startHour: 8, endHour: 9 },
      { time: '09:00', title: 'Deep Work', icon: '🎯', startHour: 9, endHour: 12 },
      { time: '12:00', title: 'Lunch Break', icon: '🍽️', startHour: 12, endHour: 13 },
      { time: '14:00', title: 'Focus Session', icon: '💼', startHour: 14, endHour: 17 },
      { time: '18:00', title: 'Dinner', icon: '🌮', startHour: 18, endHour: 19 },
      { time: '20:00', title: 'Learning Time', icon: '📚', startHour: 20, endHour: 21 },
      { time: '21:00', title: 'Wind Down', icon: '🌙', startHour: 21, endHour: 22 }
    ];

    const current = timeBlocks.find(block => hour >= block.startHour && hour < block.endHour);
    setCurrentTimeBlock(current);
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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

  const getArchetypeInsight = () => {
    const insights: Record<string, string> = {
      'early-eagle': "🦅 You're in your power hour! Your focus peaks now - tackle your MIT.",
      'night-owl': "🦉 Morning energy is building. Start with light tasks before deep work.",
      'steady-tortoise': "🐢 Steady pace wins the race. One task at a time, Captain.",
      'sprint-rabbit': "🐰 High energy detected! Perfect time for a quick workout or sprint task.",
      'balanced-lion': "🦁 Your energy is balanced. Great time for strategic planning.",
      'lone-wolf': "🐺 Independent focus mode activated. Block distractions and dive deep.",
      'busy-bee': "🐝 Multiple tasks ahead. Prioritize and tackle them systematically.",
      'clever-fox': "🦊 Smart work over hard work. Find the most efficient path forward."
    };
    
    return insights[currentArchetypeId] || "Let's make today count, Captain!";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-transparent rounded-full"
          style={{ borderColor: currentTheme.colors.primary }}
        />
      </div>
    );
  }

  const completionRate = getCompletionRate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Animated Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className={`text-4xl ${currentTheme.fonts.heading} mb-2`}
              style={{ color: currentTheme.colors.text.primary }}
            >
              {getGreeting()}, {userData?.full_name?.split(' ')[0] || 'Captain'}! {currentTheme.emoji}
            </h1>
            <p className="flex items-center gap-2" style={{ color: currentTheme.colors.text.secondary }}>
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • 
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Level & XP */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-right"
          >
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
              <span className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                Level {todayData.currentLevel}
              </span>
            </div>
            <div className="w-48 h-2 bg-gray-700/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{ 
                  background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(todayData.xpEarned / todayData.xpToNextLevel) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
              {todayData.xpEarned}/{todayData.xpToNextLevel} XP
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Aurora AI Insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <ThemedCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <Brain className="w-full h-full" style={{ color: currentTheme.colors.primary }} />
          </div>
          <div className="relative p-4 flex items-start gap-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: currentTheme.colors.accent }} />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold mb-1" style={{ color: currentTheme.colors.text.primary }}>
                Aurora's Insight
              </h3>
              <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                {getArchetypeInsight()}
              </p>
            </div>
          </div>
        </ThemedCard>
      </motion.div>

      {/* Current Time Block - Hero */}
      {currentTimeBlock && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <ThemedCard className="overflow-hidden">
            <div 
              className="p-6"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.card.base}, ${currentTheme.colors.card.hover})`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{currentTimeBlock.icon}</span>
                  <div>
                    <Badge 
                      className="mb-2"
                      style={{
                        background: currentTheme.colors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      NOW
                    </Badge>
                    <h2 className={`text-2xl ${currentTheme.fonts.heading}`} style={{ color: currentTheme.colors.text.primary }}>
                      {currentTimeBlock.title}
                    </h2>
                    <p style={{ color: currentTheme.colors.text.secondary }}>
                      {currentTimeBlock.time} • Your current focus
                    </p>
                  </div>
                </div>
                <ThemedButton
                  onClick={() => {
                    playSound('success');
                    toast({ title: 'Block completed! 🎉', description: '+100 XP earned' });
                  }}
                >
                  ✓ Mark Complete
                </ThemedButton>
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Today's Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="border shadow-md overflow-hidden" style={{ borderColor: currentTheme.colors.card.border }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: currentTheme.colors.text.primary }}>
                  Today's Progress
                </h2>
                <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                  {completionRate}% of your daily goals complete
                </p>
              </div>
              <div className="relative inline-flex items-center justify-center w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="opacity-20"
                    style={{ color: currentTheme.colors.primary }}
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    style={{ color: currentTheme.colors.primary }}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - completionRate / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute text-xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                  {completionRate}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sleep */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                    >
                      <Moon className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <span className="text-sm font-semibold">Sleep</span>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.colors.text.muted }}>
                    {todayData.sleepHours.toFixed(1)}h
                  </span>
                </div>
                <Progress 
                  value={(todayData.sleepHours / 8) * 100} 
                  className="h-2"
                />
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
                  {todayData.sleepHours >= 7 ? '✓ Goal met' : `${(8 - todayData.sleepHours).toFixed(1)}h short`}
                </p>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.secondary}20` }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: currentTheme.colors.secondary }} />
                    </div>
                    <span className="text-sm font-semibold">Tasks</span>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.colors.text.muted }}>
                    {todayData.tasksCompleted}/{todayData.tasksTotal}
                  </span>
                </div>
                <Progress 
                  value={todayData.tasksTotal > 0 ? (todayData.tasksCompleted / todayData.tasksTotal) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
                  {todayData.mitsCompleted === todayData.mitsTotal && todayData.mitsTotal > 0 ? '✓ All MITs done!' : `${todayData.mitsTotal - todayData.mitsCompleted} MITs left`}
                </p>
              </div>

              {/* Workout */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
                    >
                      <Dumbbell className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                    </div>
                    <span className="text-sm font-semibold">Workout</span>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.colors.text.muted }}>
                    {todayData.workoutMinutes}min
                  </span>
                </div>
                <Progress 
                  value={todayData.workoutDone ? 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
                  {todayData.workoutDone ? '✓ Workout complete' : 'No workout yet'}
                </p>
              </div>

              {/* Nutrition */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                    >
                      <Coffee className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <span className="text-sm font-semibold">Calories</span>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.colors.text.muted }}>
                    {todayData.calories}/{todayData.caloriesGoal}
                  </span>
                </div>
                <Progress 
                  value={(todayData.calories / todayData.caloriesGoal) * 100} 
                  className="h-2"
                />
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
                  {todayData.caloriesGoal - todayData.calories} cal remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text.primary }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { 
              icon: BookOpen, 
              label: todayData.morningJournalDone ? 'View Journal' : 'Morning Journal', 
              done: todayData.morningJournalDone,
              path: '/morning-journal' 
            },
            { 
              icon: Target, 
              label: 'My Tasks', 
              badge: `${todayData.tasksTotal - todayData.tasksCompleted}`,
              path: '/tasks' 
            },
            { 
              icon: Dumbbell, 
              label: todayData.workoutDone ? 'View Workout' : 'Log Workout', 
              done: todayData.workoutDone,
              path: '/train' 
            },
            { 
              icon: Coffee, 
              label: 'Log Meal', 
              path: '/eat' 
            },
            { 
              icon: Moon, 
              label: todayData.eveningReflectionDone ? 'View Reflection' : 'Evening Reflection', 
              done: todayData.eveningReflectionDone,
              path: '/evening-reflection' 
            }
          ].map((action, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemedCard 
                className="cursor-pointer relative"
                onClick={() => {
                  playSound('click');
                  navigate(action.path);
                }}
              >
                <div className="p-4">
                  {action.done && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  {action.badge && (
                    <Badge className="absolute top-2 right-2" style={{ background: currentTheme.colors.accent }}>
                      {action.badge}
                    </Badge>
                  )}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                  >
                    <action.icon className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    {action.label}
                  </p>
                </div>
              </ThemedCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text.primary }}>
          🔥 Your Streaks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Moon, label: 'Sleep', streak: todayData.sleepStreak, desc: '7+ hours' },
            { icon: BookOpen, label: 'Journal', streak: todayData.journalStreak, desc: 'Daily entries' },
            { icon: Dumbbell, label: 'Workout', streak: todayData.workoutStreak, desc: 'Consecutive days' },
            { icon: Target, label: 'Tasks', streak: todayData.taskStreak, desc: 'All MITs done' }
          ].map((item, idx) => (
            <ThemedCard key={idx}>
              <div className="p-4 text-center">
                <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.colors.primary }} />
                <p className="text-3xl font-bold mb-1" style={{ color: currentTheme.colors.text.primary }}>
                  {item.streak}
                </p>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.text.secondary }}>
                  {item.label} streak
                </p>
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.muted }}>
                  {item.desc}
                </p>
              </div>
            </ThemedCard>
          ))}
        </div>
      </div>
    </div>
  );
}
