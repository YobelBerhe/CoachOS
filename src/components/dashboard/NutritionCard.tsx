import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";
import { AddFoodDialog } from "@/components/nutrition/AddFoodDialog";

interface NutritionCardProps {
  userId: string;
}

export const NutritionCard = ({ userId }: NutritionCardProps) => {
  const [targets, setTargets] = useState<any>(null);
  const [logged, setLogged] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [meals, setMeals] = useState<any[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    // Fetch targets
    const { data: targetData } = await supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (targetData) setTargets(targetData);

    // Fetch food logs
    const { data: foodData } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
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

  if (!targets) return null;

  const caloriePercent = (logged.calories / targets.calories) * 100;

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="nutrition" className="border-none">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-base">Nutrition</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {logged.calories} / {targets.calories} cal ({Math.round(caloriePercent)}%)
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Protein</span>
                    <span className="font-medium">{logged.protein}g / {targets.protein_g}g</span>
                  </div>
                  <Progress value={(logged.protein / targets.protein_g) * 100} className="h-1.5" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbs</span>
                    <span className="font-medium">{logged.carbs}g / {targets.carbs_g}g</span>
                  </div>
                  <Progress value={(logged.carbs / targets.carbs_g) * 100} className="h-1.5" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fats</span>
                    <span className="font-medium">{logged.fats}g / {targets.fats_g}g</span>
                  </div>
                  <Progress value={(logged.fats / targets.fats_g) * 100} className="h-1.5" />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium">Today's Meals ({meals.length})</p>
                  {meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No meals logged yet</p>
                  ) : (
                    <div className="space-y-2">
                      {meals.map((meal) => (
                        <div key={meal.id} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                          <div>
                            <p className="font-medium">{meal.food_name}</p>
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          </div>
                          <span className="font-medium">{meal.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={() => setShowAddFood(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Food
                </Button>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <AddFoodDialog 
        open={showAddFood} 
        onClose={() => setShowAddFood(false)}
        userId={userId}
        onSuccess={fetchData}
      />
    </>
  );
};
