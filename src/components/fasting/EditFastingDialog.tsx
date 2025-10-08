import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface EditFastingDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentPlan: any;
  onSuccess: () => void;
}

export const EditFastingDialog = ({ 
  open, 
  onClose, 
  userId, 
  currentPlan, 
  onSuccess 
}: EditFastingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(currentPlan?.type || "16:8");
  const [startTime, setStartTime] = useState(currentPlan?.eating_window_start || "12:00");
  const [endTime, setEndTime] = useState(currentPlan?.eating_window_end || "20:00");

  const calculateEndTime = (start: string, fastingType: string) => {
    const [hours, minutes] = start.split(':').map(Number);
    let windowHours = 8;
    
    switch (fastingType) {
      case "16:8": windowHours = 8; break;
      case "18:6": windowHours = 6; break;
      case "20:4": windowHours = 4; break;
      case "OMAD": windowHours = 1; break;
      default: return endTime;
    }

    let endHours = (hours + windowHours) % 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType !== "Custom") {
      const calculatedEnd = calculateEndTime(startTime, newType);
      setEndTime(calculatedEnd);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('fasting_plans')
        .upsert({
          user_id: userId,
          type,
          eating_window_start: startTime,
          eating_window_end: endTime,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Fasting plan updated!",
        description: `Your ${type} schedule is now active`
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
          <DialogTitle>Edit Fasting Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fasting Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:8">16:8 (16h fast, 8h eating)</SelectItem>
                <SelectItem value="18:6">18:6 (18h fast, 6h eating)</SelectItem>
                <SelectItem value="20:4">20:4 (20h fast, 4h eating)</SelectItem>
                <SelectItem value="OMAD">OMAD (One Meal A Day)</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Eating Window Starts</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (type !== "Custom") {
                  setEndTime(calculateEndTime(e.target.value, type));
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Eating Window Ends</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={type !== "Custom"}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
