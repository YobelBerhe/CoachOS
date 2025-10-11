import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Heart,
  Target,
  Coffee,
  Sun,
  Calendar,
  TrendingUp,
  Smile,
  Zap,
  CheckCircle2,
  Info,
  Mic,
  Save,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface JournalEntry {
  id: string;
  entry_date: string;
  entry_type: string;
  gratitude_1: string;
  gratitude_2: string;
  gratitude_3: string;
  daily_intention: string;
  what_would_make_today_great: string;
  daily_affirmation: string;
  franklin_morning: string;
  free_form_entry: string;
  mood_rating: number;
  energy_level: number;
  created_at: string;
}

export default function MorningJournal() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    gratitude_1: '',
    gratitude_2: '',
    gratitude_3: '',
    daily_intention: '',
    what_would_make_today_great: '',
    daily_affirmation: '',
    franklin_morning: '',
    free_form_entry: '',
    mood_rating: 7,
    energy_level: 7
  });

  useEffect(() => {
    loadJournalData();
  }, []);

  async function loadJournalData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Load today's entry
      const { data: todayData, error: todayError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'morning')
        .single();

      if (todayData) {
        setTodayEntry(todayData);
        setFormData({
          gratitude_1: todayData.gratitude_1 || '',
          gratitude_2: todayData.gratitude_2 || '',
          gratitude_3: todayData.gratitude_3 || '',
          daily_intention: todayData.daily_intention || '',
          what_would_make_today_great: todayData.what_would_make_today_great || '',
          daily_affirmation: todayData.daily_affirmation || '',
          franklin_morning: todayData.franklin_morning || '',
          free_form_entry: todayData.free_form_entry || '',
          mood_rating: todayData.mood_rating || 7,
          energy_level: todayData.energy_level || 7
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }

      // Load recent entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_type', 'morning')
        .order('entry_date', { ascending: false })
        .limit(30);

      if (entriesError) throw entriesError;
      setEntries(entriesData || []);

      // Calculate stats
      if (entriesData && entriesData.length > 0) {
        const streak = calculateStreak(entriesData);
        const avgMood = entriesData
          .filter(e => e.mood_rating)
          .reduce((sum, e) => sum + e.mood_rating, 0) / entriesData.filter(e => e.mood_rating).length;

        setStats({
          totalEntries: entriesData.length,
          streak,
          avgMood: avgMood.toFixed(1),
          last7Days: entriesData.slice(0, 7)
        });
      }

    } catch (error) {
      console.error('Error loading journal data:', error);
    }
  }

  function calculateStreak(entries: JournalEntry[]) {
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].entry_date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async function handleSaveEntry() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          entry_date: today,
          entry_type: 'morning',
          ...formData
        }, {
          onConflict: 'user_id,entry_date,entry_type'
        });

      if (error) throw error;

      // Celebration for first entry or streak
      if (!todayEntry) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      toast({
        title: todayEntry ? "Journal updated! 📝" : "Morning entry complete! 🌅",
        description: "Your day is set with intention"
      });

      await loadJournalData();
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "Error saving entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getMoodEmoji = (rating: number) => {
    if (rating >= 9) return '🤩';
    if (rating >= 7) return '😊';
    if (rating >= 5) return '🙂';
    if (rating >= 3) return '😐';
    return '😔';
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'text-green-600';
    if (level >= 5) return 'text-yellow-600';
    return 'text-orange-600';
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
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Morning Journal</h1>
                  <p className="text-sm text-gray-600">Set your daily intention</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                className="hidden md:flex"
              >
                <Calendar className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScienceModal(true)}
                className="hidden md:flex"
              >
                <Info className="w-4 h-4 mr-2" />
                Why Journal?
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <Badge variant="secondary" className="text-xs">Streak</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.streak || 0}
              </p>
              <p className="text-sm text-gray-600">Days in a row</p>
              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <span className="text-lg">🔥</span> Keep it going!
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalEntries || 0}
              </p>
              <p className="text-sm text-gray-600">Journal Entries</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Smile className="w-5 h-5 text-pink-600" />
                <Badge variant="secondary" className="text-xs">Average</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.avgMood || '0'}/10
              </p>
              <p className="text-sm text-gray-600">Mood Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Entry */}
        {todayEntry && !isEditing ? (
          // View Mode - Show completed entry
          <Card className="border border-green-200 shadow-sm mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Today's Entry Complete</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(todayEntry.entry_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Entry
                </Button>
              </div>

              <div className="space-y-6">
                {/* Gratitude */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Grateful For
                  </h3>
                  <div className="space-y-2">
                    {[todayEntry.gratitude_1, todayEntry.gratitude_2, todayEntry.gratitude_3].map((item, idx) => (
                      item && (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-pink-50">
                          <span className="text-pink-600 mt-0.5">{idx + 1}.</span>
                          <p className="text-gray-700">{item}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Daily Intention */}
                {todayEntry.daily_intention && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Today's Intention
                    </h3>
                    <p className="text-gray-700 p-4 rounded-lg bg-blue-50">{todayEntry.daily_intention}</p>
                  </div>
                )}

                {/* What Would Make Today Great */}
                {todayEntry.what_would_make_today_great && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      What Would Make Today Great?
                    </h3>
                    <p className="text-gray-700 p-4 rounded-lg bg-purple-50">{todayEntry.what_would_make_today_great}</p>
                  </div>
                )}

                {/* Daily Affirmation */}
                {todayEntry.daily_affirmation && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Daily Affirmation
                    </h3>
                    <p className="text-gray-700 p-4 rounded-lg bg-orange-50 italic">"{todayEntry.daily_affirmation}"</p>
                  </div>
                )}

                {/* Benjamin Franklin Question */}
                {todayEntry.franklin_morning && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      "What good shall I do today?"
                    </h3>
                    <p className="text-gray-700 p-4 rounded-lg bg-amber-50">{todayEntry.franklin_morning}</p>
                  </div>
                )}

                {/* Free Form */}
                {todayEntry.free_form_entry && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Thoughts</h3>
                    <p className="text-gray-700 p-4 rounded-lg bg-gray-50 whitespace-pre-wrap">{todayEntry.free_form_entry}</p>
                  </div>
                )}

                {/* Mood & Energy */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-4xl mb-2">{getMoodEmoji(todayEntry.mood_rating)}</p>
                    <p className="text-sm text-gray-600 mb-1">Mood</p>
                    <p className="text-2xl font-bold text-gray-900">{todayEntry.mood_rating}/10</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <Zap className={`w-10 h-10 mx-auto mb-2 ${getEnergyColor(todayEntry.energy_level)}`} />
                    <p className="text-sm text-gray-600 mb-1">Energy</p>
                    <p className="text-2xl font-bold text-gray-900">{todayEntry.energy_level}/10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Edit/Create Mode
          <Card className="border border-purple-200 shadow-sm mb-8">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sun className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Good Morning!</h2>
                </div>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Take 5-10 minutes to set your intention for the day
                </p>
              </div>

              <div className="space-y-8">
                {/* Gratitude Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <Label className="text-lg font-bold text-gray-900">
                      What are you grateful for today?
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    📚 Research shows gratitude increases happiness by 25% (UC Davis)
                  </p>
                  <div className="space-y-3">
                    {[1, 2, 3].map((num) => (
                      <Input
                        key={num}
                        value={formData[`gratitude_${num}` as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [`gratitude_${num}`]: e.target.value 
                        })}
                        placeholder={`Gratitude #${num}`}
                        className="bg-pink-50 border-pink-200 focus:border-pink-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Daily Intention */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    <Label className="text-lg font-bold text-gray-900">
                      What is your intention for today?
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Set a theme or focus for the day (e.g., "Be present," "Lead with kindness")
                  </p>
                  <Input
                    value={formData.daily_intention}
                    onChange={(e) => setFormData({ ...formData, daily_intention: e.target.value })}
                    placeholder="My intention today is..."
                    className="bg-blue-50 border-blue-200 focus:border-blue-400"
                  />
                </div>

                {/* What Would Make Today Great */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <Label className="text-lg font-bold text-gray-900">
                      What would make today great?
                    </Label>
                  </div>
                  <Textarea
                    value={formData.what_would_make_today_great}
                    onChange={(e) => setFormData({ ...formData, what_would_make_today_great: e.target.value })}
                    placeholder="List 2-3 things that would make today amazing..."
                    className="bg-purple-50 border-purple-200 focus:border-purple-400 min-h-[80px]"
                  />
                </div>

                {/* Daily Affirmation */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <Label className="text-lg font-bold text-gray-900">
                      Daily Affirmation
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    A positive statement about yourself or your day
                  </p>
                  <Input
                    value={formData.daily_affirmation}
                    onChange={(e) => setFormData({ ...formData, daily_affirmation: e.target.value })}
                    placeholder="I am capable of achieving my goals today"
                    className="bg-orange-50 border-orange-200 focus:border-orange-400"
                  />
                </div>

                {/* Benjamin Franklin Question */}
                <div>
                  <div className="mb-4">
                    <Label className="text-lg font-bold text-gray-900 mb-2 block">
                      "What good shall I do today?"
                    </Label>
                    <p className="text-sm text-gray-600">
                      Benjamin Franklin's daily morning question
                    </p>
                  </div>
                  <Textarea
                    value={formData.franklin_morning}
                    onChange={(e) => setFormData({ ...formData, franklin_morning: e.target.value })}
                    placeholder="Today I will..."
                    className="bg-amber-50 border-amber-200 focus:border-amber-400 min-h-[80px]"
                  />
                </div>

                {/* Free Form Entry */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Coffee className="w-5 h-5 text-gray-600" />
                    <Label className="text-lg font-bold text-gray-900">
                      Morning Pages (Optional)
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Stream of consciousness - write whatever comes to mind
                  </p>
                  <Textarea
                    value={formData.free_form_entry}
                    onChange={(e) => setFormData({ ...formData, free_form_entry: e.target.value })}
                    placeholder="Let your thoughts flow freely..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Mood & Energy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-900 mb-2 block">
                      How's your mood? {getMoodEmoji(formData.mood_rating)} {formData.mood_rating}/10
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.mood_rating}
                      onChange={(e) => setFormData({ ...formData, mood_rating: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-2 block">
                      Energy Level: <Zap className={`inline w-4 h-4 ${getEnergyColor(formData.energy_level)}`} /> {formData.energy_level}/10
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.energy_level}
                      onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Drained</span>
                      <span>Energized</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex gap-3">
                {todayEntry && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to saved data
                      setFormData({
                        gratitude_1: todayEntry.gratitude_1 || '',
                        gratitude_2: todayEntry.gratitude_2 || '',
                        gratitude_3: todayEntry.gratitude_3 || '',
                        daily_intention: todayEntry.daily_intention || '',
                        what_would_make_today_great: todayEntry.what_would_make_today_great || '',
                        daily_affirmation: todayEntry.daily_affirmation || '',
                        franklin_morning: todayEntry.franklin_morning || '',
                        free_form_entry: todayEntry.free_form_entry || '',
                        mood_rating: todayEntry.mood_rating || 7,
                        energy_level: todayEntry.energy_level || 7
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSaveEntry}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {todayEntry ? 'Update Entry' : 'Complete Morning Journal'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries Preview */}
        {stats?.last7Days && stats.last7Days.length > 1 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Entries</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoryModal(true)}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {stats.last7Days.slice(1, 4).map((entry: JournalEntry, idx: number) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(entry.mood_rating)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {entry.mood_rating}/10
                        </Badge>
                      </div>
                    </div>
                    {entry.daily_intention && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        <strong>Intention:</strong> {entry.daily_intention}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Science Modal */}
      <Dialog open={showScienceModal} onOpenChange={setShowScienceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Why Morning Journaling Works
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              The science of starting your day with intention
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {[
              {
                title: '🧠 Improves Working Memory',
                stat: '13% increase in cognitive performance',
                source: 'University of Chicago',
                description: 'Expressive writing frees up mental resources by externalizing thoughts and worries.'
              },
              {
                title: '😌 Reduces Anxiety',
                stat: '25% reduction in anxiety symptoms',
                source: 'Cambridge University',
                description: 'Morning journaling helps process emotions and gain perspective before the day begins.'
              },
              {
                title: '🎯 Increases Goal Achievement',
                stat: '42% more likely to achieve goals',
                source: 'Dominican University',
                description: 'Writing down goals and intentions makes them tangible and increases commitment.'
              },
              {
                title: '❤️ Gratitude Benefits',
                stat: '25% increase in happiness',
                source: 'UC Davis',
                description: 'Regular gratitude practice rewires your brain to notice positive things throughout the day.'
              },
              {
                title: '⏰ Morning is Optimal',
                stat: 'Peak clarity: 2-4 hours after waking',
                source: 'Scandinavian Journal of Work',
                description: 'Your mind is clearest in the morning, making it ideal for reflection and planning.'
              },
              {
                title: '✍️ Tim Ferriss\' Practice',
                stat: '10+ years daily habit',
                source: 'The Tim Ferriss Show',
                description: '"Morning pages" - 3 pages of stream of consciousness. Clears mental fog and surfaces insights.'
              },
              {
                title: '🧘 Benjamin Franklin',
                stat: 'Daily for 50+ years',
                source: 'Franklin\'s Autobiography',
                description: 'Morning: "What good shall I do today?" Evening: "What good have I done today?"'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm font-semibold text-purple-600 mb-1">{item.stat}</p>
                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                <p className="text-xs text-gray-500">Source: {item.source}</p>
              </div>
            ))}

            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                The Bottom Line
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Morning journaling is like a software update for your brain. It clears mental clutter, sets intention, and primes you for a successful day. 5-10 minutes in the morning can transform your entire day. The best performers across all fields—entrepreneurs, athletes, artists—journal consistently.
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

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Journal History</DialogTitle>
            <DialogDescription className="text-gray-600">
              Your past {entries.length} entries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMoodEmoji(entry.mood_rating)}</span>
                      <Badge variant="secondary">{entry.mood_rating}/10</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {entry.gratitude_1 && (
                      <p className="text-gray-700"><strong className="text-pink-600">Grateful:</strong> {entry.gratitude_1}</p>
                    )}
                    {entry.daily_intention && (
                      <p className="text-gray-700"><strong className="text-blue-600">Intention:</strong> {entry.daily_intention}</p>
                    )}
                    {entry.franklin_morning && (
                      <p className="text-gray-700"><strong className="text-amber-600">Good to do:</strong> {entry.franklin_morning}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
