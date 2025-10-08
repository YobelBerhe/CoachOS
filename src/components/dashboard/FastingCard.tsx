import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock } from "lucide-react";

interface FastingCardProps {
  userId: string;
}

export const FastingCard = ({ userId }: FastingCardProps) => {
  const [fastingPlan, setFastingPlan] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchFastingPlan();
  }, [userId]);

  useEffect(() => {
    if (fastingPlan) {
      const interval = setInterval(updateStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [fastingPlan]);

  const fetchFastingPlan = async () => {
    const { data } = await supabase
      .from('fasting_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (data) setFastingPlan(data);
  };

  const updateStatus = () => {
    if (!fastingPlan) return;
    
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const [startHour, startMin] = fastingPlan.eating_window_start.split(':');
    const [endHour, endMin] = fastingPlan.eating_window_end.split(':');
    
    const start = new Date(now);
    start.setHours(parseInt(startHour), parseInt(startMin), 0);
    
    const end = new Date(now);
    end.setHours(parseInt(endHour), parseInt(endMin), 0);
    
    if (currentTime >= fastingPlan.eating_window_start && currentTime <= fastingPlan.eating_window_end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setStatus(`Eating window closes in ${hours}h ${minutes}m`);
    } else {
      setStatus("Fasting period");
    }
  };

  if (!fastingPlan) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="fasting" className="border-none">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">Fasting</CardTitle>
                  <p className="text-sm text-muted-foreground">{status}</p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{fastingPlan.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Eating Window</span>
                  <span className="font-medium">
                    {fastingPlan.eating_window_start} - {fastingPlan.eating_window_end}
                  </span>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};
