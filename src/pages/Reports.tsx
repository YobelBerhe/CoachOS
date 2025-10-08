import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeightChart } from "@/components/reports/WeightChart";
import { WeeklyReport } from "@/components/reports/WeeklyReport";
import { AddWeightDialog } from "@/components/weight/AddWeightDialog";
import { ArrowLeft, Plus, TrendingDown, TrendingUp, Target } from "lucide-react";

interface WeightData {
  date: string;
  weight: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [weightLogs, setWeightLogs] = useState<WeightData[]>([]);
  const [goalWeight, setGoalWeight] = useState(0);
  const [startWeight, setStartWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const [weightsResult, goalResult] = await Promise.all([
        supabase
          .from('weight_logs')
          .select('date, weight_kg')
          .eq('user_id', uid)
          .order('date', { ascending: true })
          .limit(90),
        supabase
          .from('goals')
          .select('target_weight_kg, current_weight_kg')
          .eq('user_id', uid)
          .eq('is_active', true)
          .single()
      ]);

      if (weightsResult.data && weightsResult.data.length > 0) {
        const weights = weightsResult.data.map(w => ({
          date: w.date,
          weight: w.weight_kg
        }));
        setWeightLogs(weights);
        setStartWeight(weights[0].weight);
        setCurrentWeight(weights[weights.length - 1].weight);
      }

      if (goalResult.data) {
        setGoalWeight(goalResult.data.target_weight_kg);
        if (weightLogs.length === 0) {
          setCurrentWeight(goalResult.data.current_weight_kg);
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (startWeight === 0 || goalWeight === 0) return 0;
    const totalChange = Math.abs(goalWeight - startWeight);
    const currentChange = Math.abs(startWeight - currentWeight);
    return Math.min((currentChange / totalChange) * 100, 100);
  };

  const calculateWeeksToGoal = () => {
    if (weightLogs.length < 2) return null;
    
    const recent = weightLogs.slice(-14);
    if (recent.length < 2) return null;
    
    const weeklyChange = (recent[recent.length - 1].weight - recent[0].weight) / (recent.length / 7);
    const remaining = Math.abs(currentWeight - goalWeight);
    
    if (Math.abs(weeklyChange) < 0.1) return null;
    
    return Math.ceil(remaining / Math.abs(weeklyChange));
  };

  const weeksToGoal = calculateWeeksToGoal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Reports & Progress</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Weight Stats</h3>
              <Button size="sm" onClick={() => setShowWeightDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Weight
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current</p>
                <p className="text-2xl font-bold">{currentWeight.toFixed(1)} kg</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Goal</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Target className="h-5 w-5" />
                  {goalWeight.toFixed(1)} kg
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                  {currentWeight < startWeight ? (
                    <TrendingDown className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                  {Math.abs(startWeight - currentWeight).toFixed(1)} kg
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">To Goal</p>
                <p className="text-2xl font-bold">{Math.abs(currentWeight - goalWeight).toFixed(1)} kg</p>
              </div>
            </div>

            {weeksToGoal && (
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Projected Goal Date</p>
                <p className="font-semibold">
                  ~{weeksToGoal} weeks ({new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})
                </p>
                <Badge variant="outline" className="mt-2">
                  {calculateProgress().toFixed(0)}% Complete
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {weightLogs.length > 0 && (
          <WeightChart data={weightLogs} goalWeight={goalWeight} />
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold">Weekly Summaries</h2>
          <WeeklyReport
            week="Oct 1 - Oct 7"
            compliance={0}
            nutritionDays={0}
            workoutsDone={0}
            workoutsPlanned={7}
            fastingDays={0}
            avgSleep={0}
            medsAdherence={0}
            weightChange={0}
          />
          <p className="text-sm text-muted-foreground text-center py-4">
            More weekly reports coming soon...
          </p>
        </div>
      </div>

      {userId && (
        <AddWeightDialog
          open={showWeightDialog}
          onClose={() => setShowWeightDialog(false)}
          userId={userId}
          onSuccess={() => fetchData(userId)}
        />
      )}
    </div>
  );
};

export default Reports;
