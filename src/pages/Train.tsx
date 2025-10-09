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
  Play,
  CheckCircle,
  Clock,
  Dumbbell,
  TrendingUp,
  Award,
  Zap,
  Target,
  Plus,
  ChevronRight,
  Flame,
  Calendar,
  BarChart3,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Train() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [weekStats, setWeekStats] = useState({ workouts: 0, totalMinutes: 0, totalVolume: 0, streak: 0 });
  const [workoutPlans] = useState([
    { id: '1', name: 'Push Day', description: 'Chest, Shoulders, Triceps', duration: 45, difficulty: 'Intermediate', exercises: 8, image: '💪', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Pull Day', description: 'Back, Biceps, Rear Delts', duration: 50, difficulty: 'Intermediate', exercises: 7, image: '🔥', color: 'from-purple-500 to-pink-500' },
    { id: '3', name: 'Leg Day', description: 'Quads, Hamstrings, Calves', duration: 60, difficulty: 'Advanced', exercises: 9, image: '🦵', color: 'from-orange-500 to-red-500' },
    { id: '4', name: 'Full Body', description: 'Complete body workout', duration: 40, difficulty: 'Beginner', exercises: 6, image: '⚡', color: 'from-green-500 to-emerald-500' }
  ]);

  const today = new Date().toISOString().split('T')[0];

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
    await loadData(user.id);
  }

  async function loadData(uid: string) {
    try {
      const { data: workout } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle();

      if (workout) {
        setTodayWorkout(workout);
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weekWorkouts } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .not('completed_at', 'is', null);

      if (weekWorkouts) {
        const stats = weekWorkouts.reduce((acc, w) => ({
          workouts: acc.workouts + 1,
          totalMinutes: acc.totalMinutes + (w.duration_min || 0),
          totalVolume: acc.totalVolume + (w.total_volume_lbs || 0)
        }), { workouts: 0, totalMinutes: 0, totalVolume: 0 });
        setWeekStats({ ...stats, streak: 0 });
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div whileHover={{ scale: 1.05, y: -5 }}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`h-1 bg-gradient-to-r ${color}`} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} opacity-10 flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Dumbbell className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Train</h1>
                <p className="text-sm text-muted-foreground">Your workout journey</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {todayWorkout ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden border-0 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
              <CardContent className="relative z-10 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge className="mb-3 bg-blue-500">Today's Workout</Badge>
                    <h2 className="text-3xl font-bold mb-2">{todayWorkout.name}</h2>
                  </div>
                  <Button onClick={() => navigate('/workout-in-progress', { state: { workoutId: todayWorkout.id } })} size="lg" className="rounded-full h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500">
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-xl font-semibold mb-2">No workout scheduled today</p>
              <Button onClick={() => setActiveTab('plans')} size="lg"><Plus className="w-5 h-5 mr-2" />Start a Workout</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Flame} label="Workouts" value={weekStats.workouts} color="from-orange-500 to-red-500" />
          <StatCard icon={Clock} label="Total Minutes" value={weekStats.totalMinutes} color="from-blue-500 to-cyan-500" />
          <StatCard icon={TrendingUp} label="Volume (lbs)" value={weekStats.totalVolume.toLocaleString()} color="from-green-500 to-emerald-500" />
          <StatCard icon={Award} label="Day Streak" value={weekStats.streak} color="from-purple-500 to-pink-500" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden border-0">
                  <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <Button className={`w-full bg-gradient-to-r ${plan.color}`}>
                      Start Workout <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
