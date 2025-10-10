import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Activity,
  Apple,
  Moon,
  Clock,
  Pill,
  Target,
  Bell,
  CheckCircle2,
  X,
  Sparkles,
  Shield,
  Zap,
  Droplet,
  Brain,
  Flame,
  Award,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const SETUP_STEPS = [
  { id: 1, title: 'Health', icon: Heart },
  { id: 2, title: 'Biomarkers', icon: Activity },
  { id: 3, title: 'Diet', icon: Apple },
  { id: 4, title: 'Lifestyle', icon: Moon },
  { id: 5, title: 'Fasting', icon: Clock },
  { id: 6, title: 'Supplements', icon: Pill },
  { id: 7, title: 'Focus', icon: Target },
  { id: 8, title: 'Finish', icon: Award },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const [setupData, setSetupData] = useState({
    // Health Conditions
    health_conditions: [] as string[],
    
    // Biomarkers
    biomarkers: {
      glucose: '',
      iron: '',
      vitamin_d: '',
      potassium: '',
      magnesium: '',
      hemoglobin: '',
      ldl_cholesterol: '',
      hdl_cholesterol: '',
    },
    
    // Additional Diet Info
    allergies: '',
    food_dislikes: '',
    
    // Lifestyle
    sleep_hours: '',
    stress_level: '',
    water_intake: 8,
    smokes: false,
    drinks_alcohol: false,
    caffeine_intake: '',
    
    // Fasting
    fasting_enabled: false,
    fasting_method: '',
    eating_window_start: '',
    eating_window_end: '',
    
    // Medications & Supplements
    medications: [] as Array<{name: string; dosage: string; time: string; purpose: string}>,
    supplements: [] as Array<{name: string; dosage: string; time: string; purpose: string}>,
    
    // Focus Areas
    focus_areas: [] as string[],
    
    // Permissions
    notifications_enabled: true,
    daily_email: true,
    ai_suggestions: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
  }

  const nextStep = () => {
    if (currentStep < SETUP_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const skipToEnd = () => {
    setCurrentStep(SETUP_STEPS.length);
  };

  async function completeSetup() {
    setLoading(true);
    try {
      // Save health conditions
      if (setupData.health_conditions.length > 0) {
        const conditions = setupData.health_conditions.map(condition => ({
          user_id: userId,
          condition_type: condition,
        }));
        await supabase.from('user_conditions').insert(conditions);
      }

      // Save biomarkers if any entered
      const hasBiomarkers = Object.values(setupData.biomarkers).some(v => v !== '');
      if (hasBiomarkers) {
        const biomarkerRows = [
          { name: 'Glucose', value: setupData.biomarkers.glucose, unit: 'mg/dL' },
          { name: 'Iron', value: setupData.biomarkers.iron, unit: 'μg/dL' },
          { name: 'Vitamin D', value: setupData.biomarkers.vitamin_d, unit: 'ng/mL' },
          { name: 'Potassium', value: setupData.biomarkers.potassium, unit: 'mmol/L' },
          { name: 'Magnesium', value: setupData.biomarkers.magnesium, unit: 'mg/dL' },
          { name: 'Hemoglobin', value: setupData.biomarkers.hemoglobin, unit: 'g/dL' },
          { name: 'LDL Cholesterol', value: setupData.biomarkers.ldl_cholesterol, unit: 'mg/dL' },
          { name: 'HDL Cholesterol', value: setupData.biomarkers.hdl_cholesterol, unit: 'mg/dL' },
        ]
          .filter(b => b.value && b.value !== '')
          .map(b => ({
            user_id: userId,
            biomarker_name: b.name,
            biomarker_value: parseFloat(b.value),
            unit: b.unit,
            test_date: new Date().toISOString().split('T')[0],
          }));

        if (biomarkerRows.length > 0) {
          await supabase.from('user_biomarkers').insert(biomarkerRows);
        }
      }

      // Save lifestyle data
      await supabase.from('user_lifestyle').upsert({
        user_id: userId,
        sleep_hours: setupData.sleep_hours,
        stress_level: setupData.stress_level,
        water_intake: setupData.water_intake,
        smokes: setupData.smokes,
        alcohol: setupData.drinks_alcohol,
        caffeine_intake: setupData.caffeine_intake,
      });

      // Save fasting preferences
      if (setupData.fasting_enabled) {
        await supabase.from('user_fasting').upsert({
          user_id: userId,
          fasting_enabled: setupData.fasting_enabled,
          fasting_method: setupData.fasting_method,
          eating_window_start: setupData.eating_window_start || null,
          eating_window_end: setupData.eating_window_end || null,
        });
      }

      // Save medications & supplements
      if (setupData.medications.length > 0) {
        const meds = setupData.medications.map(med => ({
          user_id: userId,
          type: 'medication',
          ...med,
        }));
        await supabase.from('user_meds').insert(meds);
      }

      if (setupData.supplements.length > 0) {
        const supps = setupData.supplements.map(supp => ({
          user_id: userId,
          type: 'supplement',
          ...supp,
        }));
        await supabase.from('user_meds').insert(supps);
      }

      // Save settings
      await supabase.from('user_settings').upsert({
        user_id: userId,
        focus_areas: setupData.focus_areas,
        notifications_enabled: setupData.notifications_enabled,
        daily_summary_email: setupData.daily_email,
        ai_suggestions: setupData.ai_suggestions,
      });

      // Update profile completion status
      await supabase.from('profiles').update({
        profile_completed: true,
      }).eq('id', userId);

      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      toast({
        title: "Profile Complete! 🎉",
        description: "Your personalized experience is now fully activated!"
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const progress = (currentStep / SETUP_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Complete Your Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {SETUP_STEPS.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={skipToEnd}
              className="text-muted-foreground"
            >
              Skip All
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                {/* Step 1: Health Conditions */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-4">
                        <Heart className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Health Conditions</h2>
                      <p className="text-muted-foreground">
                        Optional: Help us personalize your recommendations
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        'Diabetes / High Blood Sugar',
                        'High Cholesterol',
                        'High Blood Pressure',
                        'Thyroid Issues',
                        'Vitamin D Deficiency',
                        'Iron Deficiency',
                        'Sleep Problems',
                        'Digestive Issues',
                        'Anxiety / High Stress',
                        'None of the above',
                      ].map((condition) => (
                        <div
                          key={condition}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            setupData.health_conditions.includes(condition)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (condition === 'None of the above') {
                              setSetupData({
                                ...setupData,
                                health_conditions: setupData.health_conditions.includes(condition)
                                  ? []
                                  : ['None of the above']
                              });
                            } else {
                              const conditions = setupData.health_conditions.includes(condition)
                                ? setupData.health_conditions.filter(c => c !== condition)
                                : [...setupData.health_conditions.filter(c => c !== 'None of the above'), condition];
                              setSetupData({ ...setupData, health_conditions: conditions });
                            }
                          }}
                        >
                          <Checkbox
                            checked={setupData.health_conditions.includes(condition)}
                          />
                          <span className="flex-1">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Biomarkers */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                        <Activity className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Blood & Biomarkers</h2>
                      <p className="text-muted-foreground">
                        Optional: Enter recent lab results
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'glucose', label: 'Glucose', unit: 'mg/dL', placeholder: '90' },
                        { key: 'iron', label: 'Iron/Ferritin', unit: 'µg/L', placeholder: '100' },
                        { key: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL', placeholder: '30' },
                        { key: 'potassium', label: 'Potassium', unit: 'mmol/L', placeholder: '4.5' },
                        { key: 'magnesium', label: 'Magnesium', unit: 'mg/dL', placeholder: '2.0' },
                        { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', placeholder: '14' },
                        { key: 'ldl_cholesterol', label: 'LDL', unit: 'mg/dL', placeholder: '100' },
                        { key: 'hdl_cholesterol', label: 'HDL', unit: 'mg/dL', placeholder: '60' },
                      ].map((field) => (
                        <div key={field.key}>
                          <Label className="text-sm mb-2 block">
                            {field.label} ({field.unit})
                          </Label>
                          <Input
                            type="number"
                            placeholder={field.placeholder}
                            value={(setupData.biomarkers as any)[field.key]}
                            onChange={(e) =>
                              setSetupData({
                                ...setupData,
                                biomarkers: {
                                  ...setupData.biomarkers,
                                  [field.key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>All health data is encrypted and private</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Diet Info */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <Apple className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Diet Details</h2>
                      <p className="text-muted-foreground">
                        Help us avoid foods you can't or don't want to eat
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Food Allergies (comma separated)</Label>
                        <Input
                          placeholder="e.g., nuts, shellfish, soy"
                          value={setupData.allergies}
                          onChange={(e) =>
                            setSetupData({ ...setupData, allergies: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Foods You Dislike</Label>
                        <Textarea
                          placeholder="e.g., mushrooms, olives, cilantro"
                          value={setupData.food_dislikes}
                          onChange={(e) =>
                            setSetupData({ ...setupData, food_dislikes: e.target.value })
                          }
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Lifestyle */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Moon className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Lifestyle Habits</h2>
                      <p className="text-muted-foreground">
                        Understanding your daily routine
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label>Sleep Hours Per Night</Label>
                        <Select
                          value={setupData.sleep_hours}
                          onValueChange={(v) =>
                            setSetupData({ ...setupData, sleep_hours: v })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select sleep duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less_5">Less than 5 hours</SelectItem>
                            <SelectItem value="5_6">5-6 hours</SelectItem>
                            <SelectItem value="6_7">6-7 hours</SelectItem>
                            <SelectItem value="7_8">7-8 hours (Recommended)</SelectItem>
                            <SelectItem value="8_plus">8+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Stress Level</Label>
                        <RadioGroup
                          value={setupData.stress_level}
                          onValueChange={(v) =>
                            setSetupData({ ...setupData, stress_level: v })
                          }
                        >
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            {[
                              { value: 'low', emoji: '😌', label: 'Low' },
                              { value: 'moderate', emoji: '😐', label: 'Moderate' },
                              { value: 'high', emoji: '😰', label: 'High' },
                            ].map((level) => (
                              <label
                                key={level.value}
                                className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                                  setupData.stress_level === level.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <RadioGroupItem value={level.value} className="sr-only" />
                                <div className="text-3xl mb-2">{level.emoji}</div>
                                <div className="font-medium">{level.label}</div>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label>Daily Water Intake</Label>
                        <div className="mt-4">
                          <Slider
                            value={[setupData.water_intake]}
                            onValueChange={(v) =>
                              setSetupData({ ...setupData, water_intake: v[0] })
                            }
                            max={15}
                            min={1}
                            step={1}
                          />
                          <div className="flex justify-between mt-2 text-sm">
                            <span className="text-muted-foreground">1 glass</span>
                            <span className="font-bold text-primary">
                              {setupData.water_intake} glasses
                            </span>
                            <span className="text-muted-foreground">15 glasses</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            setupData.smokes
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() =>
                            setSetupData({ ...setupData, smokes: !setupData.smokes })
                          }
                        >
                          <div className="flex items-center justify-between">
                            <Label className="cursor-pointer">Do you smoke?</Label>
                            <Checkbox checked={setupData.smokes} />
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            setupData.drinks_alcohol
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() =>
                            setSetupData({
                              ...setupData,
                              drinks_alcohol: !setupData.drinks_alcohol,
                            })
                          }
                        >
                          <div className="flex items-center justify-between">
                            <Label className="cursor-pointer">Drink alcohol?</Label>
                            <Checkbox checked={setupData.drinks_alcohol} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Caffeine Intake</Label>
                        <Select
                          value={setupData.caffeine_intake}
                          onValueChange={(v) =>
                            setSetupData({ ...setupData, caffeine_intake: v })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select caffeine consumption" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="low">Low (1 cup/day)</SelectItem>
                            <SelectItem value="moderate">Moderate (2-3 cups/day)</SelectItem>
                            <SelectItem value="high">High (4+ cups/day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Fasting */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                        <Clock className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Intermittent Fasting</h2>
                      <p className="text-muted-foreground">
                        Track your eating windows (optional)
                      </p>
                    </div>

                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        setupData.fasting_enabled
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() =>
                        setSetupData({
                          ...setupData,
                          fasting_enabled: !setupData.fasting_enabled,
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold mb-1">Enable Fasting Tracking</p>
                          <p className="text-sm text-muted-foreground">
                            Track your eating windows and fasting periods
                          </p>
                        </div>
                        <Checkbox checked={setupData.fasting_enabled} />
                      </div>
                    </div>

                    {setupData.fasting_enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <Label>Fasting Method</Label>
                          <Select
                            value={setupData.fasting_method}
                            onValueChange={(v) =>
                              setSetupData({ ...setupData, fasting_method: v })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Choose fasting window" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="16_8">16:8 (16h fast, 8h eating)</SelectItem>
                              <SelectItem value="18_6">18:6 (18h fast, 6h eating)</SelectItem>
                              <SelectItem value="20_4">20:4 (20h fast, 4h eating)</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Meal Time</Label>
                            <Input
                              type="time"
                              value={setupData.eating_window_start}
                              onChange={(e) =>
                                setSetupData({
                                  ...setupData,
                                  eating_window_start: e.target.value,
                                })
                              }
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Last Meal Time</Label>
                            <Input
                              type="time"
                              value={setupData.eating_window_end}
                              onChange={(e) =>
                                setSetupData({
                                  ...setupData,
                                  eating_window_end: e.target.value,
                                })
                              }
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 6: Medications & Supplements */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                        <Pill className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Supplements & Medications</h2>
                      <p className="text-muted-foreground">
                        Track what you take daily (optional)
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Supplements */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-base font-semibold">Supplements</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSetupData({
                                ...setupData,
                                supplements: [
                                  ...setupData.supplements,
                                  { name: '', dosage: '', time: '', purpose: '' },
                                ],
                              })
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>

                        {setupData.supplements.length > 0 ? (
                          <div className="space-y-3">
                            {setupData.supplements.map((supp, idx) => (
                              <Card key={idx} className="border">
                                <CardContent className="p-4">
                                  <div className="grid grid-cols-2 gap-3 mb-2">
                                    <Input
                                      placeholder="Name (e.g., Vitamin D)"
                                      value={supp.name}
                                      onChange={(e) => {
                                        const newSupps = [...setupData.supplements];
                                        newSupps[idx].name = e.target.value;
                                        setSetupData({ ...setupData, supplements: newSupps });
                                      }}
                                    />
                                    <Input
                                      placeholder="Dosage (e.g., 1000 IU)"
                                      value={supp.dosage}
                                      onChange={(e) => {
                                        const newSupps = [...setupData.supplements];
                                        newSupps[idx].dosage = e.target.value;
                                        setSetupData({ ...setupData, supplements: newSupps });
                                      }}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setSetupData({
                                        ...setupData,
                                        supplements: setupData.supplements.filter(
                                          (_, i) => i !== idx
                                        ),
                                      })
                                    }
                                    className="text-destructive"
                                  >
                                    Remove
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No supplements added
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Similar structure for medications... */}
                    </div>
                  </div>
                )}

                {/* Step 7: Focus Areas */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                        <Target className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">App Focus Areas</h2>
                      <p className="text-muted-foreground">
                        What should we prioritize for you?
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'nutrition', label: 'Nutrition', icon: Apple },
                        { value: 'exercise', label: 'Exercise', icon: Activity },
                        { value: 'sleep', label: 'Sleep', icon: Moon },
                        { value: 'fasting', label: 'Fasting', icon: Clock },
                        { value: 'hydration', label: 'Hydration', icon: Droplet },
                        { value: 'supplements', label: 'Supplements', icon: Pill },
                      ].map((area) => {
                        const Icon = area.icon;
                        const isSelected = setupData.focus_areas.includes(area.value);
                        return (
                          <div
                            key={area.value}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => {
                              const areas = isSelected
                                ? setupData.focus_areas.filter((a) => a !== area.value)
                                : [...setupData.focus_areas, area.value];
                              setSetupData({ ...setupData, focus_areas: areas });
                            }}
                          >
                            <Icon className="w-8 h-8 mb-2 mx-auto" />
                            <p className="font-medium text-center">{area.label}</p>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-primary mx-auto mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3 pt-4">
                      <h3 className="font-semibold">Notifications & Preferences</h3>
                      {[
                        {
                          key: 'notifications_enabled',
                          label: 'Push Notifications',
                          desc: 'Reminders for meals, workouts, etc.',
                        },
                        {
                          key: 'daily_email',
                          label: 'Daily Email Summary',
                          desc: 'Receive daily progress recap',
                        },
                        {
                          key: 'ai_suggestions',
                          label: 'AI Smart Suggestions',
                          desc: 'Personalized recommendations',
                        },
                      ].map((pref) => (
                        <div
                          key={pref.key}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            (setupData as any)[pref.key]
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                          onClick={() =>
                            setSetupData({
                              ...setupData,
                              [pref.key]: !(setupData as any)[pref.key],
                            })
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{pref.label}</p>
                              <p className="text-sm text-muted-foreground">{pref.desc}</p>
                            </div>
                            <Checkbox checked={(setupData as any)[pref.key]} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 8: Finish */}
                {currentStep === 8 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award className="w-16 h-16 text-white" />
                    </motion.div>

                    <div>
                      <h1 className="text-4xl font-bold mb-4">Profile Complete! 🎉</h1>
                      <p className="text-xl text-muted-foreground mb-8">
                        Your personalized experience is now fully activated!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <Brain className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                          <p className="font-semibold">AI Recommendations</p>
                          <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-500" />
                          <p className="font-semibold">Personalized Plans</p>
                          <p className="text-xs text-muted-foreground mt-1">Active</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < SETUP_STEPS.length ? (
            <Button onClick={nextStep} className="gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={completeSetup}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
