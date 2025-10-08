import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { calculateComplianceScore } from "@/lib/compliance";

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

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
      // For MVP, fetch 5 random exercises
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .limit(5);

      if (error) throw error;

      if (data) {
        setExercises(data);
        // Initialize exercise logs
        const logs: ExerciseLog[] = data.map(ex => ({
          exercise_id: ex.id,
          exercise_name: ex.name,
          sets: [],
          target_sets: 3,
          target_reps: 10
        }));
        setExerciseLogs(logs);
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

  const skipExercise = () => {
    if (currentExerciseIdx < exercises.length - 1) {
      setCurrentExerciseIdx(currentExerciseIdx + 1);
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
        .map((log, idx) => ({
          workout_session_id: sessionId,
          exercise_id: log.exercise_id,
          exercise_name: log.exercise_name,
          order_index: idx,
          sets: JSON.stringify(log.sets),
          target_sets: log.target_sets,
          target_reps: log.target_reps
        }));

      if (logsToInsert.length > 0) {
        const { error: logsError } = await supabase
          .from('exercise_logs')
          .insert(logsToInsert);

        if (logsError) throw logsError;
      }

      // Calculate total volume
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
          total_volume_lbs: totalVolume,
          total_sets: totalSets,
          total_reps: totalReps
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

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No exercises available</p>
            <Button onClick={() => navigate("/train")}>Back to Train</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIdx];
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
              <p className="text-sm text-muted-foreground">
                Exercise {currentExerciseIdx + 1} of {exercises.length}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={finishWorkout}>
            Finish Workout
          </Button>
        </div>

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
                <Badge variant="outline">{currentExercise.difficulty}</Badge>
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
                onClick={skipExercise}
                className="flex-1"
                disabled={currentExerciseIdx >= exercises.length - 1}
              >
                Skip Exercise
              </Button>
              <Button onClick={logSet} className="flex-1">
                Log Set
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutInProgress;
