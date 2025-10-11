import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddSleepDialog } from '@/components/sleep/AddSleepDialog';
import { toast } from '@/hooks/use-toast';
import {
  Moon,
  TrendingUp,
  Clock,
  Calendar,
  Plus,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_min: number;
  quality: number;
  created_at: string;
}

interface SleepStats {
  avgSleep: number;
  avgQuality: number;
  totalLogs: number;
  sleepDebt: number;
}

export default function SleepTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSleepLogs();
    }
  }, [user]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
  }

  async function fetchSleepLogs() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      setSleepLogs(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(logs: SleepLog[]) {
    if (logs.length === 0) {
      setStats(null);
      return;
    }

    const avgSleep = logs.reduce((sum, log) => sum + log.duration_min, 0) / logs.length;
    const avgQuality = logs.reduce((sum, log) => sum + log.quality, 0) / logs.length;
    const targetSleep = 480; // 8 hours
    const sleepDebt = (targetSleep - avgSleep) * logs.length;

    setStats({
      avgSleep: avgSleep / 60,
      avgQuality,
      totalLogs: logs.length,
      sleepDebt: sleepDebt / 60
    });
  }

  function getQualityColor(quality: number) {
    if (quality >= 8) return 'bg-green-500';
    if (quality >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  function getQualityLabel(quality: number) {
    if (quality >= 8) return 'Excellent';
    if (quality >= 6) return 'Good';
    if (quality >= 4) return 'Fair';
    return 'Poor';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Moon className="w-7 h-7" />
                  Sleep Tracker
                </h1>
                <p className="text-indigo-100 text-sm mt-1">
                  Track your sleep and build better habits
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Sleep</p>
                    <p className="text-3xl font-bold">
                      {stats.avgSleep.toFixed(1)}
                      <span className="text-lg text-muted-foreground ml-1">hrs</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Quality</p>
                    <p className="text-3xl font-bold">
                      {stats.avgQuality.toFixed(1)}
                      <span className="text-lg text-muted-foreground ml-1">/10</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Logs</p>
                    <p className="text-3xl font-bold">{stats.totalLogs}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sleep Debt</p>
                    <p className={`text-3xl font-bold ${stats.sleepDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.abs(stats.sleepDebt).toFixed(1)}
                      <span className="text-lg text-muted-foreground ml-1">hrs</span>
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${stats.sleepDebt > 0 ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center`}>
                    <AlertCircle className={`w-5 h-5 ${stats.sleepDebt > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sleep Logs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sleep History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading sleep logs...</p>
              </div>
            ) : sleepLogs.length === 0 ? (
              <div className="text-center py-12">
                <Moon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No sleep logs yet</p>
                <p className="text-muted-foreground mb-4">Start tracking your sleep to see patterns and insights</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Sleep
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sleepLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                        <Moon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {format(new Date(log.date), 'EEEE, MMMM d')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.bedtime} → {log.wake_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {(log.duration_min / 60).toFixed(1)}
                          <span className="text-sm text-muted-foreground ml-1">hrs</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.duration_min % 60} mins
                        </p>
                      </div>

                      <Badge
                        className={`${getQualityColor(log.quality)} text-white`}
                      >
                        {getQualityLabel(log.quality)} ({log.quality}/10)
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Sleep Better Tonight
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• Aim for 7-9 hours of sleep per night</li>
              <li>• Keep a consistent sleep schedule</li>
              <li>• Avoid screens 1 hour before bed</li>
              <li>• Keep your bedroom cool and dark</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Sleep Dialog */}
      <AddSleepDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        userId={user?.id || ''}
        onSuccess={() => {
          setShowAddDialog(false);
          fetchSleepLogs();
        }}
      />
    </div>
  );
}
