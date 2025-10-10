import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ChefHat,
  Sparkles,
  Clock,
  Users,
  DollarSign,
  Leaf,
  CheckCircle2,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface ExpiringItem {
  id: string;
  item_name: string;
  category: string;
  daysUntilExpiration: number;
  estimated_cost: number;
  carbon_footprint: number;
}

interface GeneratedRecipe {
  recipe_name: string;
  cuisine_type: string;
  prep_time: string;
  servings: number;
  difficulty: string;
  ingredients: Array<{
    item: string;
    amount: string;
    from_inventory: boolean;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  items_rescued: number;
  money_saved: number;
  carbon_saved: number;
}

const RECIPE_TEMPLATES = [
  {
    name: "Quick Stir Fry",
    matches: ['chicken', 'vegetables', 'rice'],
    recipe: (items: string[]) => ({
      recipe_name: `Asian-Style ${items[0]} Stir Fry`,
      cuisine_type: "Asian",
      prep_time: "20 mins",
      servings: 4,
      difficulty: "Easy",
      ingredients: [
        { item: items[0] || 'Protein', amount: '1 lb', from_inventory: true },
        { item: 'Mixed vegetables', amount: '2 cups', from_inventory: true },
        { item: 'Soy sauce', amount: '3 tbsp', from_inventory: false },
        { item: 'Garlic', amount: '2 cloves', from_inventory: false },
        { item: 'Rice', amount: '2 cups cooked', from_inventory: false }
      ],
      instructions: [
        'Heat oil in a large wok or skillet over high heat',
        `Cut ${items[0]} into bite-sized pieces and cook until golden`,
        'Add vegetables and stir fry for 3-4 minutes',
        'Add minced garlic and soy sauce, toss to combine',
        'Serve hot over steamed rice',
        'Garnish with sesame seeds if desired'
      ],
      nutrition: { calories: 420, protein: 35, carbs: 48, fats: 12 }
    })
  }
];

export default function RescueRecipes() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadExpiringItems();
  }, []);

  async function loadExpiringItems() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'expiring_soon');

      if (error) throw error;

      const today = new Date();
      const items = (data || []).map(item => {
        const expDate = new Date(item.expiration_date);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: item.id,
          item_name: item.item_name,
          category: item.category,
          daysUntilExpiration: diffDays,
          estimated_cost: item.estimated_cost,
          carbon_footprint: item.carbon_footprint
        };
      });

      setExpiringItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  function toggleItem(itemId: string) {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }

  async function generateRecipe() {
    if (selectedItems.length === 0) {
      toast({
        title: "Select items first",
        description: "Choose at least one expiring item",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const selectedItemNames = expiringItems
        .filter(item => selectedItems.includes(item.id))
        .map(item => item.item_name.toLowerCase());

      const template = RECIPE_TEMPLATES[0];
      const baseRecipe = template.recipe(selectedItemNames);

      const selectedItemsData = expiringItems.filter(item => selectedItems.includes(item.id));
      const totalCost = selectedItemsData.reduce((sum, item) => sum + item.estimated_cost, 0);
      const totalCarbon = selectedItemsData.reduce((sum, item) => sum + item.carbon_footprint, 0);

      const recipe: GeneratedRecipe = {
        ...baseRecipe,
        items_rescued: selectedItems.length,
        money_saved: totalCost,
        carbon_saved: totalCarbon
      };

      setGeneratedRecipe(recipe);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Recipe generated! 👨‍🍳",
        description: recipe.recipe_name
      });

    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error generating recipe",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveRecipe() {
    if (!generatedRecipe) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('rescue_recipes')
        .insert({
          user_id: user.id,
          recipe_name: generatedRecipe.recipe_name,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions.join('\n'),
          items_rescued: generatedRecipe.items_rescued,
          money_saved: generatedRecipe.money_saved,
          carbon_saved: generatedRecipe.carbon_saved
        });

      if (error) throw error;

      toast({
        title: "Recipe saved! 📖",
        description: "Find it in your recipe collection"
      });

    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-500/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/food-waste')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-500" />
                AI Rescue Recipes
              </h1>
              <p className="text-sm text-muted-foreground">
                Turn expiring food into delicious meals
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">
                  Select Items to Rescue ({selectedItems.length} selected)
                </h3>

                {expiringItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No expiring items found</p>
                    <Button onClick={() => navigate('/fridge-scanner')}>
                      Add Items
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expiringItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedItems.includes(item.id)
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-border hover:border-orange-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{item.item_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Expires in {item.daysUntilExpiration} day{item.daysUntilExpiration !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {selectedItems.includes(item.id) && (
                            <CheckCircle2 className="w-6 h-6 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={generateRecipe}
                  disabled={selectedItems.length === 0 || isGenerating}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 h-12"
                >
                  {isGenerating ? 'Generating...' : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Recipe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            {generatedRecipe ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-0 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{generatedRecipe.recipe_name}</h2>
                        <Badge className="bg-orange-500 mb-2">{generatedRecipe.cuisine_type}</Badge>
                      </div>
                      <Button onClick={saveRecipe} variant="outline" className="gap-2">
                        <Star className="w-4 h-4" />
                        Save
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="p-3 rounded-lg bg-secondary text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-xs font-semibold">{generatedRecipe.prep_time}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-xs font-semibold">{generatedRecipe.servings} servings</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary text-center">
                        <ChefHat className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                        <p className="text-xs font-semibold">{generatedRecipe.difficulty}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 mb-6">
                      <p className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        Environmental Impact
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{generatedRecipe.items_rescued} items</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span>${generatedRecipe.money_saved.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Leaf className="w-4 h-4 text-blue-500" />
                          <span>{generatedRecipe.carbon_saved.toFixed(2)}kg CO2</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold mb-3">Ingredients</h3>
                      <div className="space-y-2">
                        {generatedRecipe.ingredients.map((ing, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-2 rounded ${
                            ing.from_inventory ? 'bg-green-500/10' : 'bg-secondary'
                          }`}>
                            {ing.from_inventory && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <span className="text-sm">
                              {ing.amount} {ing.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-3">Instructions</h3>
                      <ol className="space-y-3">
                        {generatedRecipe.instructions.map((step, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Recipe Yet</h3>
                  <p className="text-muted-foreground">
                    Select items and generate a recipe!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
