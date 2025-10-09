import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Trophy,
  Award,
  Star,
  Flame,
  Zap,
  Crown,
  Target,
  TrendingUp,
  Calendar,
  Dumbbell,
  Apple,
  Moon,
  Heart,
  Lock,
  Unlock,
  Share2,
  ChevronRight,
  Sparkles,
  Medal,
  Gift,
  Users,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Achievement definitions with beautiful icons and descriptions
const ACHIEVEMENTS = [
  // Streak Achievements
  {
    id: 'streak_3',
    category: 'Streaks',
    name: 'Getting Started',
    description: 'Log your meals for 3 days in a row',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    rarity: 'common',
    xp: 50,
    requirement: { type: 'streak', count: 3 }
  },
  {
    id: 'streak_7',
    category: 'Streaks',
    name: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
    rarity: 'common',
    xp: 100,
    requirement: { type: 'streak', count: 7 }
  },
  {
    id: 'streak_30',
    category: 'Streaks',
    name: 'Monthly Master',
    description: 'Achieve a 30-day streak',
    icon: '🔥',
    color: 'from-red-500 to-pink-500',
    rarity: 'rare',
    xp: 500,
    requirement: { type: 'streak', count: 30 }
  },
  {
    id: 'streak_100',
    category: 'Streaks',
    name: 'Century Club',
    description: 'Incredible! 100 days of consistency',
    icon: '💯',
    color: 'from-purple-500 to-pink-500',
    rarity: 'epic',
    xp: 2000,
    requirement: { type: 'streak', count: 100 }
  },
  {
    id: 'streak_365',
    category: 'Streaks',
    name: 'Legendary',
    description: 'A full year of dedication!',
    icon: '👑',
    color: 'from-yellow-500 to-orange-500',
    rarity: 'legendary',
    xp: 10000,
    requirement: { type: 'streak', count: 365 }
  },

  // Workout Achievements
  {
    id: 'workout_first',
    category: 'Fitness',
    name: 'First Rep',
    description: 'Complete your first workout',
    icon: '💪',
    color: 'from-blue-500 to-cyan-500',
    rarity: 'common',
    xp: 25,
    requirement: { type: 'workouts', count: 1 }
  },
  {
    id: 'workout_10',
    category: 'Fitness',
    name: 'Getting Strong',
    description: 'Complete 10 workouts',
    icon: '🏋️',
    color: 'from-blue-500 to-purple-500',
    rarity: 'common',
    xp: 150,
    requirement: { type: 'workouts', count: 10 }
  },
  {
    id: 'workout_50',
    category: 'Fitness',
    name: 'Iron Will',
    description: 'Complete 50 workouts',
    icon: '⚡',
    color: 'from-purple-500 to-pink-500',
    rarity: 'rare',
    xp: 750,
    requirement: { type: 'workouts', count: 50 }
  },
  {
    id: 'workout_100',
    category: 'Fitness',
    name: 'Beast Mode',
    description: 'Complete 100 workouts',
    icon: '🦁',
    color: 'from-red-500 to-orange-500',
    rarity: 'epic',
    xp: 2500,
    requirement: { type: 'workouts', count: 100 }
  },

  // Nutrition Achievements
  {
    id: 'protein_goal',
    category: 'Nutrition',
    name: 'Protein Power',
    description: 'Hit your protein goal 7 days in a row',
    icon: '🥩',
    color: 'from-green-500 to-emerald-500',
    rarity: 'common',
    xp: 100,
    requirement: { type: 'protein_streak', count: 7 }
  },
  {
    id: 'calorie_perfect_week',
    category: 'Nutrition',
    name: 'Calorie Champion',
    description: 'Stay within calorie goal for a week',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    rarity: 'rare',
    xp: 300,
    requirement: { type: 'calorie_accuracy', count: 7 }
  },
  {
    id: 'meal_prep_master',
    category: 'Nutrition',
    name: 'Meal Prep Master',
    description: 'Log 50 meals',
    icon: '🍱',
    color: 'from-orange-500 to-red-500',
    rarity: 'rare',
    xp: 400,
    requirement: { type: 'meals_logged', count: 50 }
  },

  // Weight Loss Achievements
  {
    id: 'weight_5kg',
    category: 'Progress',
    name: 'First Milestone',
    description: 'Lose 5kg from starting weight',
    icon: '📉',
    color: 'from-green-500 to-teal-500',
    rarity: 'rare',
    xp: 500,
    requirement: { type: 'weight_loss', amount: 5 }
  },
  {
    id: 'weight_10kg',
    category: 'Progress',
    name: 'Transformation',
    description: 'Lose 10kg - amazing progress!',
    icon: '🎉',
    color: 'from-purple-500 to-pink-500',
    rarity: 'epic',
    xp: 1500,
    requirement: { type: 'weight_loss', amount: 10 }
  },
  {
    id: 'goal_reached',
    category: 'Progress',
    name: 'Goal Crusher',
    description: 'Reach your target weight',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-500',
    rarity: 'legendary',
    xp: 5000,
    requirement: { type: 'goal_reached' }
  },

  // Social & Community
  {
    id: 'recipe_unlock_10',
    category: 'Community',
    name: 'Recipe Explorer',
    description: 'Unlock 10 premium recipes',
    icon: '👨‍🍳',
    color: 'from-orange-500 to-red-500',
    rarity: 'common',
    xp: 200,
    requirement: { type: 'recipes_unlocked', count: 10 }
  },
  {
    id: 'early_adopter',
    category: 'Community',
    name: 'Early Adopter',
    description: 'Joined in the first month!',
    icon: '🚀',
    color: 'from-blue-500 to-purple-500',
    rarity: 'rare',
    xp: 1000,
    requirement: { type: 'early_adopter' }
  },

  // Special Achievements
  {
    id: 'perfect_day',
    category: 'Special',
    name: 'Perfect Day',
    description: 'Hit all goals in a single day',
    icon: '⭐',
    color: 'from-yellow-500 to-orange-500',
    rarity: 'rare',
    xp: 300,
    requirement: { type: 'perfect_day' }
  },
  {
    id: 'night_owl',
    category: 'Special',
    name: 'Night Owl',
    description: 'Log a workout after 10 PM',
    icon: '🦉',
    color: 'from-purple-500 to-indigo-500',
    rarity: 'common',
    xp: 50,
    requirement: { type: 'night_workout' }
  },
  {
    id: 'early_bird',
    category: 'Special',
    name: 'Early Bird',
    description: 'Log a workout before 6 AM',
    icon: '🐦',
    color: 'from-yellow-500 to-orange-500',
    rarity: 'common',
    xp: 50,
    requirement: { type: 'morning_workout' }
  }
];

