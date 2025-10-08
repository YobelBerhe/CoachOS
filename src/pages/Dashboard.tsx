import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Activity, LogOut, Utensils, Dumbbell, Timer, Moon, TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DailyTargets {
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
}

interface FoodLog {
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [targets, setTargets] = useState<DailyTargets | null>(null);
  const [logged, setLogged] = useState<FoodLog>({ calories: 0, protein_g: 0, fats_g: 0, carbs_g: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profile) setUserName(profile.full_name || "");

      // Get today's targets
      const today = new Date().toISOString().split('T')[0];
      const { data: targetsData } = await supabase
        .from("daily_targets")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("date", today)
        .single();

      if (targetsData) setTargets(targetsData);

      // Get today's food logs
      const { data: foodLogs } = await supabase
        .from("food_logs")
        .select("calories, protein_g, fats_g, carbs_g")
        .eq("user_id", session.user.id)
        .eq("date", today);

      if (foodLogs) {
        const totals = foodLogs.reduce(
          (acc, log) => ({
            calories: acc.calories + log.calories,
            protein_g: acc.protein_g + Number(log.protein_g),
            fats_g: acc.fats_g + Number(log.fats_g),
            carbs_g: acc.carbs_g + Number(log.carbs_g)
          }),
          { calories: 0, protein_g: 0, fats_g: 0, carbs_g: 0 }
        );
        setLogged(totals);
      }
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const calculateProgress = (logged: number, target: number) => {
    return Math.min((logged / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90 && progress <= 110) return "bg-success";
    if (progress >= 80 && progress <= 120) return "bg-warning";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CoachOS</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {userName}!
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Today's Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Today's Progress</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Score: 85%
            </Badge>
          </div>

          {/* Macro Tracking */}
          {targets && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Calories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {logged.calories} / {targets.calories}
                  </div>
                  <Progress 
                    value={calculateProgress(logged.calories, targets.calories)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {targets.calories - logged.calories} remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(logged.protein_g)}g / {targets.protein_g}g
                  </div>
                  <Progress 
                    value={calculateProgress(logged.protein_g, targets.protein_g)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {targets.protein_g - Math.round(logged.protein_g)}g remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Fats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(logged.fats_g)}g / {targets.fats_g}g
                  </div>
                  <Progress 
                    value={calculateProgress(logged.fats_g, targets.fats_g)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {targets.fats_g - Math.round(logged.fats_g)}g remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Carbs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(logged.carbs_g)}g / {targets.carbs_g}g
                  </div>
                  <Progress 
                    value={calculateProgress(logged.carbs_g, targets.carbs_g)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {targets.carbs_g - Math.round(logged.carbs_g)}g remaining
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Utensils className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1">Log Food</CardTitle>
              <CardDescription>Track your meals</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dumbbell className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1">Log Workout</CardTitle>
              <CardDescription>Record your training</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Timer className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1">Fasting</CardTitle>
              <CardDescription>12:30 until eating</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1">Log Weight</CardTitle>
              <CardDescription>Track progress</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your planned activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Breakfast</p>
                  <p className="text-sm text-muted-foreground">08:00 AM</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Done</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Upper Body Workout</p>
                  <p className="text-sm text-muted-foreground">06:00 PM</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sleep</p>
                  <p className="text-sm text-muted-foreground">Target: 7-9 hours</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
