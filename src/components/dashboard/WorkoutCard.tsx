import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";

interface WorkoutCardProps {
  userId: string;
}

export const WorkoutCard = ({ userId }: WorkoutCardProps) => {
  const [workout, setWorkout] = useState<any>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchWorkout();
  }, [userId]);

  const fetchWorkout = async () => {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (data) setWorkout(data);
  };

  const startWorkout = async () => {
    if (!workout) {
      // Create a new workout session
      const { data } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          date: today,
          name: "Today's Workout"
        })
        .select()
        .single();
      
      if (data) setWorkout(data);
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="workout" className="border-none">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">Workout</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {workout?.completed_at ? "Completed ✓" : "Not started"}
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0 space-y-4">
              {!workout ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">No workout scheduled</p>
                  <Button onClick={startWorkout} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                </div>
              ) : workout.completed_at ? (
                <div className="text-center py-4">
                  <p className="text-sm font-medium mb-2">🎉 Workout Complete!</p>
                  <p className="text-xs text-muted-foreground">
                    Finished at {new Date(workout.completed_at).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm">Ready to train? Let's go!</p>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};
