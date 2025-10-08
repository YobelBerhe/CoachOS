import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddMedicationDialog } from "@/components/medications/AddMedicationDialog";
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertCircle, Utensils } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  take_with_food: boolean;
  pills_per_bottle: number | null;
  current_pills: number | null;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_at: string | null;
  skipped: boolean;
}

const Medications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const [medsResult, logsResult] = await Promise.all([
        supabase
          .from('medications')
          .select('*')
          .eq('user_id', uid)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', uid)
          .eq('date', today)
      ]);

      if (medsResult.data) {
        const parsedMeds = medsResult.data.map(med => ({
          ...med,
          times: typeof med.times === 'string' ? JSON.parse(med.times) : med.times
        }));
        setMedications(parsedMeds);
      }

      if (logsResult.data) {
        setTodayLogs(logsResult.data);
      }
    } catch (error: any) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationId: string, scheduledTime: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: userId,
          medication_id: medicationId,
          scheduled_time: new Date(`${today}T${scheduledTime}`).toISOString(),
          taken_at: new Date().toISOString(),
          date: today,
          skipped: false
        });

      if (error) throw error;

      toast({
        title: "Marked as taken",
        description: "Medication logged successfully"
      });

      fetchData(userId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getMedicationStatus = (medId: string, time: string) => {
    const log = todayLogs.find(
      l => l.medication_id === medId && l.scheduled_time.includes(time)
    );
    
    if (log?.taken_at) return 'taken';
    
    const now = new Date();
    const scheduledDateTime = new Date(`${today}T${time}`);
    
    if (now > scheduledDateTime) return 'overdue';
    return 'upcoming';
  };

  const calculateAdherence = () => {
    const totalDoses = medications.reduce((sum, med) => sum + med.times.length, 0);
    const takenDoses = todayLogs.filter(log => log.taken_at).length;
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Medications</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Adherence</p>
                <p className="text-3xl font-bold text-primary">{calculateAdherence()}%</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>

        {medications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">No medications yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <Card key={med.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{med.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    <Badge variant="outline">{med.frequency}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {med.take_with_food && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Utensils className="h-4 w-4" />
                      <span>Take with food</span>
                    </div>
                  )}
                  
                  {med.times.map((time, idx) => {
                    const status = getMedicationStatus(med.id, time);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {status === 'taken' ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : status === 'overdue' ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{time}</p>
                            <p className="text-xs text-muted-foreground capitalize">{status}</p>
                          </div>
                        </div>
                        {status !== 'taken' && (
                          <Button
                            size="sm"
                            onClick={() => markAsTaken(med.id, time)}
                          >
                            Mark Taken
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {med.current_pills !== null && med.pills_per_bottle && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      Pills remaining: {med.current_pills} / {med.pills_per_bottle}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddMedicationDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        userId={userId!}
        onSuccess={() => fetchData(userId!)}
      />
    </div>
  );
};

export default Medications;
