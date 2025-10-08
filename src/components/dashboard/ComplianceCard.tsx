import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ComplianceCardProps {
  score: any;
}

export default function ComplianceCard({ score }: ComplianceCardProps) {
  if (!score) return null;

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (value: number) => {
    if (value >= 80) return 'bg-success/10';
    if (value >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const categories = [
    { name: 'Nutrition', score: score.nutrition_score, icon: '🍎' },
    { name: 'Workout', score: score.workout_score, icon: '💪' },
    { name: 'Hydration', score: score.hydration_score || 100, icon: '💧' },
    { name: 'Fasting', score: score.fasting_score, icon: '⏰' },
    { name: 'Sleep', score: score.sleep_score, icon: '😴' }
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Today's Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(cat => (
          <div key={cat.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.name}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(cat.score)}`}>
                {cat.score}%
              </span>
            </div>
            <Progress value={cat.score} className="h-2" />
          </div>
        ))}

        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Overall Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(score.overall_score)}`}>
              {score.overall_score}%
            </span>
          </div>
          <div className={`p-3 rounded-lg ${getScoreBg(score.overall_score)}`}>
            <p className="text-sm text-center">
              {score.overall_score >= 80 && '🎉 Crushing it today!'}
              {score.overall_score >= 60 && score.overall_score < 80 && '💪 Good progress, keep going!'}
              {score.overall_score < 60 && '⚠️ Let\'s improve tomorrow!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
