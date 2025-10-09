import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Target,
  Heart,
  AlertTriangle,
  Activity,
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';

const STEPS = 6;

// Health conditions options
const HEALTH_CONDITIONS = [
  'Diabetes (Type 1)',
  'Diabetes (Type 2)',
  'High Blood Pressure',
  'High Cholesterol',
  'Heart Disease',
  'Thyroid Issues',
  'PCOS',
  'Asthma',
  'Arthritis',
  'Kidney Disease',
  'Liver Disease',
  'None'
];

// Common allergens
const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'Gluten',
  'Lactose',
  'Sulfites',
  'None'
];

// Biomarkers
const BIOMARKER_LIST = [
  { name: 'Potassium (K)', unit: 'mmol/L', normalMin: 3.5, normalMax: 5.0 },
  { name: 'Magnesium (Mg)', unit: 'mg/dL', normalMin: 1.7, normalMax: 2.2 },
  { name: 'Vitamin D', unit: 'ng/mL', normalMin: 30, normalMax: 100 },
  { name: 'Iron', unit: 'µg/dL', normalMin: 60, normalMax: 170 },
  { name: 'Hemoglobin', unit: 'g/dL', normalMin: 12, normalMax: 17 },
  { name: 'Glucose (Fasting)', unit: 'mg/dL', normalMin: 70, normalMax: 100 },
  { name: 'Cholesterol (Total)', unit: 'mg/dL', normalMin: 125, normalMax: 200 },
  { name: 'HDL (Good)', unit: 'mg/dL', normalMin: 40, normalMax: 60 },
  { name: 'LDL (Bad)', unit: 'mg/dL', normalMin: 0, normalMax: 100 }
];

// Workout preferences
const WORKOUT_SPLITS = [
  'Push/Pull/Legs',
  'Upper/Lower',
  'Full Body',
  'Bro Split (Chest/Back/Legs/Arms)',
  'Not sure - recommend for me'
];

