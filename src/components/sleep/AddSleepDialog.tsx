import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { calculateComplianceScore } from "@/lib/compliance";

interface AddSleepDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const AddSleepDialog = ({ open, onClose, userId, onSuccess }: AddSleepDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bedtime: "22:00",
    wake_time: "06:00",
    quality: "7"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate duration in minutes
      const [bedHour, bedMin] = formData.bedtime.split(':').map(Number);
      const [wakeHour, wakeMin] = formData.wake_time.split(':').map(Number);
      
      let durationMin = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
      if (durationMin < 0) durationMin += 24 * 60; // Handle overnight sleep

      const { error } = await supabase
        .from('sleep_logs')
        .insert({
          user_id: userId,
          date: today,
          bedtime: formData.bedtime,
          wake_time: formData.wake_time,
          duration_min: durationMin,
          quality: parseInt(formData.quality)
        });

      if (error) throw error;

      // Recalculate compliance score
      await calculateComplianceScore(userId, today);

      toast({
        title: "Sleep logged!",
        description: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m recorded`
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
          <DialogTitle>Log Sleep</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bedtime">Bedtime</Label>
            <Input
              id="bedtime"
              type="time"
              value={formData.bedtime}
              onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wake_time">Wake Time</Label>
            <Input
              id="wake_time"
              type="time"
              value={formData.wake_time}
              onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Quality (1-10)</Label>
            <Input
              id="quality"
              type="number"
              min="1"
              max="10"
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Logging..." : "Log Sleep"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
