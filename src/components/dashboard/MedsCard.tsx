import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface MedsCardProps {
  medications: any[];
  medicationLogs: any[];
  userId: string | undefined;
  date: string;
}

export default function MedsCard({ medications, medicationLogs, userId, date }: MedsCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasMeds = medications.length > 0;
  
  // Build today's schedule
  const todaysSchedule = medications.flatMap(med => {
    const times = Array.isArray(med.times) ? med.times : [];
    return times.map(time => ({
      medication: med,
      scheduledTime: time,
      log: medicationLogs.find(log => 
        log.medication_id === med.id && 
        log.scheduled_time.includes(time)
      )
    }));
  }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const totalScheduled = todaysSchedule.length;
  const totalTaken = todaysSchedule.filter(item => item.log?.taken_at).length;
  const adherencePercentage = totalScheduled > 0 
    ? Math.round((totalTaken / totalScheduled) * 100) 
    : 100;

  const getMedicationStatus = (scheduledTime: string, log: any) => {
    if (log?.taken_at) {
      return { status: 'taken', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' };
    }
    
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0);
    
    if (now < scheduledDate) {
      return { status: 'upcoming', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' };
    } else {
      const minutesOverdue = Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60));
      if (minutesOverdue > 15) {
        return { status: 'overdue', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' };
      } else {
        return { status: 'due', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900' };
      }
    }
  };

  const handleMarkTaken = async (medId: string, scheduledTime: string) => {
    if (!userId) return;

    try {
      const scheduledDateTime = new Date(`${date}T${scheduledTime}:00`);
      
      const { error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: userId,
          medication_id: medId,
          scheduled_time: scheduledDateTime.toISOString(),
          taken_at: new Date().toISOString(),
          skipped: false
        });

      if (error) throw error;

      toast({
        title: "Medication logged",
        description: "Great job staying on track!",
      });

      // Refresh the page to update data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error logging medication",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="meds" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 rounded-t-lg transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                adherencePercentage >= 80 ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'
              }`}>
                <Pill className={`w-5 h-5 ${
                  adherencePercentage >= 80 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Medications</p>
                <p className="text-sm text-muted-foreground">
                  {hasMeds ? (
                    <>{totalTaken} / {totalScheduled} taken today</>
                  ) : (
                    'No medications set'
                  )}
                </p>
              </div>
            </div>
            {hasMeds && (
              <Badge variant={adherencePercentage >= 80 ? 'default' : 'destructive'}>
                {adherencePercentage}%
              </Badge>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <CardContent className="space-y-4 pt-4">
            {!hasMeds ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <Pill className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">No medications added</p>
                <p className="text-xs text-muted-foreground">Add your medications to get reminders</p>
              </div>
            ) : (
              <>
                {/* Adherence Summary */}
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Today's Adherence</span>
                    <span className="text-2xl font-bold">{adherencePercentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        adherencePercentage >= 80 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${adherencePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Today's Schedule</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {todaysSchedule.map((item, index) => {
                      const status = getMedicationStatus(item.scheduledTime, item.log);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div 
                          key={`${item.medication.id}-${item.scheduledTime}-${index}`}
                          className={`p-3 rounded-lg ${status.bg} border border-border/50`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{item.medication.name}</p>
                                {item.medication.take_with_food && (
                                  <Badge variant="outline" className="text-xs">With food</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.medication.dosage} • {item.scheduledTime}
                              </p>
                              {item.log?.taken_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ✓ Taken at {new Date(item.log.taken_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 ${status.color}`} />
                              {!item.log?.taken_at && status.status !== 'upcoming' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkTaken(item.medication.id, item.scheduledTime)}
                                >
                                  Take
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Medications Summary */}
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Active Medications</p>
                  <div className="space-y-1">
                    {medications.map(med => (
                      <div key={med.id} className="flex justify-between text-sm">
                        <span>{med.name}</span>
                        <span className="text-muted-foreground">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => navigate('/medications')}
                className="flex-1"
                size="sm"
                variant={hasMeds ? 'outline' : 'default'}
              >
                {hasMeds ? (
                  'Manage Meds'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </>
                )}
              </Button>
              {hasMeds && (
                <Button
                  onClick={() => navigate('/medications')}
                  variant="outline"
                  size="sm"
                >
                  View History
                </Button>
              )}
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