export default function OnboardingExtended() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string>('');

  // Step 1 & 2 data (existing)
  const [basicInfo, setBasicInfo] = useState({
    fullName: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    activityLevel: ''
  });
  const [goalInfo, setGoalInfo] = useState({
    type: '',
    targetWeight: '',
    aggression: ''
  });

  // Step 3: Health Conditions
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Step 4: Allergies
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [allergySeverities, setAllergySeverities] = useState<Record<string, string>>({});

  // Step 5: Biomarkers (optional)
  const [biomarkers, setBiomarkers] = useState<Record<string, string>>({});
  const [skipBiomarkers, setSkipBiomarkers] = useState(false);

  // Step 6: Preferences
  const [preferences, setPreferences] = useState({
    workoutSplit: '',
    workoutFrequency: '3',
    workoutLocation: 'Gym',
    workoutExperience: 'Beginner',
    dietType: 'Balanced',
    fastingPlan: 'No'
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

  const progress = (currentStep / STEPS) * 100;

  async function handleComplete() {
    try {
      // Step 1: Save profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: basicInfo.fullName,
          age: parseInt(basicInfo.age),
          sex: basicInfo.sex,
          height_cm: parseFloat(basicInfo.height),
          activity_level: basicInfo.activityLevel,
          health_conditions: selectedConditions.filter(c => c !== 'None'),
          workout_preference: preferences.workoutSplit,
          workout_frequency: parseInt(preferences.workoutFrequency),
          workout_location: preferences.workoutLocation,
          workout_experience: preferences.workoutExperience
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Step 2: Save goal
      const { error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          type: goalInfo.type,
          current_weight_kg: parseFloat(basicInfo.weight),
          target_weight_kg: parseFloat(goalInfo.targetWeight),
          aggression: goalInfo.aggression,
          is_active: true
        });

      if (goalError) throw goalError;

      // Step 3: Save allergies
      if (selectedAllergies.length > 0 && !selectedAllergies.includes('None')) {
        const allergyInserts = selectedAllergies.map(allergen => ({
          user_id: userId,
          allergen_name: allergen,
          severity: allergySeverities[allergen] || 'moderate'
        }));

        const { error: allergyError } = await supabase
          .from('user_allergies')
          .insert(allergyInserts);

        if (allergyError) throw allergyError;
      }

      // Step 4: Save biomarkers
      if (!skipBiomarkers) {
        const biomarkerInserts = Object.entries(biomarkers)
          .filter(([_, value]) => value && value !== '')
          .map(([name, value]) => {
            const biomarkerDef = BIOMARKER_LIST.find(b => b.name === name);
            const numValue = parseFloat(value);
            return {
              user_id: userId,
              biomarker_name: name,
              biomarker_value: numValue,
              unit: biomarkerDef?.unit,
              normal_range_min: biomarkerDef?.normalMin,
              normal_range_max: biomarkerDef?.normalMax,
              is_normal: numValue >= (biomarkerDef?.normalMin || 0) && 
                        numValue <= (biomarkerDef?.normalMax || 999),
              test_date: new Date().toISOString().split('T')[0]
            };
          });

        if (biomarkerInserts.length > 0) {
          const { error: biomarkerError } = await supabase
            .from('user_biomarkers')
            .insert(biomarkerInserts);

          if (biomarkerError) throw biomarkerError;
        }
      }

      // Step 5: Create fasting plan if selected
      if (preferences.fastingPlan !== 'No') {
        const fastingWindows: Record<string, { start: string; end: string }> = {
          '16:8': { start: '12:00', end: '20:00' },
          '18:6': { start: '13:00', end: '19:00' },
          '20:4': { start: '14:00', end: '18:00' }
        };

        const window = fastingWindows[preferences.fastingPlan];
        if (window) {
          await supabase.from('fasting_plans').insert({
            user_id: userId,
            type: preferences.fastingPlan,
            eating_window_start: window.start,
            eating_window_end: window.end,
            is_active: true
          });
        }
      }

      toast({
        title: "Welcome to CoachOS! 🎉",
        description: "Your personalized health journey starts now!"
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  function toggleCondition(condition: string) {
    if (condition === 'None') {
      setSelectedConditions(['None']);
    } else {
      setSelectedConditions(prev => {
        const filtered = prev.filter(c => c !== 'None');
        return filtered.includes(condition)
          ? filtered.filter(c => c !== condition)
          : [...filtered, condition];
      });
    }
  }

  function toggleAllergy(allergen: string) {
    if (allergen === 'None') {
      setSelectedAllergies(['None']);
      setAllergySeverities({});
    } else {
      setSelectedAllergies(prev => {
        const filtered = prev.filter(a => a !== 'None');
        return filtered.includes(allergen)
          ? filtered.filter(a => a !== allergen)
          : [...filtered, allergen];
      });
      if (!allergySeverities[allergen]) {
        setAllergySeverities(prev => ({ ...prev, [allergen]: 'moderate' }));
      }
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return basicInfo.fullName && basicInfo.age && basicInfo.sex && 
               basicInfo.height && basicInfo.weight && basicInfo.activityLevel;
      case 2:
        return goalInfo.type && goalInfo.targetWeight && goalInfo.aggression;
      case 3:
        return selectedConditions.length > 0;
      case 4:
        return selectedAllergies.length > 0;
      case 5:
        return true; // Biomarkers are optional
      case 6:
        return preferences.workoutSplit && preferences.dietType;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Welcome to CoachOS</h1>
            <Badge variant="secondary">Step {currentStep} of {STEPS}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Let's personalize your health journey
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Basic Information</h2>
                    <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={basicInfo.fullName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, fullName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={basicInfo.age}
                        onChange={(e) => setBasicInfo({ ...basicInfo, age: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Sex</Label>
                      <Select value={basicInfo.sex} onValueChange={(v) => setBasicInfo({ ...basicInfo, sex: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="175"
                        value={basicInfo.height}
                        onChange={(e) => setBasicInfo({ ...basicInfo, height: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="70"
                        value={basicInfo.weight}
                        onChange={(e) => setBasicInfo({ ...basicInfo, weight: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Activity Level</Label>
                    <Select value={basicInfo.activityLevel} onValueChange={(v) => setBasicInfo({ ...basicInfo, activityLevel: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="Light">Light (exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="Moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="Active">Active (exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="Very Active">Very Active (intense daily exercise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Your Health Goal</h2>
                    <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Primary Goal</Label>
                    <Select value={goalInfo.type} onValueChange={(v) => setGoalInfo({ ...goalInfo, type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lose Weight">🏃 Lose Body Fat</SelectItem>
                        <SelectItem value="Gain Muscle">💪 Gain Muscle</SelectItem>
                        <SelectItem value="Maintain Weight">⚖️ Maintain Weight</SelectItem>
                        <SelectItem value="Improve Energy">🔋 Boost Energy</SelectItem>
                        <SelectItem value="Improve Heart Health">❤️ Improve Heart Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Weight (kg)</Label>
                    <Input
                      type="number"
                      placeholder="65"
                      value={goalInfo.targetWeight}
                      onChange={(e) => setGoalInfo({ ...goalInfo, targetWeight: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Goal Pace</Label>
                    <Select value={goalInfo.aggression} onValueChange={(v) => setGoalInfo({ ...goalInfo, aggression: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Slow">🐢 Slow & Steady (0.25kg/week)</SelectItem>
                        <SelectItem value="Moderate">⚡ Moderate (0.5kg/week)</SelectItem>
                        <SelectItem value="Aggressive">🔥 Aggressive (1kg/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Health Conditions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Health Conditions</h2>
                    <p className="text-sm text-muted-foreground">
                      Help us personalize your nutrition (optional but recommended)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {HEALTH_CONDITIONS.map(condition => (
                    <div
                      key={condition}
                      onClick={() => toggleCondition(condition)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedConditions.includes(condition)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedConditions.includes(condition)} />
                        <span className="text-sm font-medium">{condition}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 <strong>Why we ask:</strong> Your health conditions help us recommend foods that support your wellness and avoid those that might not be suitable.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Allergies */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Food Allergies</h2>
                    <p className="text-sm text-muted-foreground">
                      We'll warn you when logging allergenic foods
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {COMMON_ALLERGENS.map(allergen => (
                    <div key={allergen}>
                      <div
                        onClick={() => toggleAllergy(allergen)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAllergies.includes(allergen)
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'border-border hover:border-red-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={selectedAllergies.includes(allergen)} />
                          <span className="text-sm font-medium">{allergen}</span>
                        </div>
                      </div>

                      {selectedAllergies.includes(allergen) && allergen !== 'None' && (
                        <Select
                          value={allergySeverities[allergen] || 'moderate'}
                          onValueChange={(v) => setAllergySeverities({ ...allergySeverities, [allergen]: v })}
                        >
                          <SelectTrigger className="mt-2 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                            <SelectItem value="life-threatening">Life-threatening</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    ⚠️ <strong>Safety First:</strong> We'll alert you before you log any food containing your allergens. You can still log it if you choose.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Biomarkers */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Blood Test Results (Optional)</h2>
                    <p className="text-sm text-muted-foreground">
                      For deeper personalization - skip if you don't have recent results
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={skipBiomarkers}
                    onCheckedChange={(checked) => setSkipBiomarkers(checked as boolean)}
                  />
                  <Label className="font-normal cursor-pointer">
                    Skip for now - I don't have blood test results
                  </Label>
                </div>

                {!skipBiomarkers && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {BIOMARKER_LIST.map(biomarker => (
                      <div key={biomarker.name} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">{biomarker.name}</Label>
                          <span className="text-xs text-muted-foreground">
                            Normal: {biomarker.normalMin}-{biomarker.normalMax} {biomarker.unit}
                          </span>
                        </div>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={`e.g., ${biomarker.normalMin}`}
                          value={biomarkers[biomarker.name] || ''}
                          onChange={(e) => setBiomarkers({ ...biomarkers, [biomarker.name]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    🧬 <strong>Smart Recommendations:</strong> With your biomarkers, we can suggest foods rich in nutrients you're deficient in!
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Preferences */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Final Preferences</h2>
                    <p className="text-sm text-muted-foreground">
                      Customize your workout and eating style
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Workout Split Preference</Label>
                    <Select value={preferences.workoutSplit} onValueChange={(v) => setPreferences({ ...preferences, workoutSplit: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout style" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKOUT_SPLITS.map(split => (
                          <SelectItem key={split} value={split}>{split}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Workout Frequency</Label>
                      <Select value={preferences.workoutFrequency} onValueChange={(v) => setPreferences({ ...preferences, workoutFrequency: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days/week</SelectItem>
                          <SelectItem value="4">4 days/week</SelectItem>
                          <SelectItem value="5">5 days/week</SelectItem>
                          <SelectItem value="6">6 days/week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Workout Location</Label>
                      <Select value={preferences.workoutLocation} onValueChange={(v) => setPreferences({ ...preferences, workoutLocation: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gym">🏋️ Gym</SelectItem>
                          <SelectItem value="Home">🏠 Home</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Experience Level</Label>
                    <Select value={preferences.workoutExperience} onValueChange={(v) => setPreferences({ ...preferences, workoutExperience: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner (0-1 year)</SelectItem>
                        <SelectItem value="Intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="Advanced">Advanced (3+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Diet Type</Label>
                    <Select value={preferences.dietType} onValueChange={(v) => setPreferences({ ...preferences, dietType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Balanced">Balanced</SelectItem>
                        <SelectItem value="High Protein">High Protein</SelectItem>
                        <SelectItem value="Keto">Keto</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Intermittent Fasting</Label>
                    <Select value={preferences.fastingPlan} onValueChange={(v) => setPreferences({ ...preferences, fastingPlan: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No fasting</SelectItem>
                        <SelectItem value="16:8">16:8 (16h fast, 8h eating)</SelectItem>
                        <SelectItem value="18:6">18:6 (18h fast, 6h eating)</SelectItem>
                        <SelectItem value="20:4">20:4 (20h fast, 4h eating)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Almost Done! 🎉
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Click "Complete Setup" to start your personalized health journey with CoachOS!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < STEPS ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
