import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Coffee,
  Flame,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FastingSession {
  id: string;
  start_time: string;
  end_time?: string;
  target_duration_hours: number;
  actual_duration_hours?: number;
  completed: boolean;
  broken_early: boolean;
  notes?: string;
}

interface FastingPlan {
  id: string;
  type: string;
  eating_window_start: string;
  eating_window_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const FASTING_PROTOCOLS = [
  { 
    name: '16:8 (Beginner Friendly)', 
    fast: 16, 
    eat: 8, 
    description: 'Fast 16 hours, eat within 8 hours',
    recommended: true,
    icon: '🌅'
  },
  { 
    name: '18:6 (Intermediate)', 
    fast: 18, 
    eat: 6, 
    description: 'Fast 18 hours, eat within 6 hours',
    icon: '⚡'
  },
  { 
    name: '20:4 (Advanced)', 
    fast: 20, 
    eat: 4, 
    description: 'Fast 20 hours, eat within 4 hours',
    icon: '🔥'
  },
  { 
    name: '23:1 (OMAD - One Meal)', 
    fast: 23, 
    eat: 1, 
    description: 'One meal a day',
    icon: '🍽️'
  },
  { 
    name: 'Custom', 
    fast: 0, 
    eat: 0, 
    description: 'Set your own schedule',
    icon: '⚙️'
  }
];

export default function Fasting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  // Fasting state
  const [activePlan, setActivePlan] = useState<FastingPlan | null>(null);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isInEatingWindow, setIsInEatingWindow] = useState(false);
  
  // History
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Setup form
  const [selectedProtocol, setSelectedProtocol] = useState(FASTING_PROTOCOLS[0]);
  const [windowStart, setWindowStart] = useState('12:00');
  const [windowEnd, setWindowEnd] = useState('20:00');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchFastingData(user.id);
    }
    init();
  }, [navigate]);

  // Update timer every second
  useEffect(() => {
    if (currentSession && !currentSession.completed) {
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  async function fetchFastingData(uid: string) {
    try {
      setLoading(true);

      // Fetch active plan
      const { data: planData, error: planError } = await supabase
        .from('fasting_plans')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .maybeSingle();

      if (planError) throw planError;
      setActivePlan(planData);

      // Fetch current session
      const { data: sessionData, error: sessionError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', uid)
        .is('end_time', null)
        .maybeSingle();

      if (sessionError && sessionError.code !== 'PGRST116') throw sessionError;
      setCurrentSession(sessionData);

      // Fetch history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historyData, error: historyError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', uid)
        .gte('start_time', thirtyDaysAgo.toISOString())
        .order('start_time', { ascending: false });

      if (historyError) throw historyError;
      setFastingHistory(historyData || []);

      // Calculate streaks
      calculateStreaks(historyData || []);

    } catch (error: any) {
      console.error('Error fetching fasting data:', error);
      toast({
        title: "Error loading fasting data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  function updateTimer() {
    if (!currentSession) return;

    const startTime = new Date(currentSession.start_time).getTime();
    const targetDuration = currentSession.target_duration_hours * 60 * 60 * 1000;
    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, targetDuration - elapsed);

    setTimeRemaining(remaining);

    // Check if in eating window
    if (activePlan) {
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      setIsInEatingWindow(
        currentTimeStr >= activePlan.eating_window_start && 
        currentTimeStr <= activePlan.eating_window_end
      );
    }
  }

  function calculateStreaks(history: FastingSession[]) {
    const completed = history.filter(s => s.completed && !s.broken_early);
    
    if (completed.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completed.length; i++) {
      const sessionDate = new Date(completed[i].start_time);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);

    // Calculate longest streak
    let longest = 0;
    let current = 1;

    for (let i = 1; i < completed.length; i++) {
      const prevDate = new Date(completed[i - 1].start_time);
      const currDate = new Date(completed[i].start_time);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        current++;
      } else {
        longest = Math.max(longest, current);
        current = 1;
      }
    }

    setLongestStreak(Math.max(longest, current));
  }

  async function setupFastingPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    try {
      const planData = {
        user_id: userId,
        type: selectedProtocol.name,
        eating_window_start: windowStart,
        eating_window_end: windowEnd,
        is_active: true
      };

      // Deactivate existing plans
      await supabase
        .from('fasting_plans')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Create new plan
      const { data, error } = await supabase
        .from('fasting_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      setActivePlan(data);
      setSetupDialogOpen(false);

      toast({
        title: "Fasting plan created! 🎉",
        description: `${selectedProtocol.name} - Fast ${selectedProtocol.fast}hrs, eat ${selectedProtocol.eat}hrs`
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function startFast() {
    if (!userId || !activePlan) return;

    try {
      // Calculate fasting hours from the protocol
      const protocol = FASTING_PROTOCOLS.find(p => p.name === activePlan.type) || FASTING_PROTOCOLS[0];
      
      const { data, error } = await supabase
        .from('fasting_sessions')
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          target_duration_hours: protocol.fast,
          completed: false,
          broken_early: false
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);

      toast({
        title: "Fast started! 💪",
        description: `Your ${protocol.fast}hr fast has begun`
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function endFast(broken: boolean = false) {
    if (!userId || !currentSession) return;

    try {
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const actualHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('fasting_sessions')
        .update({
          end_time: endTime.toISOString(),
          actual_duration_hours: actualHours,
          completed: !broken && actualHours >= currentSession.target_duration_hours,
          broken_early: broken
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      await fetchFastingData(userId);

      toast({
        title: broken ? "Fast ended early" : "Fast completed! 🎉",
        description: broken 
          ? `You fasted for ${Math.floor(actualHours)}h ${Math.round((actualHours % 1) * 60)}m`
          : `Congratulations! You completed your ${currentSession.target_duration_hours}hr fast!`
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  // Format time remaining
  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  }

  const time = formatTime(timeRemaining);
  const isFasting = currentSession && !currentSession.completed;
  const progress = currentSession 
    ? Math.min(((Date.now() - new Date(currentSession.start_time).getTime()) / (currentSession.target_duration_hours * 60 * 60 * 1000)) * 100, 100)
    : 0;

  const completedFasts = fastingHistory.filter(s => s.completed && !s.broken_early).length;
  const avgDuration = fastingHistory.filter(s => s.actual_duration_hours).length > 0
    ? fastingHistory
        .filter(s => s.actual_duration_hours)
        .reduce((sum, s) => sum + (s.actual_duration_hours || 0), 0) / fastingHistory.filter(s => s.actual_duration_hours).length
    : 0;

  // Get protocol details for active plan
  const activeProtocol = activePlan 
    ? FASTING_PROTOCOLS.find(p => p.name === activePlan.type) || FASTING_PROTOCOLS[0]
    : FASTING_PROTOCOLS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Timer className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Intermittent Fasting</h1>
              <p className="text-sm text-muted-foreground">
                Track your fasting journey
              </p>
            </div>
          </div>
          {activePlan && (
            <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  ⚙️ Change Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Setup Fasting Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={setupFastingPlan} className="space-y-4 mt-4">
                  <div>
                    <Label>Fasting Protocol</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {FASTING_PROTOCOLS.map((protocol) => (
                        <button
                          key={protocol.name}
                          type="button"
                          onClick={() => setSelectedProtocol(protocol)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            selectedProtocol.name === protocol.name
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{protocol.icon}</span>
                            <span className="font-semibold text-sm">{protocol.name}</span>
                            {protocol.recommended && (
                              <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{protocol.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedProtocol.name !== 'Custom' && (
                    <div>
                      <Label>Eating Window</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">Start</Label>
                          <input
                            type="time"
                            value={windowStart}
                            onChange={(e) => setWindowStart(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <input
                            type="time"
                            value={windowEnd}
                            onChange={(e) => setWindowEnd(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Example: 12:00 PM to 8:00 PM = 16:8 protocol
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Save Plan
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!activePlan ? (
          /* Setup Screen */
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Timer className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Start Your Fasting Journey</CardTitle>
              <p className="text-muted-foreground mt-2">
                Choose a fasting protocol that fits your lifestyle
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={setupFastingPlan} className="space-y-6">
                <div>
                  <Label className="text-base">Select Your Protocol</Label>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {FASTING_PROTOCOLS.map((protocol) => (
                      <button
                        key={protocol.name}
                        type="button"
                        onClick={() => setSelectedProtocol(protocol)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedProtocol.name === protocol.name
                            ? 'border-primary bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{protocol.icon}</span>
                          <div className="flex-1">
                            <span className="font-semibold">{protocol.name}</span>
                            {protocol.recommended && (
                              <Badge variant="secondary" className="ml-2">⭐ Recommended</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{protocol.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedProtocol.name !== 'Custom' && (
                  <div>
                    <Label className="text-base">Set Your Eating Window</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Window Starts</Label>
                        <input
                          type="time"
                          value={windowStart}
                          onChange={(e) => setWindowStart(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg text-lg font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Window Ends</Label>
                        <input
                          type="time"
                          value={windowEnd}
                          onChange={(e) => setWindowEnd(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg text-lg font-semibold"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">
                        💡 <strong>Example:</strong> Setting 12:00 PM to 8:00 PM gives you an 8-hour eating window (16:8 protocol)
                      </p>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full py-6 text-lg" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Fasting Journey
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Main Fasting Interface */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{currentStreak}</div>
                  <p className="text-xs text-muted-foreground mt-1">days in a row</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Longest Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{longestStreak}</div>
                  <p className="text-xs text-muted-foreground mt-1">personal best</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedFasts}</div>
                  <p className="text-xs text-muted-foreground mt-1">total fasts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.floor(avgDuration)}h</div>
                  <p className="text-xs text-muted-foreground mt-1">per fast</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Timer */}
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="max-w-md mx-auto">
                  {/* Circular Progress */}
                  <div className="relative w-64 h-64 mx-auto mb-6">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-secondary"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {isFasting ? (
                        <>
                          <div className="text-5xl font-bold tabular-nums">
                            {time.hours}:{time.minutes}
                          </div>
                          <div className="text-xl text-muted-foreground tabular-nums">
                            :{time.seconds}
                          </div>
                          <div className="mt-2 text-sm font-medium">
                            {Math.round(progress)}% Complete
                          </div>
                          {timeRemaining === 0 && (
                            <Badge className="mt-2 bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Goal Reached!
                            </Badge>
                          )}
                        </>
                      ) : (
                        <>
                          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">Ready to fast</p>
                          <p className="text-sm text-muted-foreground">{activeProtocol.fast} hour goal</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-center mb-6">
                    {isFasting ? (
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          <Circle className="w-3 h-3 mr-2 fill-green-500 text-green-500 animate-pulse" />
                          Fasting in Progress
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Started {new Date(currentSession.start_time).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {isInEatingWindow ? (
                            <>
                              <Coffee className="w-4 h-4 mr-2" />
                              Eating Window Open
                            </>
                          ) : (
                            <>
                              <Timer className="w-4 h-4 mr-2" />
                              Ready to Start
                            </>
                          )}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Next window: {activePlan.eating_window_start} - {activePlan.eating_window_end}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isFasting ? (
                      <>
                        <Button
                          onClick={() => endFast(false)}
                          className="flex-1"
                          size="lg"
                          disabled={timeRemaining > 0}
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Complete Fast
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to break your fast early?')) {
                              endFast(true);
                            }
                          }}
                          variant="outline"
                          size="lg"
                        >
                          Break Fast
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={startFast}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start {activeProtocol.fast}hr Fast
                      </Button>
                    )}
                  </div>

                  {/* Protocol Info */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{activePlan.type}</span>
                      <Badge variant="outline">
                        {activeProtocol.fast}:{activeProtocol.eat}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fast for {activeProtocol.fast} hours, eat within {activeProtocol.eat} hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">History</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      30-Day Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Day headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar days */}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 34 + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const hasFast = fastingHistory.some(s => 
                          s.start_time.split('T')[0] === dateStr && s.completed && !s.broken_early
                        );
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                              isToday 
                                ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2' 
                                : hasFast 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                                : 'bg-secondary/30'
                            }`}
                          >
                            {date.getDate()}
                            {hasFast && (
                              <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-green-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded" />
                        <span className="text-muted-foreground">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded" />
                        <span className="text-muted-foreground">Today</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Fasting Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fastingHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <Timer className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No fasting sessions yet</p>
                        <p className="text-sm text-muted-foreground">Start your first fast to see history</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fastingHistory.slice(0, 10).map((session) => {
                          const duration = session.actual_duration_hours || 0;
                          const wasCompleted = session.completed && !session.broken_early;
                          
                          return (
                            <div 
                              key={session.id}
                              className={`p-4 rounded-lg border-2 ${
                                wasCompleted 
                                  ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20' 
                                  : 'border-border bg-secondary/20'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {wasCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : session.broken_early ? (
                                      <Circle className="w-5 h-5 text-orange-600" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-blue-600" />
                                    )}
                                    <span className="font-semibold">
                                      {new Date(session.start_time).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    {wasCompleted && (
                                      <Badge variant="default" className="bg-green-600">
                                        <Trophy className="w-3 h-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                    {session.broken_early && (
                                      <Badge variant="outline" className="border-orange-500 text-orange-600">
                                        Ended Early
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Started: {new Date(session.start_time).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                    {session.end_time && (
                                      <> • Ended: {new Date(session.end_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}</>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">
                                    {Math.floor(duration)}h {Math.round((duration % 1) * 60)}m
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Target: {session.target_duration_hours}h
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
