import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Dumbbell, Play, Calendar, TrendingUp, Search, Plus, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  completed_at?: string;
  duration_min?: number;
  total_sets?: number;
  total_volume_lbs?: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  gif_url?: string;
}

const WORKOUT_TEMPLATES = [
  {
    id: 'upper-push',
    name: 'Upper Body - Push',
    description: 'Chest, Shoulders, Triceps',
    duration: '60-75 min',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', muscle: 'Chest' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Chest' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', muscle: 'Shoulders' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', muscle: 'Triceps' },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', muscle: 'Triceps' }
    ]
  },
  {
    id: 'upper-pull',
    name: 'Upper Body - Pull',
    description: 'Back, Biceps, Rear Delts',
    duration: '60-75 min',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '6-8', muscle: 'Back' },
      { name: 'Pull-ups', sets: 3, reps: '8-10', muscle: 'Back' },
      { name: 'Barbell Row', sets: 3, reps: '8-10', muscle: 'Back' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', muscle: 'Rear Delts' },
      { name: 'Bicep Curls', sets: 3, reps: '10-12', muscle: 'Biceps' },
      { name: 'Hammer Curls', sets: 3, reps: '10-12', muscle: 'Biceps' }
    ]
  },
  {
    id: 'lower-squat',
    name: 'Lower Body - Squat Focus',
    description: 'Quads, Glutes, Calves',
    duration: '60-75 min',
    exercises: [
      { name: 'Squat', sets: 4, reps: '6-8', muscle: 'Quads' },
      { name: 'Leg Press', sets: 3, reps: '10-12', muscle: 'Quads' },
      { name: 'Lunges', sets: 3, reps: '10-12', muscle: 'Quads/Glutes' },
      { name: 'Leg Extensions', sets: 3, reps: '12-15', muscle: 'Quads' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', muscle: 'Hamstrings' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', muscle: 'Calves' }
    ]
  },
  {
    id: 'lower-deadlift',
    name: 'Lower Body - Deadlift Focus',
    description: 'Hamstrings, Glutes, Lower Back',
    duration: '60-75 min',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '6-8', muscle: 'Posterior Chain' },
      { name: 'Romanian Deadlift', sets: 3, reps: '8-10', muscle: 'Hamstrings' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', muscle: 'Glutes' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', muscle: 'Hamstrings' },
      { name: 'Hip Thrusts', sets: 3, reps: '10-12', muscle: 'Glutes' },
      { name: 'Back Extensions', sets: 3, reps: '15-20', muscle: 'Lower Back' }
    ]
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'All major muscle groups',
    duration: '60-75 min',
    exercises: [
      { name: 'Squat', sets: 3, reps: '8-10', muscle: 'Legs' },
      { name: 'Bench Press', sets: 3, reps: '8-10', muscle: 'Chest' },
      { name: 'Barbell Row', sets: 3, reps: '8-10', muscle: 'Back' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders' },
      { name: 'Deadlift', sets: 3, reps: '6-8', muscle: 'Posterior Chain' },
      { name: 'Plank', sets: 3, reps: '60s', muscle: 'Core' }
    ]
  }
];

