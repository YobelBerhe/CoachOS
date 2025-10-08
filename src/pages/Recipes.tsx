import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  image_url: string | null;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number;
  calories_per_serving: number | null;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fats_g_per_serving: number | null;
  ingredients: any;
  instructions: any;
}

const Recipes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchRecipes();
      }
    });
  }, [navigate]);

  useEffect(() => {
    let filtered = recipes;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, categoryFilter, recipes]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('name');

      if (error) throw error;
      if (data) {
        setRecipes(data);
        setFilteredRecipes(data);
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const logRecipeAsMeal = async (recipe: Recipe) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          food_name: recipe.name,
          serving_size: `${recipe.servings} servings`,
          calories: (recipe.calories_per_serving || 0) * recipe.servings,
          protein_g: (recipe.protein_g_per_serving || 0) * recipe.servings,
          carbs_g: (recipe.carbs_g_per_serving || 0) * recipe.servings,
          fats_g: (recipe.fats_g_per_serving || 0) * recipe.servings,
          meal_type: getMealType()
        });

      if (error) throw error;

      toast({
        title: "Meal logged!",
        description: `${recipe.name} added to your food log`
      });

      setSelectedRecipe(null);
      navigate("/eat");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Breakfast";
    if (hour < 16) return "Lunch";
    if (hour < 20) return "Dinner";
    return "Snack";
  };

  const categories = ["all", ...Array.from(new Set(recipes.map(r => r.category)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/eat")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Recipes</h1>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found. Coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <Dialog open={true} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecipe.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRecipe.image_url && (
                <img 
                  src={selectedRecipe.image_url} 
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              {selectedRecipe.description && (
                <p className="text-muted-foreground">{selectedRecipe.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRecipe.calories_per_serving}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRecipe.protein_g_per_serving}</p>
                  <p className="text-xs text-muted-foreground">Protein (g)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRecipe.carbs_g_per_serving}</p>
                  <p className="text-xs text-muted-foreground">Carbs (g)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRecipe.fats_g_per_serving}</p>
                  <p className="text-xs text-muted-foreground">Fats (g)</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.map((ing: any, idx: number) => (
                    <li key={idx}>{ing.amount} {ing.unit} {ing.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {Array.isArray(selectedRecipe.instructions) && selectedRecipe.instructions.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedRecipe(null)} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => logRecipeAsMeal(selectedRecipe)} className="flex-1">
                  Log This Meal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Recipes;
