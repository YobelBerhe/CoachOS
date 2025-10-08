import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell } from "lucide-react";

interface WorkoutTemplate {
  name: string;
  description: string;
  daysPerWeek: number;
  difficulty: string;
  schedule: string[];
}

const templates: WorkoutTemplate[] = [
  {
    name: "5-Day Upper/Lower Split",
    description: "Alternate between upper and lower body for balanced development",
    daysPerWeek: 5,
    difficulty: "Intermediate",
    schedule: ["Upper A", "Lower A", "Rest", "Upper B", "Lower B", "Upper C", "Rest"]
  },
  {
    name: "3-Day Full Body",
    description: "Hit all muscle groups 3x per week for beginners",
    daysPerWeek: 3,
    difficulty: "Beginner",
    schedule: ["Full Body A", "Rest", "Full Body B", "Rest", "Full Body C", "Rest", "Rest"]
  },
  {
    name: "6-Day Push/Pull/Legs",
    description: "High frequency split for advanced lifters",
    daysPerWeek: 6,
    difficulty: "Advanced",
    schedule: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B", "Rest"]
  },
  {
    name: "4-Day Upper/Lower",
    description: "Classic split for balanced muscle development",
    daysPerWeek: 4,
    difficulty: "Intermediate",
    schedule: ["Upper A", "Lower A", "Rest", "Upper B", "Lower B", "Rest", "Rest"]
  }
];

interface WorkoutTemplatesProps {
  onSelectTemplate?: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplates = ({ onSelectTemplate }: WorkoutTemplatesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card key={template.name} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
              <Badge variant="outline">{template.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{template.daysPerWeek} days/week</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span>{template.schedule.filter(d => d !== "Rest").length} workouts</span>
              </div>
            </div>

            <div className="flex gap-1">
              {template.schedule.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-8 rounded text-[10px] flex items-center justify-center font-medium ${
                    day === "Rest" 
                      ? "bg-muted text-muted-foreground" 
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {day === "Rest" ? "R" : "W"}
                </div>
              ))}
            </div>

            {onSelectTemplate && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => onSelectTemplate(template)}
              >
                Use This Program
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
