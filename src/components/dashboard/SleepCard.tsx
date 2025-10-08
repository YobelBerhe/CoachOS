import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Moon, Plus } from "lucide-react";
import { AddSleepDialog } from "@/components/sleep/AddSleepDialog";

interface SleepCardProps {
  userId: string;
}

export const SleepCard = ({ userId }: SleepCardProps) => {
  const [sleepLog, setSleepLog] = useState<any>(null);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchSleepLog();
  }, [userId]);

  const fetchSleepLog = async () => {
    const { data } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (data) setSleepLog(data);
  };

  const hours = sleepLog ? Math.floor(sleepLog.duration_min / 60) : 0;
  const minutes = sleepLog ? sleepLog.duration_min % 60 : 0;

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="sleep" className="border-none">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                <div className="text-left">
                  <CardTitle className="text-base">Sleep 😴</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {sleepLog ? `${hours}h ${minutes}m (Last night)` : "Not logged"}
                  </p>
                </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0 space-y-4">
                {sleepLog ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Quality</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < (sleepLog.quality || 0) / 2 ? "text-warning" : "text-muted"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bedtime</span>
                      <span className="font-medium">{sleepLog.bedtime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wake time</span>
                      <span className="font-medium">{sleepLog.wake_time}</span>
                    </div>
                    <Button onClick={() => setShowAddSleep(true)} variant="outline" className="w-full">
                      Update Sleep
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">No sleep logged yet</p>
                    <Button onClick={() => setShowAddSleep(true)} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Sleep
                    </Button>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <AddSleepDialog 
        open={showAddSleep} 
        onClose={() => setShowAddSleep(false)}
        userId={userId}
        onSuccess={fetchSleepLog}
      />
    </>
  );
};
