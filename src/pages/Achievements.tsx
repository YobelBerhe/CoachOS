import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Crown,
  Dumbbell,
  Apple,
  Lock,
  Sparkles
} from 'lucide-react';

const ACHIEVEMENTS = [
  {
    id: 'streak_3',
    category: 'Streaks',
    name: 'Getting Started',
    description: 'Log your meals for 3 days in a row',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    rarity: 'common',
    xp: 50,
    check: (stats: any) => stats.currentStreak >= 3
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
    check: (stats: any) => stats.currentStreak >= 7
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
    check: (stats: any) => stats.currentStreak >= 30
  },
  {
    id: 'workout_1',
    category: 'Fitness',
    name: 'First Rep',
    description: 'Complete your first workout',
    icon: '💪',
    color: 'from-blue-500 to-cyan-500',
    rarity: 'common',
    xp: 25,
    check: (stats: any) => stats.totalWorkouts >= 1
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
    check: (stats: any) => stats.totalWorkouts >= 10
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
    check: (stats: any) => stats.totalWorkouts >= 50
  },
  {
    id: 'meal_10',
    category: 'Nutrition',
    name: 'Meal Logger',
    description: 'Log 10 meals',
    icon: '🍎',
    color: 'from-green-500 to-emerald-500',
    rarity: 'common',
    xp: 50,
    check: (stats: any) => stats.totalMeals >= 10
  },
  {
    id: 'meal_50',
    category: 'Nutrition',
    name: 'Nutrition Tracker',
    description: 'Log 50 meals',
    icon: '🥗',
    color: 'from-green-500 to-teal-500',
    rarity: 'common',
    xp: 200,
    check: (stats: any) => stats.totalMeals >= 50
  },
  {
    id: 'meal_100',
    category: 'Nutrition',
    name: 'Meal Prep Master',
    description: 'Log 100 meals',
    icon: '🍱',
    color: 'from-orange-500 to-red-500',
    rarity: 'rare',
    xp: 400,
    check: (stats: any) => stats.totalMeals >= 100
  }
];

export default function Achievements() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalMeals: 0
  });

  const categories = ['All', 'Streaks', 'Fitness', 'Nutrition'];

  const rarityColors = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500'
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
    await loadUserStats(user.id);
  }

  async function loadUserStats(uid: string) {
    try {
      // Get compliance data for streak calculation
      const { data: complianceData } = await supabase
        .from('compliance_scores')
        .select('date')
        .eq('user_id', uid)
        .order('date', { ascending: false });

      let currentStreak = 0;
      let longestStreak = 0;

      if (complianceData && complianceData.length > 0) {
        const dates = complianceData.map(d => d.date).sort().reverse();
        
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
        let tempStreak = 0;
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

      // Calculate unlocked achievements and XP
      const userStats = {
        currentStreak,
        longestStreak,
        totalWorkouts: workoutCount || 0,
        totalMeals: mealCount || 0
      };

      const totalXP = ACHIEVEMENTS.reduce((sum, achievement) => {
        return achievement.check(userStats) ? sum + achievement.xp : sum;
      }, 0);

      const level = Math.floor(totalXP / 1000) + 1;
      const xpInCurrentLevel = totalXP % 1000;

      setStats({
        level,
        xp: xpInCurrentLevel,
        xpToNextLevel: 1000,
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

  const filteredAchievements = selectedCategory === 'All'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(stats)).length;

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
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
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
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20" />
            
            <CardContent className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge className="mb-2 bg-purple-500">Level {stats.level}</Badge>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{stats.xp}</span>
                    <span className="text-xl text-muted-foreground">/ {stats.xpToNextLevel} XP</span>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl"
                >
                  <Crown className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              <Progress value={(stats.xp / stats.xpToNextLevel) * 100} className="h-3 mb-4" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
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
                    <span className="text-sm font-medium">Meals</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalMeals}</p>
                  <p className="text-xs text-muted-foreground">logged</p>
                </div>

                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Unlocked</span>
                  </div>
                  <p className="text-2xl font-bold">{unlockedCount}</p>
                  <p className="text-xs text-muted-foreground">of {ACHIEVEMENTS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full grid grid-cols-4 h-12 bg-secondary/50">
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-background"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-6">
            {filteredAchievements.map((achievement, index) => {
              const isUnlocked = achievement.check(stats);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-2 ${isUnlocked ? rarityColors[achievement.rarity] : 'border-border'} shadow-lg hover:shadow-xl transition-all`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`text-6xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{achievement.name}</h3>
                            {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            <Badge
                              variant={isUnlocked ? 'default' : 'outline'}
                              className="capitalize"
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">{achievement.xp} XP</span>
                            </div>
                            
                            {isUnlocked && (
                              <Badge className="bg-green-500">
                                Unlocked ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
