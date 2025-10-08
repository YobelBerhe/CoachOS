import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UpdateGoalsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export const UpdateGoalsDialog = ({ open, onClose, userId }: UpdateGoalsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    aggression: "",
    current_weight_kg: "",
    target_weight_kg: ""
  });

  useEffect(() => {
    if (open) {
      fetchGoals();
    }
  }, [open]);

  const fetchGoals = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          type: data.type || "",
          aggression: data.aggression || "",
          current_weight_kg: data.current_weight_kg?.toString() || "",
          target_weight_kg: data.target_weight_kg?.toString() || ""
        });
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Failed to load goals data",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if goal exists
      const { data: existingGoal } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      const goalData = {
        type: formData.type,
        aggression: formData.aggression,
        current_weight_kg: parseFloat(formData.current_weight_kg),
        target_weight_kg: parseFloat(formData.target_weight_kg),
        user_id: userId,
        is_active: true
      };

      if (existingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from("goals")
          .update(goalData)
          .eq("id", existingGoal.id);

        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await supabase
          .from("goals")
          .insert([goalData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Goals updated successfully"
      });
      onClose();
    } catch (error) {
      console.error("Error updating goals:", error);
      toast({
        title: "Error",
        description: "Failed to update goals",
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
          <DialogTitle>Update Goals</DialogTitle>
        </DialogHeader>
        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Goal Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="recomp">Body Recomposition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggression">Aggression Level</Label>
              <Select value={formData.aggression} onValueChange={(value) => setFormData({ ...formData, aggression: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aggression level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (0.5% per week)</SelectItem>
                  <SelectItem value="moderate">Moderate (1% per week)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (1.5% per week)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_weight">Current Weight (kg)</Label>
              <Input
                id="current_weight"
                type="number"
                step="0.1"
                value={formData.current_weight_kg}
                onChange={(e) => setFormData({ ...formData, current_weight_kg: e.target.value })}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_weight">Target Weight (kg)</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                value={formData.target_weight_kg}
                onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                required
                min="1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Goals
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
