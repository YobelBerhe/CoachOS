import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Timer, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { calculateComplianceScore } from "@/lib/compliance";
import { AddExerciseToWorkoutDialog } from "@/components/train/AddExerciseToWorkoutDialog";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
}

interface ExerciseLog {
  exercise_id: string;
  exercise_name: string;
  sets: { weight: number; reps: number; completed: boolean }[];
  target_sets: number;
  target_reps: number;
}

const WorkoutInProgress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchExercises();
      }
    });
  }, [navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setAllExercises(data);
      }
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (workoutExercises.find(ex => ex.id === exercise.id)) {
      toast({
        title: "Already added",
        description: "This exercise is already in your workout",
        variant: "destructive"
      });
      return;
    }

    setWorkoutExercises([...workoutExercises, exercise]);
    setExerciseLogs([...exerciseLogs, {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: [],
      target_sets: 3,
      target_reps: 10
    }]);

    toast({
      title: "Exercise added",
      description: `${exercise.name} added to workout`
    });
  };

  const removeExercise = (idx: number) => {
    const updatedExercises = workoutExercises.filter((_, i) => i !== idx);
    const updatedLogs = exerciseLogs.filter((_, i) => i !== idx);
    
    setWorkoutExercises(updatedExercises);
    setExerciseLogs(updatedLogs);
    
    if (currentExerciseIdx >= updatedExercises.length && updatedExercises.length > 0) {
      setCurrentExerciseIdx(updatedExercises.length - 1);
    }
  };

  const logSet = () => {
    if (!weight || !reps) {
      toast({
        title: "Missing data",
        description: "Please enter weight and reps",
        variant: "destructive"
      });
      return;
    }

    const updatedLogs = [...exerciseLogs];
    updatedLogs[currentExerciseIdx].sets.push({
      weight: parseFloat(weight),
      reps: parseInt(reps),
      completed: true
    });
    setExerciseLogs(updatedLogs);

    toast({
      title: "Set logged!",
      description: `${weight} lbs × ${reps} reps`
    });

    setWeight("");
    setReps("");
    setCurrentSet(currentSet + 1);
    
    // Start rest timer
    setRestTimer(90); // 90 seconds rest
    setIsResting(true);
  };

  const nextExercise = () => {
    if (currentExerciseIdx < workoutExercises.length - 1) {
      setCurrentExerciseIdx(currentExerciseIdx + 1);
      setCurrentSet(1);
      setWeight("");
      setReps("");
      setIsResting(false);
      setRestTimer(0);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIdx > 0) {
      setCurrentExerciseIdx(currentExerciseIdx - 1);
      setCurrentSet(1);
      setWeight("");
      setReps("");
      setIsResting(false);
      setRestTimer(0);
    }
  };

  const finishWorkout = async () => {
    if (!userId || !sessionId) return;

    try {
      // Save exercise logs
      const logsToInsert = exerciseLogs
        .filter(log => log.sets.length > 0)
        .map(log => ({
          workout_session_id: sessionId,
          exercise_id: log.exercise_id,
          sets: log.sets
        }));

      if (logsToInsert.length > 0) {
        const { error: logsError } = await supabase
          .from('exercise_logs')
          .insert(logsToInsert);

        if (logsError) throw logsError;
      }

      // Calculate stats for summary
      const totalVolume = exerciseLogs.reduce((sum, log) => {
        return sum + log.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
      }, 0);

      const totalSets = exerciseLogs.reduce((sum, log) => sum + log.sets.length, 0);
      const totalReps = exerciseLogs.reduce((sum, log) => {
        return sum + log.sets.reduce((setSum, set) => setSum + set.reps, 0);
      }, 0);

      // Complete the workout session
      const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          notes: `${totalSets} sets, ${totalReps} reps, ${Math.round(totalVolume)} lbs volume`
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Recalculate compliance
      const today = new Date().toISOString().split('T')[0];
      await calculateComplianceScore(userId, today);

      toast({
        title: "Workout complete! 💪",
        description: `${totalSets} sets, ${totalReps} reps, ${Math.round(totalVolume)} lbs total volume`
      });

      navigate("/train");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentExercise = workoutExercises[currentExerciseIdx];
  const currentLog = exerciseLogs[currentExerciseIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/train")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Workout in Progress</h1>
              {workoutExercises.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Exercise {currentExerciseIdx + 1} of {workoutExercises.length}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddExercise(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
            <Button variant="outline" onClick={finishWorkout}>
              Finish Workout
            </Button>
          </div>
        </div>

        {workoutExercises.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Plus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No exercises in workout yet</p>
              <Button onClick={() => setShowAddExercise(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Exercise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {isResting && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-3">
                    <Timer className="h-6 w-6 text-primary animate-pulse" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rest Timer</p>
                      <p className="text-3xl font-bold text-primary">{restTimer}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{currentExercise.difficulty}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(currentExerciseIdx)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{currentExercise.muscle_group}</Badge>
                    <Badge variant="secondary">{currentExercise.equipment}</Badge>
                  </div>
                </div>
              </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Target: {currentLog.target_sets} sets × {currentLog.target_reps} reps</p>
              <p className="text-sm text-muted-foreground">Current Set: {currentSet}</p>
            </div>

            <div className="space-y-3">
              {currentLog.sets.map((set, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-medium">Set {idx + 1}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {set.weight} lbs × {set.reps} reps
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (lbs)</label>
                <Input
                  type="number"
                  placeholder="135"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reps</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
            </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={previousExercise}
                    disabled={currentExerciseIdx === 0}
                  >
                    Previous
                  </Button>
                  <Button onClick={logSet} className="flex-1">
                    Log Set
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextExercise}
                    disabled={currentExerciseIdx >= workoutExercises.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AddExerciseToWorkoutDialog
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        exercises={allExercises}
        onSelectExercise={addExerciseToWorkout}
      />
    </div>
  );
};

export default WorkoutInProgress;
