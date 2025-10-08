import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().split(' ')[0],
          food_name: formData.food_name,
          calories: parseInt(formData.calories),
          protein_g: parseFloat(formData.protein_g),
          carbs_g: parseFloat(formData.carbs_g),
          fats_g: parseFloat(formData.fats_g),
          serving_size: formData.serving_size
        });

      if (error) throw error;

      toast({
        title: "Food logged!",
        description: `${formData.food_name} added to your diary`
      });

      setFormData({
        food_name: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fats_g: "",
        serving_size: ""
      });
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
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Food</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food_name">Food Name</Label>
            <Input
              id="food_name"
              placeholder="e.g., Chicken Breast"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serving_size">Serving Size</Label>
            <Input
              id="serving_size"
              placeholder="e.g., 100g, 1 cup"
              value={formData.serving_size}
              onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="200"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="30"
                value={formData.protein_g}
                onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="10"
                value={formData.carbs_g}
                onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                placeholder="5"
                value={formData.fats_g}
                onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Logging..." : "Log Food"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
