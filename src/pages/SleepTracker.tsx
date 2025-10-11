import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Heart,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface SleepLog {
  id: string;
  sleep_date: string;
  bed_time: string;
  wake_time: string;
  total_sleep_hours: number;
  sleep_quality_rating: number;
  feeling_rating: string;
  fell_asleep_easily: boolean;
  stayed_asleep: boolean;
  felt_rested: boolean;
  wake_count: number;
  notes: string;
  sleep_debt_minutes: number;
}

export default function SleepTracker() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sleep_date: new Date().toISOString().split('T')[0],
    bed_time: '23:00',
    wake_time: '07:00',
    sleep_quality_rating: 7,
    feeling_rating: 'good',
    fell_asleep_easily: true,
    stayed_asleep: true,
    felt_rested: true,
    wake_count: 0,
    notes: ''
  });

  useEffect(() => {
    loadSleepData();
  }, []);

  async function loadSleepData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load sleep logs
      const { data: logs, error: logsError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sleep_date', { ascending: false })
        .limit(30);

      if (logsError) throw logsError;
      setSleepLogs(logs || []);

      // Calculate stats
      if (logs && logs.length > 0) {
        const avgSleep = logs.reduce((sum, log) => sum + log.total_sleep_hours, 0) / logs.length;
        const avgQuality = logs.reduce((sum, log) => sum + (log.sleep_quality_rating || 0), 0) / logs.length;
        const totalDebt = logs.reduce((sum, log) => sum + log.sleep_debt_minutes, 0);
        
        setStats({
          avgSleep: avgSleep.toFixed(1),
          avgQuality: avgQuality.toFixed(1),
          totalDebt: Math.abs(totalDebt),
          debtDirection: totalDebt > 0 ? 'deficit' : 'surplus',
          streak: calculateStreak(logs),
          last7Days: logs.slice(0, 7)
        });
      }

    } catch (error) {
      console.error('Error loading sleep data:', error);
      toast({
        title: "Error loading data",
        variant: "destructive"
      });
    }
  }

  function calculateStreak(logs: SleepLog[]) {
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.sleep_date).getTime() - new Date(a.sleep_date).getTime()
    );

    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].total_sleep_hours >= 7) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async function handleLogSleep() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate sleep duration
      const bedTime = new Date(`${formData.sleep_date}T${formData.bed_time}`);
      let wakeTime = new Date(`${formData.sleep_date}T${formData.wake_time}`);
      
      // If wake time is before bed time, assume it's the next day
      if (wakeTime <= bedTime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
      }

      const sleepMinutes = Math.floor((wakeTime.getTime() - bedTime.getTime()) / 1000 / 60);

      const { error } = await supabase
        .from('sleep_logs')
        .upsert({
          user_id: user.id,
          sleep_date: formData.sleep_date,
          bed_time: bedTime.toISOString(),
          wake_time: wakeTime.toISOString(),
          total_sleep_minutes: sleepMinutes,
          sleep_quality_rating: formData.sleep_quality_rating,
          feeling_rating: formData.feeling_rating,
          fell_asleep_easily: formData.fell_asleep_easily,
          stayed_asleep: formData.stayed_asleep,
          felt_rested: formData.felt_rested,
          wake_count: formData.wake_count,
          notes: formData.notes
        });

      if (error) throw error;

      // Celebration for good sleep
      if (sleepMinutes >= 420) { // 7+ hours
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      toast({
        title: sleepMinutes >= 420 ? "Great sleep! 😴💪" : "Sleep logged ✓",
        description: `${(sleepMinutes / 60).toFixed(1)} hours tracked`
      });

      setShowLogModal(false);
      await loadSleepData();

    } catch (error) {
      console.error('Error logging sleep:', error);
      toast({
        title: "Error logging sleep",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getFeelingEmoji = (feeling: string) => {
    const map: any = {
      exhausted: '😴',
      tired: '😐',
      okay: '🙂',
      good: '😊',
      excellent: '🤩'
    };
    return map[feeling] || '🙂';
  };

  const getSleepGrade = (hours: number) => {
    if (hours >= 8) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (hours >= 7) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (hours >= 6) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (hours >= 5) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Moon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sleep Tracker</h1>
                  <p className="text-sm text-gray-600">Track & optimize your rest</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScienceModal(true)}
                className="hidden md:flex"
              >
                <Info className="w-4 h-4 mr-2" />
                Why Sleep Matters
              </Button>
              <Button
                onClick={() => setShowLogModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Average Sleep */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                <Badge variant="secondary" className="text-xs">Last 30 days</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.avgSleep || '0.0'}h
              </p>
              <p className="text-sm text-gray-600">Average Sleep</p>
              <p className="text-xs text-gray-500 mt-2">Target: 8h</p>
            </CardContent>
          </Card>

          {/* Sleep Quality */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <Badge variant="secondary" className="text-xs">Quality</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.avgQuality || '0'}/10
              </p>
              <p className="text-sm text-gray-600">Sleep Quality</p>
              <div className="mt-2">
                <Progress 
                  value={(parseFloat(stats?.avgQuality || 0) / 10) * 100} 
                  className="h-2 bg-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sleep Debt */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                {stats?.debtDirection === 'deficit' ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                )}
                <Badge 
                  variant={stats?.debtDirection === 'deficit' ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {stats?.debtDirection === 'deficit' ? 'Deficit' : 'Surplus'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {Math.floor((stats?.totalDebt || 0) / 60)}h
              </p>
              <p className="text-sm text-gray-600">Sleep Debt</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.debtDirection === 'deficit' 
                  ? 'Catch up on rest' 
                  : 'Well rested!'}
              </p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <Badge variant="secondary" className="text-xs">Streak</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.streak || 0}
              </p>
              <p className="text-sm text-gray-600">Days (7+ hours)</p>
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <span className="text-lg">🔥</span> Keep going!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Logs */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Sleep</h2>
                    <p className="text-sm text-gray-600">Last 7 nights</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>

                {sleepLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No sleep logged yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start tracking your sleep to see insights
                    </p>
                    <Button onClick={() => setShowLogModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Log Your First Sleep
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.last7Days?.map((log: SleepLog, idx: number) => {
                      const grade = getSleepGrade(log.total_sleep_hours);
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                {/* Date */}
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">
                                    {new Date(log.sleep_date).toLocaleDateString('en-US', { weekday: 'short' })}
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {new Date(log.sleep_date).getDate()}
                                  </p>
                                </div>

                                {/* Sleep Duration */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Moon className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">
                                      {new Date(log.bed_time).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <Sun className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-semibold text-gray-700">
                                      {new Date(log.wake_time).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {log.total_sleep_hours.toFixed(1)}h sleep
                                  </p>
                                </div>

                                {/* Quality Rating */}
                                <div className="text-center">
                                  <div className="text-2xl mb-1">
                                    {getFeelingEmoji(log.feeling_rating)}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {log.sleep_quality_rating}/10
                                  </p>
                                </div>

                                {/* Grade */}
                                <div className={`w-16 h-16 rounded-lg ${grade.bg} flex items-center justify-center`}>
                                  <span className={`text-2xl font-bold ${grade.color}`}>
                                    {grade.grade}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Additional Details */}
                            {log.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600 italic">
                                  "{log.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Insights & Tips */}
          <div className="space-y-6">
            {/* Today's Insight */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Today's Insight</h3>
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                  <p className="text-sm text-indigo-900 font-semibold mb-2">
                    Sleep is Your Superpower
                  </p>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    {stats?.avgSleep >= 7 
                      ? `Great job! You're averaging ${stats.avgSleep}h. Keep this consistency to maintain peak performance.`
                      : `You're averaging ${stats?.avgSleep || 0}h. Try adding 30 minutes to see a 20% boost in cognition!`
                    }
                  </p>
                </div>

                {stats?.debtDirection === 'deficit' && stats?.totalDebt > 120 && (
                  <div className="mt-3 p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-900 font-semibold mb-1">
                          Sleep Debt Alert
                        </p>
                        <p className="text-xs text-red-700">
                          You're {Math.floor((stats.totalDebt || 0) / 60)}h behind. Try going to bed 1 hour earlier tonight.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sleep Tips */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sleep Better</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🌡️', tip: 'Cool room (65-68°F)', science: 'Optimal for deep sleep' },
                    { icon: '📱', tip: 'No screens 1hr before bed', science: '50% less melatonin' },
                    { icon: '🌙', tip: 'Consistent sleep schedule', science: '20% better quality' },
                    { icon: '☕', tip: 'No caffeine after 2 PM', science: '6hr half-life' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.tip}</p>
                          <p className="text-xs text-gray-600">{item.science}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Famous Sleepers */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🌟 Sleep Champions</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-900 mb-1">Jeff Bezos</p>
                    <p className="text-xs text-gray-600">"8 hours = better decisions"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-900 mb-1">LeBron James</p>
                    <p className="text-xs text-gray-600">12 hours daily (8 + 4 nap)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-900 mb-1">Arianna Huffington</p>
                    <p className="text-xs text-gray-600">Built Thrive on sleep importance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Log Sleep Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Log Sleep</DialogTitle>
            <DialogDescription className="text-gray-600">
              Track your sleep to unlock insights
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date */}
            <div>
              <Label className="text-gray-900">Sleep Date</Label>
              <Input
                type="date"
                value={formData.sleep_date}
                onChange={(e) => setFormData({ ...formData, sleep_date: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Sleep Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-900 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  Bed Time
                </Label>
                <Input
                  type="time"
                  value={formData.bed_time}
                  onChange={(e) => setFormData({ ...formData, bed_time: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-600" />
                  Wake Time
                </Label>
                <Input
                  type="time"
                  value={formData.wake_time}
                  onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Sleep Quality Rating */}
            <div>
              <Label className="text-gray-900 mb-2 block">
                Sleep Quality: {formData.sleep_quality_rating}/10
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep_quality_rating}
                onChange={(e) => setFormData({ ...formData, sleep_quality_rating: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Feeling Rating */}
            <div>
              <Label className="text-gray-900">How do you feel?</Label>
              <Select
                value={formData.feeling_rating}
                onValueChange={(value) => setFormData({ ...formData, feeling_rating: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exhausted">😴 Exhausted</SelectItem>
                  <SelectItem value="tired">😐 Tired</SelectItem>
                  <SelectItem value="okay">🙂 Okay</SelectItem>
                  <SelectItem value="good">😊 Good</SelectItem>
                  <SelectItem value="excellent">🤩 Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sleep Factors (Optional) */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Label className="text-gray-900 mb-3 block">Sleep Quality Factors (Optional)</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fell_asleep_easily}
                    onChange={(e) => setFormData({ ...formData, fell_asleep_easily: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Fell asleep easily</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stayed_asleep}
                    onChange={(e) => setFormData({ ...formData, stayed_asleep: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Stayed asleep through the night</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.felt_rested}
                    onChange={(e) => setFormData({ ...formData, felt_rested: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Felt rested upon waking</span>
                </label>
              </div>
            </div>

            {/* Wake Count */}
            <div>
              <Label className="text-gray-900">Times woken during night</Label>
              <Input
                type="number"
                min="0"
                value={formData.wake_count}
                onChange={(e) => setFormData({ ...formData, wake_count: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="text-gray-900">Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any factors affecting sleep? (stress, exercise, caffeine, etc.)"
                className="mt-2 min-h-[80px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowLogModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogSleep}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Logging...' : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Log Sleep
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Science Modal */}
      <Dialog open={showScienceModal} onOpenChange={setShowScienceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              Why Sleep Matters
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              The science behind sleep tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {[
              {
                title: '🧠 Cognitive Performance',
                stat: '6 hours sleep = 11-day cognitive impairment',
                source: 'University of Pennsylvania',
                description: 'Even moderate sleep deprivation severely impacts decision-making, memory, and focus.'
              },
              {
                title: '💼 Productivity Impact',
                stat: '30% productivity loss from sleep deprivation',
                source: 'Matthew Walker, "Why We Sleep"',
                description: 'Your brain needs sleep to consolidate memories and clear toxic waste products.'
              },
              {
                title: '💪 Physical Performance',
                stat: '10-30% decrease in athletic performance',
                source: 'Stanford Sleep Research',
                description: 'Sleep affects reaction time, accuracy, and recovery. Elite athletes prioritize 8-10 hours.'
              },
              {
                title: '🎯 Decision Making',
                stat: '8 hours = better decisions',
                source: 'Jeff Bezos',
                description: 'Bezos refuses meetings before 10 AM to protect his 8-hour sleep schedule.'
              },
              {
                title: '🏆 Elite Performance',
                stat: 'LeBron James: 12 hours daily',
                source: 'Professional Athletes',
                description: '8 hours at night + 4 hours naps. Roger Federer also sleeps 12 hours.'
              },
              {
                title: '⚠️ Sleep Debt',
                stat: 'Cumulative deficits compound',
                source: 'Harvard Medical School',
                description: 'You can\'t "catch up" on weekends. Consistency is key.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm font-semibold text-indigo-600 mb-1">{item.stat}</p>
                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                <p className="text-xs text-gray-500">Source: {item.source}</p>
              </div>
            ))}

            <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                The Bottom Line
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Sleep is not negotiable. It's the ultimate performance enhancer, affecting every aspect of your life: health, productivity, relationships, and longevity. Track it, protect it, prioritize it.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowScienceModal(false)}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
