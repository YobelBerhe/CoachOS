import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tag } from 'lucide-react';

interface CreateDealDialogProps {
  recipeId: string;
  currentPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateDealDialog({
  recipeId,
  currentPrice,
  open,
  onOpenChange,
  onSuccess
}: CreateDealDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [duration, setDuration] = useState(7); // days
  const [description, setDescription] = useState('');

  const dealPrice = currentPrice * (1 - discountPercent / 100);
  const savings = currentPrice - dealPrice;

  async function handleCreateDeal() {
    setLoading(true);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      const { error } = await supabase
        .from('recipes')
        .update({
          is_on_deal: true,
          original_price: currentPrice,
          deal_price: dealPrice,
          deal_percentage: discountPercent,
          deal_start_date: startDate.toISOString(),
          deal_end_date: endDate.toISOString(),
          deal_description: description || `Limited time ${discountPercent}% off!`
        })
        .eq('id', recipeId);

      if (error) throw error;

      toast({
        title: "Deal created! 🎉",
        description: `Recipe is now ${discountPercent}% off for ${duration} days`
      });

      onSuccess();
      onOpenChange(false);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Create Deal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Discount Percentage */}
          <div>
            <Label>Discount Percentage</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="10"
                max="90"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="flex-1"
              />
              <Badge className="bg-red-600 text-white text-lg px-3">
                {discountPercent}%
              </Badge>
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration (days)</Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Deal Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Summer Sale - Limited Time Only!"
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
            <h4 className="font-bold mb-2">Deal Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span className="line-through">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deal Price:</span>
                <span className="text-green-600 font-bold text-lg">
                  ${dealPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>You Save:</span>
                <span className="text-red-600 font-bold">
                  ${savings.toFixed(2)} ({discountPercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{duration} days</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleCreateDeal}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
