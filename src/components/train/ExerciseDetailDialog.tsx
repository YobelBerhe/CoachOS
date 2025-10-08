import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
  video_url?: string;
  gif_url?: string;
}

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export const ExerciseDetailDialog = ({ 
  exercise, 
  open, 
  onClose,
  onAddToWorkout 
}: ExerciseDetailDialogProps) => {
  if (!exercise) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span>{exercise.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {exercise.gif_url && (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <img 
                src={exercise.gif_url} 
                alt={exercise.name}
                className="max-h-full object-contain"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Badge variant="secondary">{exercise.muscle_group}</Badge>
            <Badge variant="secondary">{exercise.equipment}</Badge>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>

          {exercise.instructions && (
            <div>
              <h3 className="font-semibold mb-2">How to Perform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.instructions}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {onAddToWorkout && (
              <Button 
                onClick={() => {
                  onAddToWorkout(exercise);
                  onClose();
                }} 
                className="flex-1"
              >
                Add to Workout
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
