import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Play, Pause, SkipForward, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: string;
  sets: Array<{
    set_number: number;
    weight_lbs: number;
    reps: number;
    completed: boolean;
  }>;
  previous_best_weight?: number;
  previous_best_reps?: number;
}

interface WorkoutSession {
  id: string;
  name: string;
  started_at: string;
  exercises: Exercise[];
}

export default function WorkoutInProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const workoutId = location.state?.workoutId;

  const [userId, setUserId] = useState<string | undefined>();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Rest timer state
  const [restSeconds, setRestSeconds] = useState(90);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  // Set logging state
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');

  // Completion dialog
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [sorenessRating, setSorenessRating] = useState(3);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      if (workoutId) {
        await fetchWorkout(workoutId);
      } else {
        // No workout ID, navigate back
        navigate('/train');
      }
    }
    init();
  }, [workoutId, navigate]);

  // Rest timer countdown
  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      const timer = setTimeout(() => {
        setRestTimeLeft(restTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
      toast({
        title: "Rest complete!",
        description: "Ready for your next set 💪"
      });
    }
  }, [isResting, restTimeLeft, toast]);

  async function fetchWorkout(wId: string) {
    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', wId)
        .single();

      if (sessionError) throw sessionError;

      const { data: logsData, error: logsError } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_session_id', wId)
        .order('order_index', { ascending: true });

      if (logsError) throw logsError;

      const exercises: Exercise[] = (logsData || []).map(log => ({
        id: log.id,
        exercise_id: log.exercise_id,
        exercise_name: log.exercise_name,
        order_index: log.order_index,
        target_sets: log.target_sets || 3,
        target_reps: log.target_reps || '8-10',
        sets: log.sets || [],
        previous_best_weight: log.previous_best_weight,
        previous_best_reps: log.previous_best_reps
      }));

      setWorkout({
        id: sessionData.id,
        name: sessionData.name,
        started_at: sessionData.started_at,
        exercises
      });

      // If workout hasn't started, start it now
      if (!sessionData.started_at) {
        await supabase
          .from('workout_sessions')
          .update({ started_at: new Date().toISOString() })
          .eq('id', wId);
      }

    } catch (error: any) {
      console.error('Error fetching workout:', error);
      toast({
        title: "Error loading workout",
        description: error.message,
        variant: "destructive"
      });
      navigate('/train');
    } finally {
      setLoading(false);
    }
  }

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const totalExercises = workout?.exercises.length || 0;
  const completedExercises = workout?.exercises.filter(ex => 
    ex.sets.length >= ex.target_sets && ex.sets.every(s => s.completed)
  ).length || 0;

  const progressPercentage = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100) 
    : 0;

  const getProgressiveOverloadSuggestion = (exercise: Exercise) => {
    if (!exercise.previous_best_weight || exercise.sets.length === 0) {
      return "Start with a comfortable weight";
    }

    const lastSets = exercise.sets.slice(-3);
    const allHitTarget = lastSets.every(s => s.reps >= 10);
    const mostMissedTarget = lastSets.filter(s => s.reps < 8).length > lastSets.length / 2;

    if (allHitTarget) {
      const newWeight = exercise.previous_best_weight + (exercise.previous_best_weight >= 100 ? 10 : 5);
      return `💪 Increase to ${newWeight} lbs`;
    } else if (mostMissedTarget) {
      return `Focus on hitting 8 reps at ${exercise.previous_best_weight} lbs`;
    } else {
      return `Maintain ${exercise.previous_best_weight} lbs, aim for top of range`;
    }
  };

  const handleLogSet = async () => {
    if (!currentExercise || !weight || !reps) {
      toast({
        title: "Missing data",
        description: "Please enter weight and reps",
        variant: "destructive"
      });
      return;
    }

    try {
      const setNumber = currentExercise.sets.length + 1;
      const newSet = {
        set_number: setNumber,
        weight_lbs: parseFloat(weight),
        reps: parseInt(reps),
        completed: true
      };

      const updatedSets = [...currentExercise.sets, newSet];

      const { error } = await supabase
        .from('exercise_logs')
        .update({ sets: updatedSets })
        .eq('id', currentExercise.id);

      if (error) throw error;

      // Update local state
      const updatedExercises = [...workout!.exercises];
      updatedExercises[currentExerciseIndex].sets = updatedSets;
      setWorkout({ ...workout!, exercises: updatedExercises });

      // Clear inputs
      setWeight('');
      setReps('');

      // Start rest timer
      setRestTimeLeft(restSeconds);
      setIsResting(true);

      toast({
        title: `Set ${setNumber} logged!`,
        description: `${weight} lbs × ${reps} reps`
      });

    } catch (error: any) {
      console.error('Error logging set:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setWeight('');
      setReps('');
      setIsResting(false);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setWeight('');
      setReps('');
      setIsResting(false);
    }
  };

  const handleFinishWorkout = () => {
    setShowCompletionDialog(true);
  };

  const handleCompleteWorkout = async () => {
    if (!workout || !userId) return;

    try {
      // Calculate stats
      let totalSets = 0;
      let totalReps = 0;
      let totalVolume = 0;

      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            totalSets++;
            totalReps += set.reps;
            totalVolume += set.weight_lbs * set.reps;
          }
        });
      });

      const startTime = new Date(workout.started_at);
      const endTime = new Date();
      const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: endTime.toISOString(),
          duration_min: durationMin,
          total_sets: totalSets,
          total_reps: totalReps,
          total_volume_lbs: totalVolume,
          soreness_rating: sorenessRating
        })
        .eq('id', workout.id);

      if (error) throw error;

      toast({
        title: "Workout complete! 🎉",
        description: `${totalSets} sets, ${Math.round(totalVolume)} lbs total volume`
      });

      navigate('/train');

    } catch (error: any) {
      console.error('Error completing workout:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleQuit = () => {
    if (confirm('Quit workout? Your progress will be saved but the workout will be marked incomplete.')) {
      navigate('/train');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Workout not found</p>
          <Button onClick={() => navigate('/train')}>Back to Train</Button>
        </div>
      </div>
    );
  }

  const currentSetNumber = currentExercise.sets.length + 1;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const allSetsComplete = currentExercise.sets.length >= currentExercise.target_sets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleQuit}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">{workout.name}</h1>
            <p className="text-sm text-muted-foreground">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFinishWorkout}
            className="text-green-600"
          >
            Finish
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{completedExercises}/{totalExercises} exercises</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Exercise Card */}
        <Card className="mb-4">
          <CardContent className="p-6">
            {/* Exercise Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentExercise.exercise_name}</h2>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>{currentExercise.target_sets} sets</span>
                <span>•</span>
                <span>{currentExercise.target_reps} reps</span>
              </div>
            </div>

            {/* Exercise Animation/Image Placeholder */}
            <div className="bg-secondary/30 rounded-lg h-48 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Exercise animation</p>
                <p className="text-xs text-muted-foreground">GIF placeholder</p>
              </div>
            </div>

            {/* Previous Best */}
            {currentExercise.previous_best_weight && (
              <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Last Workout:</p>
                <p className="text-sm text-muted-foreground">
                  {currentExercise.previous_best_weight} lbs × {currentExercise.previous_best_reps} reps
                </p>
              </div>
            )}

            {/* Progressive Overload Suggestion */}
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium mb-1">💡 Recommendation:</p>
              <p className="text-sm">{getProgressiveOverloadSuggestion(currentExercise)}</p>
            </div>

            {/* Set Logging */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Set {currentSetNumber} of {currentExercise.target_sets}</span>
                {allSetsComplete && (
                  <Badge variant="default" className="bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Weight (lbs)</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight((prev) => String(Math.max(0, parseFloat(prev || '0') - 5)))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                      className="text-center text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight((prev) => String(parseFloat(prev || '0') + 5))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Reps</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReps((prev) => String(Math.max(0, parseInt(prev || '0') - 1)))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="0"
                      className="text-center text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReps((prev) => String(parseInt(prev || '0') + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLogSet}
                className="w-full"
                size="lg"
                disabled={!weight || !reps}
              >
                <Check className="w-5 h-5 mr-2" />
                Log Set
              </Button>
            </div>

            {/* Set History */}
            {currentExercise.sets.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Completed Sets:</p>
                {currentExercise.sets.map((set, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                    <span className="text-sm">Set {set.set_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{set.weight_lbs} lbs × {set.reps} reps</span>
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rest Timer */}
        {isResting && (
          <Card className="mb-4 border-orange-500 border-2">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Rest Timer</p>
                <div className="text-5xl font-bold mb-4">
                  {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkipRest}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Rest
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsResting(false)}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNextExercise}
            disabled={isLastExercise}
            className="flex-1"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Completion Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Workout Complete!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">{completedExercises}/{totalExercises}</p>
                <p className="text-muted-foreground">Exercises Completed</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  How sore do you feel? (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={sorenessRating === rating ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSorenessRating(rating)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {sorenessRating === 1 && 'Not sore at all'}
                  {sorenessRating === 2 && 'Slightly sore'}
                  {sorenessRating === 3 && 'Moderately sore'}
                  {sorenessRating === 4 && 'Very sore'}
                  {sorenessRating === 5 && 'Extremely sore'}
                </p>
              </div>

              <Button onClick={handleCompleteWorkout} className="w-full" size="lg">
                Complete Workout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
