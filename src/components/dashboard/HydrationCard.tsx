import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateComplianceScore } from '@/lib/compliance';
import { useToast } from '@/hooks/use-toast';

interface HydrationCardProps {
  userId: string | undefined;
  date: string;
}

interface WaterLog {
  id: string;
  amount_oz: number;
  time: string;
  created_at: string;
}

export default function HydrationCard({ userId, date }: HydrationCardProps) {
  const { toast } = useToast();
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const DAILY_GOAL = 64; // 64 oz = 8 glasses
  const QUICK_AMOUNTS = [
    { label: '8 oz', value: 8, icon: '🥤', desc: 'Small glass' },
    { label: '16 oz', value: 16, icon: '🍶', desc: 'Bottle' },
    { label: '32 oz', value: 32, icon: '🧊', desc: 'Large bottle' }
  ];

  useEffect(() => {
    if (userId) {
      fetchWaterLogs();
    }
  }, [userId, date]);

  async function fetchWaterLogs() {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time', { ascending: false });

      if (error) throw error;
      setWaterLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching water logs:', error);
    }
  }

  async function logWater(amountOz: number) {
    if (!userId) return;

    try {
      setLoading(true);
      const now = new Date();
      const time = now.toTimeString().slice(0, 5);

      const { error } = await supabase
        .from('water_logs')
        .insert({
          user_id: userId,
          date,
          amount_oz: amountOz,
          time,
          created_at: now.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Water logged! 💧",
        description: `${amountOz} oz added`
      });

      await fetchWaterLogs();
      
      // Recalculate compliance score
      if (userId) {
        await calculateComplianceScore(userId, date);
      }
    } catch (error: any) {
      console.error('Error logging water:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteWaterLog(id: string) {
    try {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Log deleted",
        description: "Water intake removed"
      });

      await fetchWaterLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    
    if (amount > 0 && amount <= 128) {
      await logWater(amount);
      setCustomDialogOpen(false);
      setCustomAmount('');
    } else {
      toast({
        title: "Invalid amount",
        description: "Please enter between 1-128 oz",
        variant: "destructive"
      });
    }
  };

  const totalOz = waterLogs.reduce((sum, log) => sum + log.amount_oz, 0);
  const percentage = Math.min((totalOz / DAILY_GOAL) * 100, 100);
  const glassesEquivalent = Math.floor(totalOz / 8);
  const isGoalMet = totalOz >= DAILY_GOAL;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="hydration" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 rounded-t-lg transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isGoalMet ? 'bg-blue-100 dark:bg-blue-900' : 'bg-secondary'
              }`}>
                <Droplets className={`w-5 h-5 ${
                  isGoalMet ? 'text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400' : 'text-blue-500'
                }`} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Hydration</p>
                <p className="text-sm text-muted-foreground">
                  {totalOz} / {DAILY_GOAL} oz ({Math.round(percentage)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isGoalMet && (
                <Badge variant="default" className="bg-blue-600">
                  Goal Met! 🎉
                </Badge>
              )}
              <Badge variant="outline">
                {glassesEquivalent} 🥤
              </Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <CardContent className="space-y-4 pt-4">
            {/* Visual Water Glass */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-48 border-4 border-blue-400 rounded-b-3xl rounded-t-lg overflow-hidden bg-secondary/20">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500 ease-out"
                  style={{ height: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-blue-400/20 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-2xl font-bold drop-shadow-lg">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Status */}
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium">
                {isGoalMet ? (
                  <>✅ Daily goal achieved! Keep it up! 🎉</>
                ) : totalOz >= DAILY_GOAL * 0.75 ? (
                  <>🔵 Almost there! {DAILY_GOAL - totalOz} oz to go!</>
                ) : totalOz >= DAILY_GOAL * 0.5 ? (
                  <>💧 Halfway there! Keep drinking!</>
                ) : (
                  <>💦 Let's hydrate! {DAILY_GOAL - totalOz} oz remaining</>
                )}
              </p>
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Add:</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount.value}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => logWater(amount.value)}
                    disabled={loading}
                  >
                    <span className="text-2xl">{amount.icon}</span>
                    <span className="font-semibold">{amount.label}</span>
                    <span className="text-xs text-muted-foreground">{amount.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Custom Amount
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Custom Amount</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCustomSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="custom_amount">Amount (oz)</Label>
                    <Input
                      id="custom_amount"
                      type="number"
                      step="0.1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g., 12"
                      autoFocus
                      required
                      min="1"
                      max="128"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter between 1-128 oz
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Add</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCustomDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Today's Log */}
            {waterLogs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Today's Log:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {waterLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex justify-between items-center p-2 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{log.amount_oz} oz</span>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWaterLog(log.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalOz}</p>
                <p className="text-xs text-muted-foreground">oz today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{glassesEquivalent}</p>
                <p className="text-xs text-muted-foreground">glasses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{waterLogs.length}</p>
                <p className="text-xs text-muted-foreground">entries</p>
              </div>
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
