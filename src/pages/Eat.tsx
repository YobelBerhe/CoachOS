import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus } from "lucide-react";
import { AddFoodDialog } from "@/components/nutrition/AddFoodDialog";

const Eat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [targets, setTargets] = useState<any>(null);
  const [logged, setLogged] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [meals, setMeals] = useState<any[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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
    const { data: targetData } = await supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', uid)
      .eq('date', today)
      .single();
    
    if (targetData) setTargets(targetData);

    const { data: foodData } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', uid)
      .eq('date', today)
      .order('time', { ascending: true });
    
    if (foodData) {
      setMeals(foodData);
      const totals = foodData.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + Number(meal.protein_g),
        carbs: acc.carbs + Number(meal.carbs_g),
        fats: acc.fats + Number(meal.fats_g)
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setLogged(totals);
    }
  };

  if (!userId || !targets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nutrition</h1>
            <p className="text-sm text-muted-foreground">Track your meals and macros</p>
          </div>
        </header>

        {/* Daily Summary */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-1">
                {logged.calories} <span className="text-xl text-muted-foreground">/ {targets.calories}</span>
              </div>
              <p className="text-sm text-muted-foreground">calories</p>
              <Progress value={(logged.calories / targets.calories) * 100} className="h-2 mt-2" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{logged.protein}g</div>
                <p className="text-xs text-muted-foreground">Protein</p>
                <Progress value={(logged.protein / targets.protein_g) * 100} className="h-1.5 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{targets.protein_g}g goal</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{logged.carbs}g</div>
                <p className="text-xs text-muted-foreground">Carbs</p>
                <Progress value={(logged.carbs / targets.carbs_g) * 100} className="h-1.5 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{targets.carbs_g}g goal</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{logged.fats}g</div>
                <p className="text-xs text-muted-foreground">Fats</p>
                <Progress value={(logged.fats / targets.fats_g) * 100} className="h-1.5 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{targets.fats_g}g goal</p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => navigate("/recipes")}>
                Browse Recipes
              </Button>
              <Button size="sm" onClick={() => setShowAddFood(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Food
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meal Timeline */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No meals logged yet</p>
                <Button onClick={() => setShowAddFood(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Meal
                </Button>
              </div>
            ) : (
              <>
                {meals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{meal.food_name}</p>
                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                      <p className="text-sm mt-1">
                        P: {meal.protein_g}g • C: {meal.carbs_g}g • F: {meal.fats_g}g
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{meal.calories}</p>
                      <p className="text-xs text-muted-foreground">cal</p>
                    </div>
                  </div>
                ))}
                <Button onClick={() => setShowAddFood(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meal
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddFoodDialog 
        open={showAddFood} 
        onClose={() => setShowAddFood(false)}
        userId={userId}
        onSuccess={() => fetchData(userId)}
      />
    </div>
  );
};

export default Eat;
