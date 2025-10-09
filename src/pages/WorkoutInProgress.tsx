import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, CheckCircle, Timer, Flame, TrendingUp, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WorkoutInProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const workoutId = location.state?.workoutId;
  const [workout, setWorkout] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState('135');
  const [reps, setReps] = useState('10');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  useEffect(() => {
    if (workoutId) loadWorkout();
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      if (isResting && restTime > 0) setRestTime(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutId, isResting, restTime]);

  async function loadWorkout() {
    const { data } = await supabase.from('workout_sessions').select('*').eq('id', workoutId).single();
    if (data) setWorkout(data);
  }

  async function logSet() {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r) return toast({ title: "Invalid input", variant: "destructive" });
    
    setTotalVolume(prev => prev + (w * r));
    setCurrentSet(prev => prev + 1);
    setIsResting(true);
    setRestTime(90);
    toast({ title: "Set logged! 💪", description: `${w} lbs × ${r} reps` });

    if (currentSet >= 3) {
      setTimeout(() => {
        setCurrentExercise(prev => prev + 1);
        setCurrentSet(1);
        setIsResting(false);
      }, 2000);
    }
  }

  async function completeWorkout() {
    await supabase.from('workout_sessions').update({
      completed_at: new Date().toISOString(),
      duration_min: Math.floor(elapsedTime / 60),
      total_volume_lbs: totalVolume
    }).eq('id', workoutId);
    toast({ title: "Workout Complete! 🎉" });
    navigate('/train');
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout) return <div className="min-h-screen flex items-center justify-center"><Flame className="w-12 h-12 text-primary animate-spin" /></div>;

  const progress = ((currentExercise + 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/train')} className="text-white"><X className="w-6 h-6" /></Button>
            <div className="text-center">
              <p className="text-sm text-white/60">Workout in progress</p>
              <p className="text-lg font-bold">{formatTime(elapsedTime)}</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="h-2 bg-white/10">
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
              <p className="text-xs text-white/60">lbs volume</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{currentExercise + 1}/5</p>
              <p className="text-xs text-white/60">exercises</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{currentSet}</p>
              <p className="text-xs text-white/60">current set</p>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {isResting && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50">
                <CardContent className="p-8 text-center">
                  <Timer className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-6xl font-bold mb-4">{restTime}s</p>
                  <Button onClick={() => { setIsResting(false); setRestTime(90); }} variant="outline" className="border-white/20 text-white">Skip Rest</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!isResting && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Badge className="mb-4">Set {currentSet} of 3</Badge>
                <h2 className="text-3xl font-bold">Bench Press</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-sm text-white/60 block mb-2">Weight (lbs)</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setWeight(String(Math.max(0, parseFloat(weight) - 5)))} className="border-white/20"><Minus className="w-4 h-4" /></Button>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="text-center text-2xl font-bold bg-white/10 border-white/20 text-white" />
                    <Button variant="outline" size="icon" onClick={() => setWeight(String(parseFloat(weight) + 5))} className="border-white/20"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Reps</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setReps(String(Math.max(1, parseInt(reps) - 1)))} className="border-white/20"><Minus className="w-4 h-4" /></Button>
                    <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="text-center text-2xl font-bold bg-white/10 border-white/20 text-white" />
                    <Button variant="outline" size="icon" onClick={() => setReps(String(parseInt(reps) + 1))} className="border-white/20"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <Button onClick={logSet} className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500">
                <CheckCircle className="w-6 h-6 mr-2" />Log Set
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
