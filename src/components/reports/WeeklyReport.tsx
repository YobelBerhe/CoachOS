import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WeeklyReportProps {
  week: string;
  compliance: number;
  nutritionDays: number;
  workoutsDone: number;
  workoutsPlanned: number;
  fastingDays: number;
  avgSleep: number;
  medsAdherence: number;
  weightChange: number;
}

export const WeeklyReport = ({
  week,
  compliance,
  nutritionDays,
  workoutsDone,
  workoutsPlanned,
  fastingDays,
  avgSleep,
  medsAdherence,
  weightChange
}: WeeklyReportProps) => {
  const getComplianceColor = () => {
    if (compliance >= 80) return "text-success";
    if (compliance >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Week of {week}</CardTitle>
          <div className={`text-3xl font-bold ${getComplianceColor()}`}>
            {compliance}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Nutrition</span>
              <span className="font-medium">{nutritionDays}/7 days</span>
            </div>
            <Progress value={(nutritionDays / 7) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Workouts</span>
              <span className="font-medium">{workoutsDone}/{workoutsPlanned} completed</span>
            </div>
            <Progress value={(workoutsDone / workoutsPlanned) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Fasting</span>
              <span className="font-medium">{fastingDays}/7 days</span>
            </div>
            <Progress value={(fastingDays / 7) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Sleep Avg</span>
              <span className="font-medium">{avgSleep.toFixed(1)} hours</span>
            </div>
            <Progress value={(avgSleep / 9) * 100} className="h-2" />
          </div>

          {medsAdherence > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Medications</span>
                <span className="font-medium">{medsAdherence}%</span>
              </div>
              <Progress value={medsAdherence} className="h-2" />
            </div>
          )}
        </div>

        {weightChange !== 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weight Change</span>
              <Badge variant={weightChange < 0 ? "default" : "secondary"}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
