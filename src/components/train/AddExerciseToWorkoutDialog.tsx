import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseLibrary } from "./ExerciseLibrary";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
}

interface AddExerciseToWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

export const AddExerciseToWorkoutDialog = ({ 
  open, 
  onClose, 
  exercises,
  onSelectExercise 
}: AddExerciseToWorkoutDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Exercise to Workout</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <ExerciseLibrary 
            exercises={exercises} 
            onSelectExercise={(exercise) => {
              onSelectExercise(exercise);
              onClose();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