export default function Achievements() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // User stats
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalAchievements: ACHIEVEMENTS.length,
    unlockedAchievements: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    weightLost: 0
  });

  // Unlocked achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [recentUnlocks, setRecentUnlocks] = useState<any[]>([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [currentUnlock, setCurrentUnlock] = useState<any>(null);

  const categories = ['All', 'Streaks', 'Fitness', 'Nutrition', 'Progress', 'Community', 'Special'];

  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadUserStats(user.id);
  }

  async function loadUserStats(uid: string) {
    try {
      // Load user achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', uid);

      if (achievementsData) {
        const unlocked = new Set(achievementsData.map(a => a.achievement_id));
        setUnlockedAchievements(unlocked);
        
        // Get recent unlocks (last 7 days)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);
        const recent = achievementsData
          .filter(a => new Date(a.unlocked_at) > recentDate)
          .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
          .slice(0, 5);
        setRecentUnlocks(recent);
      }

      // Calculate stats
      const { data: complianceData } = await supabase
        .from('compliance_scores')
        .select('date')
        .eq('user_id', uid)
        .order('date', { ascending: false });

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (complianceData && complianceData.length > 0) {
        const dates = complianceData.map(d => d.date).sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate current streak
        for (let i = 0; i < dates.length; i++) {
          const date = new Date(dates[i]);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Calculate longest streak
        for (let i = 0; i < dates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Get workout count
      const { count: workoutCount } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .not('completed_at', 'is', null);

      // Get meal count
      const { count: mealCount } = await supabase
        .from('food_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      // Calculate XP and level
      const totalXP = Array.from(unlockedAchievements).reduce((sum, id) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return sum + (achievement?.xp || 0);
      }, 0);

      const level = Math.floor(totalXP / 1000) + 1;
      const xpInCurrentLevel = totalXP % 1000;
      const xpToNextLevel = 1000;

      setStats({
        level,
        xp: xpInCurrentLevel,
        xpToNextLevel,
        totalAchievements: ACHIEVEMENTS.length,
        unlockedAchievements: unlockedAchievements.size,
        currentStreak,
        longestStreak,
        totalWorkouts: workoutCount || 0,
        totalMeals: mealCount || 0,
        weightLost: 0 // Calculate from weight logs if needed
      });

      // Check for new achievements
      await checkNewAchievements(uid, {
        currentStreak,
        longestStreak,
        totalWorkouts: workoutCount || 0,
        totalMeals: mealCount || 0
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkNewAchievements(uid: string, userStats: any) {
    const newUnlocks: any[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'streak':
          shouldUnlock = userStats.currentStreak >= achievement.requirement.count;
          break;
        case 'workouts':
          shouldUnlock = userStats.totalWorkouts >= achievement.requirement.count;
          break;
        case 'meals_logged':
          shouldUnlock = userStats.totalMeals >= achievement.requirement.count;
          break;
      }

      if (shouldUnlock) {
        newUnlocks.push(achievement);
      }
    }

    // Unlock new achievements
    for (const achievement of newUnlocks) {
      await unlockAchievement(uid, achievement);
    }
  }

  async function unlockAchievement(uid: string, achievement: any) {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: uid,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setUnlockedAchievements(prev => new Set([...prev, achievement.id]));
      
      // Show unlock animation
      setCurrentUnlock(achievement);
      setShowUnlockAnimation(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowUnlockAnimation(false);
      }, 5000);

      toast({
        title: `🎉 Achievement Unlocked!`,
        description: `${achievement.name} - +${achievement.xp} XP`,
      });

    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  const filteredAchievements = ACHIEVEMENTS.filter(
    a => selectedCategory === 'All' || a.category === selectedCategory
  );

  const AchievementCard = ({ achievement, unlocked }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1.02 }}
      className="relative"
    >
      <Card className={`overflow-hidden border-2 transition-all ${
        unlocked 
          ? 'border-primary/50 shadow-lg cursor-pointer' 
          : 'border-border/50 opacity-60'
      }`}>
        {/* Rarity Glow */}
        {unlocked && (
          <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-5`} />
        )}

        <CardContent className="p-6">
          {/* Lock/Unlock Icon */}
          <div className="absolute top-3 right-3">
            {unlocked ? (
              <Unlock className="w-5 h-5 text-primary" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Achievement Icon */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center text-4xl mb-4 mx-auto ${
            !unlocked && 'grayscale opacity-50'
          }`}>
            {achievement.icon}
          </div>

          {/* Achievement Info */}
          <div className="text-center">
            <Badge 
              className={`mb-2 ${rarityColors[achievement.rarity as keyof typeof rarityColors]} text-white`}
            >
              {achievement.rarity.toUpperCase()}
            </Badge>
            
            <h3 className="font-bold text-lg mb-2">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-yellow-600">+{achievement.xp} XP</span>
            </div>

            {/* Progress indicator for locked achievements */}
            {!unlocked && achievement.requirement.count && (
              <div className="mt-4">
                <Progress 
                  value={Math.min((stats.currentStreak / achievement.requirement.count) * 100, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.currentStreak} / {achievement.requirement.count}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Trophy className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-500/5 to-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
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
                <Trophy className="w-6 h-6 text-yellow-500" />
                Achievements
              </h1>
              <p className="text-sm text-muted-foreground">
                {stats.unlockedAchievements} / {stats.totalAchievements} unlocked
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="relative">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(251, 191, 36, 0.3), transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.3), transparent 50%)',
                    'radial-gradient(circle at 0% 100%, rgba(239, 68, 68, 0.3), transparent 50%)',
                    'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.3), transparent 50%)',
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />

              <CardContent className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl"
                    >
                      <Crown className="w-12 h-12 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Level</p>
                      <h2 className="text-5xl font-bold mb-2">Level {stats.level}</h2>
                      <div className="flex items-center gap-2">
                        <Progress value={(stats.xp / stats.xpToNextLevel) * 100} className="w-48 h-2" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {stats.xp} / {stats.xpToNextLevel} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                      <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{stats.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                      <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{stats.unlockedAchievements}</p>
                      <p className="text-xs text-muted-foreground">Achievements</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 backdrop-blur text-center">
                    <Dumbbell className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-bold">{stats.totalWorkouts}</p>
                    <p className="text-xs text-muted-foreground">Workouts</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 backdrop-blur text-center">
                    <Apple className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-sm font-bold">{stats.totalMeals}</p>
                    <p className="text-xs text-muted-foreground">Meals</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 backdrop-blur text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-sm font-bold">{stats.longestStreak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 backdrop-blur text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-sm font-bold">{Math.floor(stats.unlockedAchievements / stats.totalAchievements * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Recently Unlocked
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentUnlocks.map((unlock, index) => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === unlock.achievement_id);
                    if (!achievement) return null;

                    return (
                      <motion.div
                        key={unlock.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex-shrink-0 w-32 text-center"
                      >
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center text-3xl mx-auto mb-2`}>
                          {achievement.icon}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(unlock.unlocked_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <AchievementCard
                  achievement={achievement}
                  unlocked={unlockedAchievements.has(achievement.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon - Leaderboards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-2xl font-bold mb-2">Leaderboards Coming Soon!</h3>
              <p className="text-muted-foreground mb-6">
                Compete with friends and climb the rankings
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Under Development
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showUnlockAnimation && currentUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="border-4 border-primary shadow-2xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentUnlock.color} flex items-center justify-center text-5xl mx-auto mb-4`}
                >
                  {currentUnlock.icon}
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">🎉 Achievement Unlocked!</h2>
                <p className="text-xl font-semibold mb-2">{currentUnlock.name}</p>
                <p className="text-sm text-muted-foreground mb-4">{currentUnlock.description}</p>
                <Badge className="text-base px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Zap className="w-4 h-4 mr-1" />
                  +{currentUnlock.xp} XP
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
