import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateComplianceScore } from "@/lib/compliance";

interface ComplianceCardProps {
  userId: string;
}

export const ComplianceCard = ({ userId }: ComplianceCardProps) => {
  const [score, setScore] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchOrCalculateScore();
  }, [userId]);

  const fetchOrCalculateScore = async () => {
    // Try to get existing score
    const { data: existingScore } = await supabase
      .from('compliance_scores')
      .select('overall_score')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (existingScore) {
      setScore(existingScore.overall_score);
    } else {
      // Calculate new score
      const newScore = await calculateComplianceScore(userId, today);
      if (newScore) {
        setScore(newScore.overall_score);
      }
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Crushing it!";
    if (score >= 60) return "Good effort";
    if (score > 0) return "Keep going";
    return "Let's get started";
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Today's Compliance</span>
          <span className={`text-2xl font-bold ${getScoreColor()}`}>
            {score}%
          </span>
        </div>
        <Progress value={score} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">{getScoreLabel()}</p>
      </CardContent>
    </Card>
  );
};
