import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Check, Clock, AlertCircle } from "lucide-react";

interface MedsCardProps {
  userId: string;
}

export const MedsCard = ({ userId }: MedsCardProps) => {
  const [adherence, setAdherence] = useState({ taken: 0, total: 0 });

  useEffect(() => {
    // Placeholder - will fetch from medications table
    setAdherence({ taken: 0, total: 0 });
  }, [userId]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="meds" className="border-none">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">Medications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {adherence.total === 0 ? "No medications" : `${adherence.taken}/${adherence.total} taken`}
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0 space-y-4">
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No medications scheduled</p>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};
