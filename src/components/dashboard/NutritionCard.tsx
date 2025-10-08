import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";
import { AddFoodDialog } from "@/components/nutrition/AddFoodDialog";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface NutritionCardProps {
  userId: string;
}

export const NutritionCard = ({ userId }: NutritionCardProps) => {
  const navigate = useNavigate();
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
  const remaining = Math.max(0, targets.calories - logged.calories);

  const calorieData = [
    { name: 'Consumed', value: logged.calories, color: 'hsl(var(--primary))' },
    { name: 'Remaining', value: remaining, color: 'hsl(var(--muted))' }
  ];

  const macroData = [
    { name: 'Protein', value: logged.protein, target: targets.protein_g, color: 'hsl(145, 65%, 45%)' },
    { name: 'Carbs', value: logged.carbs, target: targets.carbs_g, color: 'hsl(195, 85%, 45%)' },
    { name: 'Fats', value: logged.fats, target: targets.fats_g, color: 'hsl(38, 92%, 50%)' }
  ];

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
                    <CardTitle className="text-base">Eat 🍽️</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {logged.calories} / {targets.calories} cal ({Math.round(caloriePercent)}%)
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0 space-y-4">
                {/* Circular Progress Charts */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Main Calorie Ring */}
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width={80} height={80}>
                      <PieChart>
                        <Pie
                          data={calorieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={35}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {calorieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs font-medium mt-1">Calories</p>
                    <p className="text-xs text-muted-foreground">{Math.round(caloriePercent)}%</p>
                  </div>

                  {/* Macro Rings */}
                  {macroData.map((macro, idx) => {
                    const macroPercent = (macro.value / macro.target) * 100;
                    const macroRemaining = Math.max(0, macro.target - macro.value);
                    const data = [
                      { value: macro.value, color: macro.color },
                      { value: macroRemaining, color: 'hsl(var(--muted))' }
                    ];
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <ResponsiveContainer width={70} height={70}>
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={30}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <p className="text-xs font-medium mt-1">{macro.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(macroPercent)}%</p>
                      </div>
                    );
                  })}
                </div>

                {/* Meal Timeline */}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium">Today's Meals ({meals.length})</p>
                  {meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No meals logged yet</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setShowAddFood(true)} variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Food
                  </Button>
                  <Button onClick={() => navigate('/recipes')} variant="outline">
                    Browse Recipes
                  </Button>
                </div>
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
