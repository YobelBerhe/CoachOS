import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Circle,
  Droplet,
  Flame,
  Trash2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodLogItemProps {
  log: any;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function FoodLogItem({ log, onUpdate, onDelete }: FoodLogItemProps) {
  const { toast } = useToast();
  const [marking, setMarking] = useState(false);

  async function handleMarkDone() {
    setMarking(true);

    try {
      const { error } = await supabase
        .from('food_logs')
        .update({
          marked_done: !log.marked_done,
          marked_done_at: !log.marked_done ? new Date().toISOString() : null
        })
        .eq('id', log.id);

      if (error) throw error;

      if (log.is_beverage && !log.marked_done && log.hydration_ml > 0) {
        const today = new Date().toISOString().split('T')[0];
        
        const { error: waterError } = await supabase
          .from('water_logs')
          .insert({
            user_id: log.user_id,
            date: today,
            amount_oz: Math.round(log.hydration_ml / 29.5735),
            time: new Date().toTimeString().slice(0, 5)
          });

        if (waterError) throw waterError;

        toast({
          title: "Hydration updated! 💧",
          description: `Added ${log.hydration_ml}ml to your water goal`
        });
      } else {
        toast({
          title: log.marked_done ? "Unmarked" : "Marked as done! ✓",
          description: log.marked_done ? "Item unmarked" : "Great job!"
        });
      }

      onUpdate();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setMarking(false);
    }
  }

  return (
    <Card className={`${log.marked_done ? 'opacity-60 bg-green-50 dark:bg-green-950/10' : ''} transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <button
            onClick={handleMarkDone}
            disabled={marking}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
            style={{
              borderColor: log.marked_done ? '#16a34a' : '#d1d5db',
              backgroundColor: log.marked_done ? '#16a34a' : 'transparent'
            }}
          >
            {log.marked_done ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className={`font-semibold ${log.marked_done ? 'line-through' : ''}`}>
                  {log.food_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {log.meal_type}
                  </Badge>
                  {log.time && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.time}
                    </span>
                  )}
                  {log.is_beverage && (
                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20">
                      <Droplet className="w-3 h-3 mr-1 text-blue-600" />
                      {log.hydration_ml}ml
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="text-center p-2 bg-secondary/30 rounded">
                <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <p className="text-sm font-bold">{log.calories}</p>
                <p className="text-xs text-muted-foreground">cal</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-sm font-bold text-green-600">{log.protein_g}g</p>
                <p className="text-xs text-muted-foreground">protein</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-sm font-bold text-blue-600">{log.carbs_g}g</p>
                <p className="text-xs text-muted-foreground">carbs</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-sm font-bold text-yellow-600">{log.fats_g}g</p>
                <p className="text-xs text-muted-foreground">fats</p>
              </div>
            </div>

            {log.marked_done && log.marked_done_at && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Completed at {new Date(log.marked_done_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
                {log.is_beverage && log.hydration_ml > 0 && (
                  <span className="ml-2">• Added to hydration</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
