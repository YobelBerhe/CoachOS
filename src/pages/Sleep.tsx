import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Plus, Star, ArrowLeft, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_min: number;
  quality: number;
  notes?: string;
  deep_sleep_min?: number;
  rem_sleep_min?: number;
  light_sleep_min?: number;
}

export default function Sleep() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    wake_time: '06:00',
    quality_rating: 3,
    notes: ''
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchSleepLogs(user.id);
    }
    init();
  }, [navigate]);

  async function fetchSleepLogs(uid: string) {
    try {
      setLoading(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      setSleepLogs(data || []);

    } catch (error: any) {
      console.error('Error fetching sleep logs:', error);
      toast({
        title: "Error loading sleep logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const calculateDuration = (bedtime: string, wakeTime: string) => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

    let bedDate = new Date();
    bedDate.setHours(bedHour, bedMin, 0, 0);

    let wakeDate = new Date();
    wakeDate.setHours(wakeHour, wakeMin, 0, 0);

    // If wake time is before bedtime, it's the next day
    if (wakeDate <= bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const durationMs = wakeDate.getTime() - bedDate.getTime();
    return Math.round(durationMs / (1000 * 60)); // minutes
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      bedtime: '22:00',
      wake_time: '06:00',
      quality_rating: 3,
      notes: ''
    });
    setEditingLog(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const durationMin = calculateDuration(formData.bedtime, formData.wake_time);

      const bedtimeDate = new Date(`${formData.date}T${formData.bedtime}:00`);
      const wakeTimeDate = new Date(`${formData.date}T${formData.wake_time}:00`);
      
      // If wake time is before bedtime, wake time is next day
      if (wakeTimeDate <= bedtimeDate) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }

      const sleepData = {
        user_id: userId,
        date: formData.date,
        bedtime: bedtimeDate.toISOString(),
        wake_time: wakeTimeDate.toISOString(),
        duration_min: durationMin,
        quality: formData.quality_rating,
        notes: formData.notes || null,
        source: 'Manual'
      };

      if (editingLog) {
        const { error } = await supabase
          .from('sleep_logs')
          .update(sleepData)
          .eq('id', editingLog.id);

        if (error) throw error;

        toast({
          title: "Sleep log updated",
          description: "Your sleep data has been updated"
        });
      } else {
        const { error } = await supabase
          .from('sleep_logs')
          .insert(sleepData);

        if (error) throw error;

        toast({
          title: "Sleep logged",
          description: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m sleep logged`
        });
      }

      await fetchSleepLogs(userId);
      setDialogOpen(false);
      resetForm();

    } catch (error: any) {
      console.error('Error saving sleep:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (log: SleepLog) => {
    setEditingLog(log);
    
    const bedtime = new Date(log.bedtime);
    const wakeTime = new Date(log.wake_time);
    
    setFormData({
      date: log.date,
      bedtime: `${bedtime.getHours().toString().padStart(2, '0')}:${bedtime.getMinutes().toString().padStart(2, '0')}`,
      wake_time: `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`,
      quality_rating: log.quality,
      notes: log.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, date: string) => {
    if (!confirm(`Delete sleep log for ${new Date(date).toLocaleDateString()}?`)) return;

    try {
      const { error } = await supabase
        .from('sleep_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sleep log deleted",
        description: "Your sleep data has been removed"
      });

      await fetchSleepLogs(userId!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  const last7Days = sleepLogs.slice(0, 7);
  const avgDuration = last7Days.length > 0
    ? last7Days.reduce((sum, log) => sum + log.duration_min, 0) / last7Days.length
    : 0;
  const avgQuality = last7Days.length > 0
    ? last7Days.reduce((sum, log) => sum + log.quality, 0) / last7Days.length
    : 0;

  const bestNight = [...sleepLogs].sort((a, b) => b.duration_min - a.duration_min)[0];
  const worstNight = [...sleepLogs].sort((a, b) => a.duration_min - b.duration_min)[0];

  // Chart data (last 14 days)
  const chartData = sleepLogs
    .slice(0, 14)
    .reverse()
    .map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: parseFloat((log.duration_min / 60).toFixed(1)),
      quality: log.quality
    }));

  const getSleepQualityLabel = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { label: 'Optimal', color: 'bg-green-500' };
    if (hours >= 6 && hours < 7) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading sleep data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
              <h1 className="text-2xl font-bold">Sleep Tracker</h1>
              <p className="text-sm text-muted-foreground">
                Track your rest and recovery
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingLog ? 'Edit Sleep Log' : 'Log Sleep'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedtime">Bedtime *</Label>
                    <Input
                      id="bedtime"
                      type="time"
                      value={formData.bedtime}
                      onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="wake_time">Wake Time *</Label>
                    <Input
                      id="wake_time"
                      type="time"
                      value={formData.wake_time}
                      onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Duration:</span>
                    <span>
                      {Math.floor(calculateDuration(formData.bedtime, formData.wake_time) / 60)}h{' '}
                      {calculateDuration(formData.bedtime, formData.wake_time) % 60}m
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Sleep Quality: {formData.quality_rating}/5</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, quality_rating: rating })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= formData.quality_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.quality_rating === 1 && 'Terrible'}
                    {formData.quality_rating === 2 && 'Poor'}
                    {formData.quality_rating === 3 && 'Fair'}
                    {formData.quality_rating === 4 && 'Good'}
                    {formData.quality_rating === 5 && 'Excellent'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How did you feel? Any interruptions?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingLog ? 'Update' : 'Log Sleep'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                7-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.floor(avgDuration / 60)}h {Math.round(avgDuration % 60)}m
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Quality: {avgQuality.toFixed(1)}/5 ⭐
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Best Night
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestNight ? (
                <>
                  <div className="text-3xl font-bold">
                    {Math.floor(bestNight.duration_min / 60)}h {bestNight.duration_min % 60}m
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(bestNight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Nights Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sleepLogs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 14-Day Trend Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>14-Day Sleep Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis 
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                    domain={[0, 12]}
                    ticks={[0, 3, 6, 9, 12]}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No sleep data to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep History */}
        <Card>
          <CardHeader>
            <CardTitle>Sleep History</CardTitle>
          </CardHeader>
          <CardContent>
            {sleepLogs.length === 0 ? (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">No sleep logs yet</p>
                <p className="text-xs text-muted-foreground">Start tracking your sleep to see patterns</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sleepLogs.map(log => {
                  const hours = Math.floor(log.duration_min / 60);
                  const minutes = log.duration_min % 60;
                  const quality = getSleepQualityLabel(hours + minutes / 60);

                  return (
                    <div 
                      key={log.id}
                      className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">
                              {new Date(log.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.bedtime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })} → {new Date(log.wake_time).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </p>
                          </div>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-muted-foreground italic mt-2">"{log.notes}"</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{hours}h {minutes}m</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < log.quality
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {quality.label}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(log)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(log.id, log.date)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
