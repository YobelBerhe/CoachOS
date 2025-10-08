import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseDetailDialog } from "./ExerciseDetailDialog";
import { Search, Dumbbell } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
}

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
}

export const ExerciseLibrary = ({ exercises, onSelectExercise }: ExerciseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || ex.muscle_group === muscleFilter;
    const matchesEquipment = equipmentFilter === "all" || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const muscleGroups = ["all", ...Array.from(new Set(exercises.map(e => e.muscle_group)))];
  const equipmentTypes = ["all", ...Array.from(new Set(exercises.map(e => e.equipment)))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted';
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      setSelectedExercise(exercise);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={muscleFilter} onValueChange={setMuscleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map(muscle => (
                <SelectItem key={muscle} value={muscle}>
                  {muscle === "all" ? "All Muscles" : muscle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map(equip => (
                <SelectItem key={equip} value={equip}>
                  {equip === "all" ? "All Equipment" : equip}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredExercises.map((exercise) => (
            <Card 
              key={exercise.id}
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => handleExerciseClick(exercise)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{exercise.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{exercise.equipment}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {exercise.muscle_group}
                  </Badge>
                </div>
                {exercise.instructions && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {exercise.instructions}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exercises found</p>
          </div>
        )}
      </div>

      <ExerciseDetailDialog
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
};
