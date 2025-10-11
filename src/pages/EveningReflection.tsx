import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Moon,
  Star,
  Heart,
  Lightbulb,
  CheckCircle2,
  Target,
  Zap,
  Award,
  Coffee,
  Droplet,
  Info,
  Save,
  Edit,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface EveningEntry {
  id: string;
  entry_date: string;
  franklin_evening: string;
  wins_today: string[];
  lessons_learned: string;
  tomorrow_focus: string;
  free_form_entry: string;
  mood_rating: number;
  energy_level: number;
}

interface DaySummary {
  sleepHours: number;
  waterIntake: number;
  caloriesConsumed: number;
  morningMood: number;
  morningEnergy: number;
}

export default function EveningReflection() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [eveningEntry, setEveningEntry] = useState<EveningEntry | null>(null);
  const [morningEntry, setMorningEntry] = useState<any>(null);
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    franklin_evening: '',
    wins_today: ['', '', ''],
    lessons_learned: '',
    tomorrow_focus: '',
    free_form_entry: '',
    mood_rating: 7,
    energy_level: 7
  });

  useEffect(() => {
    loadEveningData();
  }, []);

  async function loadEveningData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Load morning entry
      const { data: morningData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'morning')
        .maybeSingle();

      setMorningEntry(morningData);

      // Load evening entry
      const { data: eveningData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .eq('entry_type', 'evening')
        .maybeSingle();

      if (eveningData) {
        setEveningEntry(eveningData);
        setFormData({
          franklin_evening: eveningData.franklin_evening || '',
          wins_today: eveningData.wins_today || ['', '', ''],
          lessons_learned: eveningData.lessons_learned || '',
          tomorrow_focus: eveningData.tomorrow_focus || '',
          free_form_entry: eveningData.free_form_entry || '',
          mood_rating: eveningData.mood_rating || 7,
          energy_level: eveningData.energy_level || 7
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }

      // Load day summary
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('duration_min')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const { data: foodData } = await supabase
        .from('food_logs')
        .select('calories, hydration_ml, is_beverage')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalCalories = foodData?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
      const totalWater = foodData?.reduce((sum, log) => 
        sum + (log.is_beverage ? (log.hydration_ml || 0) : 0), 0) || 0;

      setDaySummary({
        sleepHours: sleepData?.duration_min ? (sleepData.duration_min / 60) : 0,
        waterIntake: Math.round(totalWater / 29.5735), // Convert ml to oz
        caloriesConsumed: totalCalories,
        morningMood: morningData?.mood_rating || 0,
        morningEnergy: morningData?.energy_level || 0
      });

    } catch (error) {
      console.error('Error loading evening data:', error);
    }
  }

  async function handleSaveReflection() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const cleanWins = formData.wins_today.filter(w => w.trim() !== '');

      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          entry_date: today,
          entry_type: 'evening',
          franklin_evening: formData.franklin_evening,
          wins_today: cleanWins,
          lessons_learned: formData.lessons_learned,
          tomorrow_focus: formData.tomorrow_focus,
          free_form_entry: formData.free_form_entry,
          mood_rating: formData.mood_rating,
          energy_level: formData.energy_level
        }, {
          onConflict: 'user_id,entry_date,entry_type'
        });

      if (error) throw error;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Day complete! 🌙✨",
        description: "Your reflection has been saved"
      });

      await loadEveningData();
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error saving reflection",
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

  const getMoodChange = () => {
    if (!daySummary || !formData.mood_rating || !daySummary.morningMood) return null;
    return formData.mood_rating - daySummary.morningMood;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
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
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Moon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Evening Reflection</h1>
                  <p className="text-sm text-muted-foreground">Close your day with gratitude</p>
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
                Why Reflect?
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day Summary */}
        {daySummary && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Today at a Glance</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Sleep */}
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <Moon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {daySummary.sleepHours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-muted-foreground">Last Night</p>
                </div>

                {/* Water */}
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <Droplet className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {daySummary.waterIntake}oz
                  </p>
                  <p className="text-xs text-muted-foreground">Water</p>
                </div>

                {/* Calories */}
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <Coffee className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {daySummary.caloriesConsumed}
                  </p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
              </div>

              {/* Mood Comparison */}
              {daySummary.morningMood > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-1">Mood Journey Today</p>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl">{getMoodEmoji(daySummary.morningMood)}</p>
                          <p className="text-xs text-muted-foreground">Morning</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-2xl">{getMoodEmoji(formData.mood_rating)}</p>
                          <p className="text-xs text-muted-foreground">Evening</p>
                        </div>
                      </div>
                    </div>
                    {getMoodChange() !== null && (
                      <Badge variant={getMoodChange()! >= 0 ? 'default' : 'secondary'}>
                        {getMoodChange()! >= 0 ? '+' : ''}{getMoodChange()}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Morning Intentions Recap */}
        {morningEntry && (
          <Card className="mb-8 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                This Morning, You Said...
              </h3>
              <div className="space-y-3">
                {morningEntry.daily_intention && (
                  <div className="p-3 rounded-lg bg-primary/5">
                    <p className="text-sm font-semibold mb-1">Your Intention</p>
                    <p className="text-sm">"{morningEntry.daily_intention}"</p>
                  </div>
                )}
                {morningEntry.what_would_make_today_great && (
                  <div className="p-3 rounded-lg bg-primary/5">
                    <p className="text-sm font-semibold mb-1">What Would Make Today Great</p>
                    <p className="text-sm">{morningEntry.what_would_make_today_great}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                💡 Did you accomplish what you set out to do?
              </p>
            </CardContent>
          </Card>
        )}

        {/* Evening Reflection Form */}
        {eveningEntry && !isEditing ? (
          // View Mode
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Reflection Complete</h2>
                    <p className="text-sm text-muted-foreground">Day closed with intention</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="space-y-6">
                {/* Wins */}
                {eveningEntry.wins_today && eveningEntry.wins_today.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Today's Wins
                    </h3>
                    <div className="space-y-2">
                      {eveningEntry.wins_today.map((win, idx) => (
                        win && (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
                            <Award className="w-4 h-4 text-primary mt-0.5" />
                            <p>{win}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Franklin Evening */}
                {eveningEntry.franklin_evening && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">
                      "What good have I done today?"
                    </h3>
                    <p className="p-4 rounded-lg bg-primary/5">{eveningEntry.franklin_evening}</p>
                  </div>
                )}

                {/* Lessons Learned */}
                {eveningEntry.lessons_learned && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Lessons Learned
                    </h3>
                    <p className="p-4 rounded-lg bg-primary/5">{eveningEntry.lessons_learned}</p>
                  </div>
                )}

                {/* Tomorrow Focus */}
                {eveningEntry.tomorrow_focus && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Tomorrow's Focus
                    </h3>
                    <p className="p-4 rounded-lg bg-primary/5">{eveningEntry.tomorrow_focus}</p>
                  </div>
                )}

                {/* Free Form */}
                {eveningEntry.free_form_entry && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Evening Thoughts</h3>
                    <p className="p-4 rounded-lg bg-muted whitespace-pre-wrap">{eveningEntry.free_form_entry}</p>
                  </div>
                )}

                {/* Evening Mood & Energy */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-4xl mb-2">{getMoodEmoji(eveningEntry.mood_rating)}</p>
                    <p className="text-sm text-muted-foreground mb-1">Evening Mood</p>
                    <p className="text-2xl font-bold">{eveningEntry.mood_rating}/10</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <Zap className="w-10 h-10 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Evening Energy</p>
                    <p className="text-2xl font-bold">{eveningEntry.energy_level}/10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Edit/Create Mode
          <Card>
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Moon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Evening Reflection</h2>
                </div>
                <p className="text-muted-foreground">
                  Take 5-10 minutes to reflect on your day
                </p>
              </div>

              <div className="space-y-8">
                {/* Daily Wins */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-bold">
                      What were your 3 wins today?
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    📚 Celebrating wins = 23% performance increase (Harvard)
                  </p>
                  <div className="space-y-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary flex-shrink-0" />
                        <Input
                          value={formData.wins_today[idx]}
                          onChange={(e) => {
                            const newWins = [...formData.wins_today];
                            newWins[idx] = e.target.value;
                            setFormData({ ...formData, wins_today: newWins });
                          }}
                          placeholder={`Win #${idx + 1}`}
                          className="bg-primary/5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benjamin Franklin Evening */}
                <div>
                  <div className="mb-4">
                    <Label className="text-lg font-bold mb-2 block">
                      "What good have I done today?"
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Benjamin Franklin's daily evening question
                    </p>
                  </div>
                  <Textarea
                    value={formData.franklin_evening}
                    onChange={(e) => setFormData({ ...formData, franklin_evening: e.target.value })}
                    placeholder="Today I accomplished..."
                    className="bg-primary/5 min-h-[80px]"
                  />
                </div>

                {/* Lessons Learned */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-bold">
                      What did you learn today?
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    What could have been better? What will you do differently?
                  </p>
                  <Textarea
                    value={formData.lessons_learned}
                    onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                    placeholder="Today taught me that..."
                    className="bg-primary/5 min-h-[80px]"
                  />
                </div>

                {/* Tomorrow's Focus */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-bold">
                      What's your focus for tomorrow?
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set your top 3 priorities for tomorrow morning
                  </p>
                  <Textarea
                    value={formData.tomorrow_focus}
                    onChange={(e) => setFormData({ ...formData, tomorrow_focus: e.target.value })}
                    placeholder="Tomorrow I will focus on..."
                    className="bg-primary/5 min-h-[80px]"
                  />
                </div>

                {/* Free Form Reflection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-bold">
                      Evening Thoughts (Optional)
                    </Label>
                  </div>
                  <Textarea
                    value={formData.free_form_entry}
                    onChange={(e) => setFormData({ ...formData, free_form_entry: e.target.value })}
                    placeholder="Any other thoughts, gratitudes, or reflections..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Evening Mood & Energy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">
                      How's your mood now? {getMoodEmoji(formData.mood_rating)} {formData.mood_rating}/10
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.mood_rating}
                      onChange={(e) => setFormData({ ...formData, mood_rating: parseInt(e.target.value) })}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Energy Level: <Zap className="inline w-4 h-4 text-primary" /> {formData.energy_level}/10
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.energy_level}
                      onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Drained</span>
                      <span>Energized</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex gap-3">
                {eveningEntry && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        franklin_evening: eveningEntry.franklin_evening || '',
                        wins_today: eveningEntry.wins_today || ['', '', ''],
                        lessons_learned: eveningEntry.lessons_learned || '',
                        tomorrow_focus: eveningEntry.tomorrow_focus || '',
                        free_form_entry: eveningEntry.free_form_entry || '',
                        mood_rating: eveningEntry.mood_rating || 7,
                        energy_level: eveningEntry.energy_level || 7
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSaveReflection}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {eveningEntry ? 'Update Reflection' : 'Complete Evening Reflection'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {eveningEntry && !isEditing && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">🌙 Wind Down for Sleep</h3>
              <p className="text-muted-foreground mb-4">
                You've reflected on your day. Now it's time to prepare for restful sleep.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/sleep-tracker')}
                  variant="outline"
                  className="flex-1"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Log Sleep
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Science Modal */}
      <Dialog open={showScienceModal} onOpenChange={setShowScienceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Why Evening Reflection Works
            </DialogTitle>
            <DialogDescription>
              The science of daily reflection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {[
              {
                title: '📈 Performance Boost',
                stat: '23% increase in performance',
                source: 'Harvard Business School',
                description: 'Daily reflection improves learning, decision-making, and future performance significantly.'
              },
              {
                title: '🧠 Memory Consolidation',
                stat: 'Better retention & learning',
                source: 'Sleep Research',
                description: 'Reflecting before sleep helps your brain consolidate memories and learnings from the day.'
              },
              {
                title: '😌 Reduced Anxiety',
                stat: '20% reduction in worry',
                source: 'Journal of Behavioral Therapy',
                description: 'Writing down thoughts and concerns before bed reduces rumination and improves sleep quality.'
              },
              {
                title: '🎯 Goal Achievement',
                stat: '2.5x more likely to reach goals',
                source: 'Dominican University Study',
                description: 'Regular reflection on progress dramatically increases goal completion rates.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm font-semibold text-primary mb-1">{item.stat}</p>
                <p className="text-sm mb-2">{item.description}</p>
                <p className="text-xs text-muted-foreground">Source: {item.source}</p>
              </div>
            ))}

            <div className="p-6 rounded-lg bg-primary/5 border-primary/20 border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                The Bottom Line
              </h3>
              <p className="leading-relaxed mb-4">
                Evening reflection is the secret weapon of high performers. It closes the learning loop, celebrates progress, and primes you for better decisions tomorrow. 
              </p>
              <p className="leading-relaxed">
                Morning sets intention. Evening reflects on reality. Together, they create a powerful cycle of continuous improvement.
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
