import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseLibrary } from "@/components/train/ExerciseLibrary";
import { WorkoutTemplates } from "@/components/train/WorkoutTemplates";
import { ArrowLeft, Plus, Dumbbell } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
}

const Train = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const [exercisesResult, workoutResult] = await Promise.all([
        supabase
          .from('exercises')
          .select('*')
          .order('name'),
        supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', uid)
          .eq('date', today)
          .single()
      ]);

      if (exercisesResult.data) {
        setExercises(exercisesResult.data);
      }

      if (workoutResult.data) {
        setTodayWorkout(workoutResult.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuickWorkout = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          date: today,
          name: "Quick Workout",
          scheduled_time: new Date().toTimeString().slice(0, 5)
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        navigate(`/workout-in-progress?sessionId=${data.id}`);
      }
    } catch (error: any) {
      console.error('Error starting workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Train</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Workout</CardTitle>
              <Button onClick={startQuickWorkout}>
                <Plus className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayWorkout ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">{todayWorkout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {todayWorkout.completed_at 
                        ? `Completed at ${new Date(todayWorkout.completed_at).toLocaleTimeString()}`
                        : "In Progress"
                      }
                    </p>
                  </div>
                  {!todayWorkout.completed_at && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/workout-in-progress?sessionId=${todayWorkout.id}`)}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">No workout scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Exercise Library</TabsTrigger>
            <TabsTrigger value="programs">Workout Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4 mt-4">
            <ExerciseLibrary exercises={exercises} />
          </TabsContent>
          
          <TabsContent value="programs" className="space-y-4 mt-4">
            <WorkoutTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Train;