const SAMPLE_EXERCISES: Exercise[] = [
  { id: '1', name: 'Bench Press', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '2', name: 'Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '3', name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Advanced' },
  { id: '4', name: 'Pull-ups', muscle_group: 'Back', equipment: 'Bodyweight', difficulty: 'Intermediate' },
  { id: '5', name: 'Overhead Press', muscle_group: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '6', name: 'Barbell Row', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '7', name: 'Dumbbell Curl', muscle_group: 'Arms', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: '8', name: 'Tricep Pushdown', muscle_group: 'Arms', equipment: 'Cable', difficulty: 'Beginner' },
  { id: '9', name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'Beginner' },
  { id: '10', name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable', difficulty: 'Beginner' },
  { id: '11', name: 'Push-ups', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '12', name: 'Lunges', muscle_group: 'Legs', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '13', name: 'Plank', muscle_group: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '14', name: 'Leg Curl', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'Beginner' },
  { id: '15', name: 'Face Pulls', muscle_group: 'Shoulders', equipment: 'Cable', difficulty: 'Intermediate' }
];

export default function Train() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchWorkoutHistory(user.id);
    }
    init();
  }, [navigate]);

  async function fetchWorkoutHistory(uid: string) {
    try {
      setLoading(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkoutHistory(data || []);

    } catch (error: any) {
      console.error('Error fetching workout history:', error);
      toast({
        title: "Error loading workout history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleStartWorkout = async (template: any) => {
    if (!userId) return;

    try {
      // Create workout session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          date: today,
          name: template.name,
          workout_type: 'Strength',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create exercise logs
      const exerciseLogs = template.exercises.map((ex: any, index: number) => ({
        workout_session_id: sessionData.id,
        exercise_id: `temp-${index}`, // In real app, lookup from exercises table
        exercise_name: ex.name,
        order_index: index,
        target_sets: ex.sets,
        target_reps: ex.reps,
        sets: []
      }));

      const { error: logsError } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogs);

      if (logsError) throw logsError;

      toast({
        title: "Workout started!",
        description: `${template.name} - Let's crush it! 💪`
      });

      navigate('/workout-in-progress', { state: { workoutId: sessionData.id } });

    } catch (error: any) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = filterMuscle === 'All' || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups = ['All', ...Array.from(new Set(exercises.map(ex => ex.muscle_group)))];

  const completedWorkouts = workoutHistory.filter(w => w.completed_at).length;
  const totalVolume = workoutHistory
    .filter(w => w.completed_at)
    .reduce((sum, w) => sum + (w.total_volume_lbs || 0), 0);
  const avgDuration = workoutHistory.filter(w => w.duration_min).length > 0
    ? Math.round(
        workoutHistory
          .filter(w => w.duration_min)
          .reduce((sum, w) => sum + (w.duration_min || 0), 0) /
        workoutHistory.filter(w => w.duration_min).length
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 animate-bounce mx-auto mb-4 text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Train</h1>
              <p className="text-sm text-muted-foreground">
                Workout plans and exercise library
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Workouts completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(totalVolume).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">lbs lifted this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgDuration} min</div>
              <p className="text-xs text-muted-foreground mt-1">per workout</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          {/* Workout Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORKOUT_TEMPLATES.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge variant="outline">{template.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">{template.exercises.length} Exercises:</p>
                      <div className="space-y-1">
                        {template.exercises.slice(0, 4).map((ex, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{ex.name}</span>
                            <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
                          </div>
                        ))}
                        {template.exercises.length > 4 && (
                          <p className="text-xs text-muted-foreground">
                            +{template.exercises.length - 4} more...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(template)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">{selectedTemplate?.description}</p>
                              <Badge variant="outline">{selectedTemplate?.duration}</Badge>
                            </div>
                            <div>
                              <p className="font-medium mb-2">Exercises:</p>
                              <div className="space-y-2">
                                {selectedTemplate?.exercises.map((ex: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                                    <div>
                                      <p className="font-medium text-sm">{ex.name}</p>
                                      <p className="text-xs text-muted-foreground">{ex.muscle}</p>
                                    </div>
                                    <Badge variant="outline">{ex.sets} × {ex.reps}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button onClick={() => handleStartWorkout(selectedTemplate)} className="w-full">
                              <Play className="w-4 h-4 mr-2" />
                              Start Workout
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button onClick={() => handleStartWorkout(template)} className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workout History */}
          <TabsContent value="history" className="space-y-4">
            {workoutHistory.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Dumbbell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">No workouts yet</p>
                  <p className="text-sm text-muted-foreground">Start your first workout to see it here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {workoutHistory.map(workout => (
                  <Card key={workout.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{workout.name}</h3>
                            {workout.completed_at && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          {workout.completed_at && (
                            <div className="flex gap-4 mt-2 text-sm">
                              {workout.duration_min && (
                                <span className="text-muted-foreground">⏱️ {workout.duration_min} min</span>
                              )}
                              {workout.total_sets && (
                                <span className="text-muted-foreground">📊 {workout.total_sets} sets</span>
                              )}
                              {workout.total_volume_lbs && (
                                <span className="text-muted-foreground">💪 {Math.round(workout.total_volume_lbs)} lbs</span>
                              )}
                            </div>
                          )}
                        </div>
                        {!workout.completed_at && (
                          <Button
                            size="sm"
                            onClick={() => navigate('/workout-in-progress', { state: { workoutId: workout.id } })}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exercise Library */}
          <TabsContent value="exercises" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {muscleGroups.map(muscle => (
                  <Button
                    key={muscle}
                    variant={filterMuscle === muscle ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterMuscle(muscle)}
                  >
                    {muscle}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map(exercise => (
                <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                      <Dumbbell className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold mb-2">{exercise.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{exercise.muscle_group}</Badge>
                      <Badge variant="outline">{exercise.equipment}</Badge>
                      <Badge variant="outline">{exercise.difficulty}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No exercises found</p>
                  <p className="text-sm text-muted-foreground">Try a different search or filter</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
