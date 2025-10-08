import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Play, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutCardProps {
  workout: any;
  userId: string | undefined;
  date: string;
}

export default function WorkoutCard({ workout, userId, date }: WorkoutCardProps) {
  const navigate = useNavigate();

  const isCompleted = workout?.completed_at !== null;
  const exerciseCount = workout?.exercise_logs?.length || 0;
  const completedExercises = workout?.exercise_logs?.filter((log: any) => 
    log.sets && Array.isArray(log.sets) && log.sets.length > 0
  ).length || 0;

  const workoutName = workout?.name || 'No workout scheduled';
  const scheduledTime = workout?.scheduled_time || null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="workout" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 rounded-t-lg transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
              }`}>
                <Dumbbell className={`w-5 h-5 ${
                  isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Workout</p>
                <p className="text-sm text-muted-foreground">
                  {isCompleted ? (
                    <>✓ {workoutName} - Completed</>
                  ) : workout ? (
                    <>{workoutName} {scheduledTime && `- ${scheduledTime}`}</>
                  ) : (
                    'No workout today'
                  )}
                </p>
              </div>
            </div>
            {workout && (
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {completedExercises}/{exerciseCount}
              </Badge>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <CardContent className="space-y-4 pt-4">
            {!workout ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">No workout scheduled</p>
                <p className="text-xs text-muted-foreground">Create a workout plan to get started</p>
              </div>
            ) : (
              <>
                {/* Workout Info */}
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="font-medium">{workoutName}</p>
                    {scheduledTime && (
                      <p className="text-sm text-muted-foreground">Scheduled: {scheduledTime}</p>
                    )}
                    {isCompleted && workout.duration_min && (
                      <p className="text-sm text-muted-foreground">Duration: {workout.duration_min} min</p>
                    )}
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  )}
                </div>

                {/* Exercise List */}
                {workout.exercise_logs && workout.exercise_logs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Exercises</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {workout.exercise_logs.map((log: any, index: number) => {
                        const setsCompleted = log.sets?.length || 0;
                        const targetSets = log.target_sets || 3;
                        
                        return (
                          <div 
                            key={log.id} 
                            className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{log.exercise_name}</p>
                                {log.sets && log.sets.length > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    {log.sets.map((set: any) => 
                                      `${set.weight_lbs}lbs × ${set.reps}`
                                    ).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={setsCompleted >= targetSets ? 'default' : 'outline'}>
                              {setsCompleted}/{targetSets} sets
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {isCompleted && (
                  <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{workout.total_sets || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Sets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{workout.total_reps || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Reps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.round(workout.total_volume_lbs || 0)}</p>
                      <p className="text-xs text-muted-foreground">Volume (lbs)</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {!isCompleted ? (
                    <>
                      <Button
                        onClick={() => navigate('/workout-in-progress', { state: { workoutId: workout.id } })}
                        className="flex-1"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {workout.started_at ? 'Continue Workout' : 'Start Workout'}
                      </Button>
                      <Button
                        onClick={() => navigate('/train')}
                        variant="outline"
                        size="sm"
                      >
                        View Plan
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => navigate('/train')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Workout History
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
