import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface AddMedicationDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const AddMedicationDialog = ({ open, onClose, userId, onSuccess }: AddMedicationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [time, setTime] = useState("09:00");
  const [takeWithFood, setTakeWithFood] = useState(false);
  const [pillsPerBottle, setPillsPerBottle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const times = [time];
      
      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: userId,
          name,
          dosage,
          frequency,
          times: JSON.stringify(times),
          take_with_food: takeWithFood,
          pills_per_bottle: pillsPerBottle ? parseInt(pillsPerBottle) : null,
          current_pills: pillsPerBottle ? parseInt(pillsPerBottle) : null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Medication added!",
        description: `${name} has been added to your schedule`
      });

      setName("");
      setDosage("");
      setFrequency("Daily");
      setTime("09:00");
      setTakeWithFood(false);
      setPillsPerBottle("");
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
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name</Label>
            <Input
              id="name"
              placeholder="e.g., Vitamin D"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              placeholder="e.g., 1000 IU"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Twice daily">Twice daily</SelectItem>
                <SelectItem value="Three times daily">Three times daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="As needed">As needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="takeWithFood"
              checked={takeWithFood}
              onCheckedChange={(checked) => setTakeWithFood(checked as boolean)}
            />
            <Label htmlFor="takeWithFood" className="font-normal">
              Take with food
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pillsPerBottle">Pills per bottle (optional)</Label>
            <Input
              id="pillsPerBottle"
              type="number"
              placeholder="30"
              value={pillsPerBottle}
              onChange={(e) => setPillsPerBottle(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Medication"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
