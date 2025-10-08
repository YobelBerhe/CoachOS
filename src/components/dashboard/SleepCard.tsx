import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SleepCardProps {
  sleepLog: any;
  userId: string | undefined;
  date: string;
}

export default function SleepCard({ sleepLog, userId, date }: SleepCardProps) {
  const navigate = useNavigate();

  const hasSleep = sleepLog !== null;
  const durationHours = hasSleep ? Math.floor(sleepLog.duration_min / 60) : 0;
  const durationMinutes = hasSleep ? sleepLog.duration_min % 60 : 0;
  const qualityRating = sleepLog?.quality_rating || 0;

  const getSleepQuality = () => {
    if (!hasSleep) return { label: 'Not logged', color: 'bg-gray-100 dark:bg-gray-800' };
    if (durationHours >= 7 && durationHours <= 9) {
      return { label: 'Optimal', color: 'bg-green-100 dark:bg-green-900' };
    } else if (durationHours >= 6 && durationHours < 7) {
      return { label: 'Fair', color: 'bg-yellow-100 dark:bg-yellow-900' };
    } else {
      return { label: 'Poor', color: 'bg-red-100 dark:bg-red-900' };
    }
  };

  const sleepQuality = getSleepQuality();

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="sleep" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 rounded-t-lg transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sleepQuality.color}`}>
                <Moon className={`w-5 h-5 ${
                  hasSleep ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
                }`} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Sleep</p>
                <p className="text-sm text-muted-foreground">
                  {hasSleep ? (
                    <>{durationHours}h {durationMinutes}m (Last night)</>
                  ) : (
                    'Not logged yet'
                  )}
                </p>
              </div>
            </div>
            {hasSleep && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < qualityRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <CardContent className="space-y-4 pt-4">
            {!hasSleep ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <Moon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">No sleep logged</p>
                <p className="text-xs text-muted-foreground">Track your sleep to improve recovery</p>
              </div>
            ) : (
              <>
                {/* Sleep Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${sleepQuality.color}`}>
                    <p className="text-3xl font-bold">
                      {durationHours}h {durationMinutes}m
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total Sleep</p>
                    <Badge variant="outline" className="mt-2">
                      {sleepQuality.label}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < qualityRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Sleep Quality</p>
                    <p className="text-lg font-semibold mt-1">
                      {qualityRating}/5
                    </p>
                  </div>
                </div>

                {/* Sleep Times */}
                <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bedtime</span>
                    <span className="font-medium">{formatTime(sleepLog.bedtime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wake Time</span>
                    <span className="font-medium">{formatTime(sleepLog.wake_time)}</span>
                  </div>
                  {sleepLog.source && (
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Source</span>
                      <Badge variant="outline" className="text-xs">{sleepLog.source}</Badge>
                    </div>
                  )}
                </div>

                {/* Sleep Phases (if available) */}
                {(sleepLog.deep_sleep_min || sleepLog.rem_sleep_min || sleepLog.light_sleep_min) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sleep Phases</p>
                    <div className="grid grid-cols-3 gap-2">
                      {sleepLog.deep_sleep_min && (
                        <div className="text-center p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded">
                          <p className="font-semibold">{Math.round(sleepLog.deep_sleep_min)}m</p>
                          <p className="text-xs text-muted-foreground">Deep</p>
                        </div>
                      )}
                      {sleepLog.rem_sleep_min && (
                        <div className="text-center p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                          <p className="font-semibold">{Math.round(sleepLog.rem_sleep_min)}m</p>
                          <p className="text-xs text-muted-foreground">REM</p>
                        </div>
                      )}
                      {sleepLog.light_sleep_min && (
                        <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                          <p className="font-semibold">{Math.round(sleepLog.light_sleep_min)}m</p>
                          <p className="text-xs text-muted-foreground">Light</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {sleepLog.notes && (
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"{sleepLog.notes}"</p>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => navigate('/sleep')}
                className="flex-1"
                size="sm"
                variant={hasSleep ? 'outline' : 'default'}
              >
                {hasSleep ? (
                  'View History'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Sleep
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate('/sleep')}
                variant="outline"
                size="sm"
              >
                7-Day Trend
              </Button>
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
