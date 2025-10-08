import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pill, Plus } from "lucide-react";

interface MedsCardProps {
  userId: string;
}

export const MedsCard = ({ userId }: MedsCardProps) => {
  const navigate = useNavigate();
  const [adherence, setAdherence] = useState({ taken: 0, total: 0 });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchMedicationData();
  }, [userId]);

  const fetchMedicationData = async () => {
    try {
      const { data: medications } = await supabase
        .from('medications')
        .select('id, times')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (medications) {
        const totalDoses = medications.reduce((sum, med) => {
          const times = typeof med.times === 'string' ? JSON.parse(med.times) : med.times;
          return sum + times.length;
        }, 0);

        const { data: logs } = await supabase
          .from('medication_logs')
          .select('taken_at')
          .eq('user_id', userId)
          .eq('date', today)
          .not('taken_at', 'is', null);

        setAdherence({ taken: logs?.length || 0, total: totalDoses });
      }
    } catch (error) {
      console.error('Error fetching medication data:', error);
    }
  };

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
              {adherence.total === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">No medications scheduled</p>
                  <Button onClick={() => navigate("/medications")} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Today's Adherence</span>
                    <span className="font-semibold text-primary">
                      {Math.round((adherence.taken / adherence.total) * 100)}%
                    </span>
                  </div>
                  <Button onClick={() => navigate("/medications")} className="w-full">
                    Manage Medications
                  </Button>
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};
