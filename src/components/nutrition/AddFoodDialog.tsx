import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { calculateComplianceScore } from "@/lib/compliance";
import AllergyWarningDialog from "@/components/food/AllergyWarningDialog";
import { motion } from 'framer-motion';
import { Apple, Utensils, Flame, Droplet } from 'lucide-react';

interface AddFoodDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const AddFoodDialog = ({ open, onClose, userId, onSuccess }: AddFoodDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
    serving_size: ""
  });
  
  // Allergy checking state
  const [showAllergyWarning, setShowAllergyWarning] = useState(false);
  const [detectedAllergens, setDetectedAllergens] = useState<string[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Auto-detect if food is a beverage
  const isBeverage = formData.food_name.toLowerCase().match(
    /(water|juice|coffee|tea|milk|smoothie|shake|drink|soda|latte|cappuccino|espresso)/
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for allergens first
    if (!pendingSubmit) {
      await checkForAllergens();
      return;
    }

    // Actually submit the food
    await submitFood();
  };

  async function checkForAllergens() {
    try {
      setLoading(true);

      // Call the allergen detection function
      const { data: allergens, error } = await supabase.rpc('check_food_allergens', {
        p_user_id: userId,
        p_food_name: formData.food_name
      });

      if (error) throw error;

      if (allergens && allergens.length > 0) {
        setDetectedAllergens(allergens);
        setShowAllergyWarning(true);
      } else {
        // No allergens detected, proceed
        setPendingSubmit(true);
        await submitFood();
      }
    } catch (error: any) {
      console.error('Error checking allergens:', error);
      // If checking fails, allow submission anyway
      setPendingSubmit(true);
      await submitFood();
    } finally {
      setLoading(false);
    }
  }

  async function submitFood() {
    setLoading(true);

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          date: today,
          time: now.toTimeString().split(' ')[0],
          food_name: formData.food_name,
          calories: parseInt(formData.calories),
          protein_g: parseFloat(formData.protein_g),
          carbs_g: parseFloat(formData.carbs_g),
          fats_g: parseFloat(formData.fats_g),
          serving_size: formData.serving_size,
          is_beverage: isBeverage ? true : false,
          hydration_ml: isBeverage ? 250 : 0,
          contains_allergens: detectedAllergens.length > 0 ? detectedAllergens : [],
          allergen_warning_shown: detectedAllergens.length > 0
        });

      if (error) throw error;

      // Recalculate compliance score
      await calculateComplianceScore(userId, today);

      toast({
        title: "Food logged! 🍽️",
        description: `${formData.food_name} added to your diary`
      });

      // Reset form
      setFormData({
        food_name: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fats_g: "",
        serving_size: ""
      });
      setDetectedAllergens([]);
      setPendingSubmit(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg border-0 p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Gradient Header */}
            <div className="relative h-32 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6 flex items-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
              <div className="relative flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg"
                >
                  <Apple className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-white">
                  <DialogTitle className="text-2xl font-bold mb-1">Log Food</DialogTitle>
                  <p className="text-sm text-white/80">Track your nutrition</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-background">
              {/* Food Name */}
              <div className="space-y-2">
                <Label htmlFor="food_name" className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Food Name
                </Label>
                <Input
                  id="food_name"
                  placeholder="e.g., Grilled Chicken Breast"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  required
                  className="h-12"
                />
                {isBeverage && (
                  <Badge variant="secondary" className="text-xs">
                    <Droplet className="w-3 h-3 mr-1" />
                    Beverage detected - will count toward hydration
                  </Badge>
                )}
              </div>

              {/* Serving Size */}
              <div className="space-y-2">
                <Label htmlFor="serving_size">Serving Size</Label>
                <Input
                  id="serving_size"
                  placeholder="e.g., 100g, 1 cup, 1 medium"
                  value={formData.serving_size}
                  onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Calories
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="200"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-green-600">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.protein_g}
                    onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-blue-600">
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={formData.carbs_g}
                    onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fats" className="text-yellow-600">
                    Fats (g)
                  </Label>
                  <Input
                    id="fats"
                    type="number"
                    step="0.1"
                    placeholder="5"
                    value={formData.fats_g}
                    onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {loading ? "Checking..." : "Log Food"}
                </Button>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Allergy Warning Dialog */}
      <AllergyWarningDialog
        open={showAllergyWarning}
        onClose={() => {
          setShowAllergyWarning(false);
          setPendingSubmit(false);
        }}
        foodName={formData.food_name}
        detectedAllergens={detectedAllergens}
        userId={userId}
        onProceed={() => {
          setPendingSubmit(true);
          submitFood();
        }}
      />
    </>
  );
};
