import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowRight,
  ArrowLeft,
  Target,
  User,
  Dumbbell,
  Apple,
  Activity,
  Award,
  Sparkles,
  CheckCircle,
  ChefHat,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 1, title: 'Welcome', icon: Sparkles },
  { id: 2, title: 'Your Goal', icon: Target },
  { id: 3, title: 'About You', icon: User },
  { id: 4, title: 'Activity', icon: Activity },
  { id: 5, title: 'Fitness', icon: Dumbbell },
  { id: 6, title: 'Nutrition', icon: Apple },
  { id: 7, title: 'Finish', icon: Award }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Goal
    goal_type: '',
    target_weight_kg: '',
    goal_aggression: '',
    
    // Personal
    full_name: '',
    age: '',
    sex: '',
    height_cm: '',
    current_weight_kg: '',
    
    // Activity
    activity_level: '',
    
    // Fitness
    workout_preference: '',
    workout_frequency: '3',
    workout_location: 'Gym',
    workout_experience: 'Beginner',
    
    // Nutrition
    dietary_restrictions: [] as string[],
    meal_prep_preference: '',
    cooking_skill: 'Beginner'
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

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
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.goal_type && formData.target_weight_kg && formData.goal_aggression;
      case 3:
        return formData.full_name && formData.age && formData.sex && formData.height_cm && formData.current_weight_kg;
      case 4:
        return formData.activity_level;
      case 5:
        return formData.workout_preference;
      case 6:
        return formData.meal_prep_preference;
      case 7:
        return true;
      default:
        return false;
    }
  };

  async function completeOnboarding() {
    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age),
          sex: formData.sex,
          height_cm: parseFloat(formData.height_cm),
          activity_level: formData.activity_level,
          workout_preference: formData.workout_preference,
          workout_frequency: parseInt(formData.workout_frequency),
          workout_location: formData.workout_location,
          workout_experience: formData.workout_experience,
          dietary_restrictions: formData.dietary_restrictions,
          profile_completed: true
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Create goal
      const { error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          type: formData.goal_type,
          current_weight_kg: parseFloat(formData.current_weight_kg),
          target_weight_kg: parseFloat(formData.target_weight_kg),
          aggression: formData.goal_aggression,
          is_active: true
        });

      if (goalError) throw goalError;

      // Log initial weight
      const { error: weightError } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          weight_kg: parseFloat(formData.current_weight_kg)
        });

      if (weightError) throw weightError;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show success and redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((currentStep / STEPS.length) * 100)}% complete
            </p>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </motion.div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Welcome */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                      🎯
                    </div>

                    <div>
                      <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to Your Journey!
                      </h1>
                      <p className="text-muted-foreground">
                        Let's set up your personalized health & fitness plan. This will only take 2 minutes! 🚀
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <Target className="w-8 h-8 text-blue-500 mb-2 mx-auto" />
                        <h3 className="font-semibold text-sm mb-1">Personalized Goals</h3>
                        <p className="text-xs text-muted-foreground">Custom plans built for YOU</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <Activity className="w-8 h-8 text-green-500 mb-2 mx-auto" />
                        <h3 className="font-semibold text-sm mb-1">Track Progress</h3>
                        <p className="text-xs text-muted-foreground">Watch yourself improve</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                        <Award className="w-8 h-8 text-orange-500 mb-2 mx-auto" />
                        <h3 className="font-semibold text-sm mb-1">Earn Rewards</h3>
                        <p className="text-xs text-muted-foreground">Unlock achievements</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Goal */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl mb-2">
                        🎯
                      </div>
                      <h2 className="text-xl font-bold">Your Goal</h2>
                      <p className="text-sm text-muted-foreground">Choose what matters most to you</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Primary Goal</Label>
                      <RadioGroup value={formData.goal_type} onValueChange={(v) => updateFormData({ goal_type: v })}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Lose Weight', icon: '📉', color: 'from-green-500 to-emerald-500' },
                            { value: 'Gain Muscle', icon: '💪', color: 'from-blue-500 to-purple-500' },
                            { value: 'Maintain Weight', icon: '⚖️', color: 'from-orange-500 to-yellow-500' },
                            { value: 'Improve Energy', icon: '⚡', color: 'from-yellow-500 to-orange-500' }
                          ].map((goal) => (
                            <label
                              key={goal.value}
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                formData.goal_type === goal.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={goal.value} className="sr-only" />
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center text-xl`}>
                                  {goal.icon}
                                </div>
                                <span className="font-semibold text-xs">{goal.value}</span>
                                {formData.goal_type === goal.value && (
                                  <CheckCircle className="w-4 h-4 text-primary absolute top-2 right-2" />
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.goal_type && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 pt-2"
                      >
                        <div>
                          <Label className="text-sm font-semibold mb-1 block">Target Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="70"
                            value={formData.target_weight_kg}
                            onChange={(e) => updateFormData({ target_weight_kg: e.target.value })}
                            className="h-10"
                            autoComplete="off"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-semibold mb-2 block">Pace</Label>
                          <RadioGroup value={formData.goal_aggression} onValueChange={(v) => updateFormData({ goal_aggression: v })}>
                            <div className="space-y-2">
                              {[
                                { value: 'Slow', icon: '🐢', label: 'Slow', desc: '0.25kg/week' },
                                { value: 'Moderate', icon: '⚡', label: 'Moderate', desc: '0.5kg/week' },
                                { value: 'Aggressive', icon: '🔥', label: 'Fast', desc: '1kg/week' }
                              ].map((pace) => (
                                <label
                                  key={pace.value}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    formData.goal_aggression === pace.value
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <RadioGroupItem value={pace.value} className="sr-only" />
                                  <span className="text-2xl">{pace.icon}</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{pace.label}</p>
                                    <p className="text-xs text-muted-foreground">{pace.desc}</p>
                                  </div>
                                  {formData.goal_aggression === pace.value && (
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  )}
                                </label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: About You */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">About You</h2>
                      <p className="text-sm text-muted-foreground">Tell us a bit about yourself</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-1 block">Full Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => updateFormData({ full_name: e.target.value })}
                        className="h-10"
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">Age</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={formData.age}
                          onChange={(e) => updateFormData({ age: e.target.value })}
                          className="h-10"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">Sex</Label>
                        <RadioGroup value={formData.sex} onValueChange={(v) => updateFormData({ sex: v })}>
                          <div className="flex gap-2">
                            {['Male', 'Female'].map((sex) => (
                              <label
                                key={sex}
                                className={`flex-1 p-2 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                                  formData.sex === sex
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <RadioGroupItem value={sex} className="sr-only" />
                                <span className="text-sm font-semibold">{sex}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">Height (cm)</Label>
                        <Input
                          type="number"
                          placeholder="175"
                          value={formData.height_cm}
                          onChange={(e) => updateFormData({ height_cm: e.target.value })}
                          className="h-10"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="70"
                          value={formData.current_weight_kg}
                          onChange={(e) => updateFormData({ current_weight_kg: e.target.value })}
                          className="h-10"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Activity */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Activity Level</h2>
                      <p className="text-sm text-muted-foreground">How active are you daily?</p>
                    </div>

                    <RadioGroup value={formData.activity_level} onValueChange={(v) => updateFormData({ activity_level: v })}>
                      <div className="space-y-2">
                        {[
                          { value: 'Sedentary', icon: '🪑', desc: 'Little to no exercise' },
                          { value: 'Lightly Active', icon: '🚶', desc: 'Exercise 1-3 days/week' },
                          { value: 'Moderately Active', icon: '🏃', desc: 'Exercise 3-5 days/week' },
                          { value: 'Very Active', icon: '💪', desc: 'Exercise 6-7 days/week' },
                          { value: 'Extremely Active', icon: '🔥', desc: 'Physical job + exercise' }
                        ].map((level) => (
                          <label
                            key={level.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.activity_level === level.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={level.value} className="sr-only" />
                            <span className="text-2xl">{level.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{level.value}</p>
                              <p className="text-xs text-muted-foreground">{level.desc}</p>
                            </div>
                            {formData.activity_level === level.value && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 5: Fitness */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-2">
                        <Dumbbell className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Workout Style</h2>
                      <p className="text-sm text-muted-foreground">How do you like to exercise?</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Workout Preference</Label>
                      <RadioGroup value={formData.workout_preference} onValueChange={(v) => updateFormData({ workout_preference: v })}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Strength Training', icon: '🏋️' },
                            { value: 'Cardio', icon: '🏃' },
                            { value: 'Yoga', icon: '🧘' },
                            { value: 'Mixed', icon: '🎯' }
                          ].map((pref) => (
                            <label
                              key={pref.value}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                formData.workout_preference === pref.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={pref.value} className="sr-only" />
                              <div className="text-center">
                                <span className="text-2xl block mb-1">{pref.icon}</span>
                                <span className="text-xs font-semibold">{pref.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Frequency (days/week)</Label>
                      <RadioGroup value={formData.workout_frequency} onValueChange={(v) => updateFormData({ workout_frequency: v })}>
                        <div className="grid grid-cols-4 gap-2">
                          {['2', '3', '4', '5'].map((freq) => (
                            <label
                              key={freq}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                                formData.workout_frequency === freq
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={freq} className="sr-only" />
                              <span className="text-sm font-semibold">{freq}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Location</Label>
                      <RadioGroup value={formData.workout_location} onValueChange={(v) => updateFormData({ workout_location: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Gym', 'Home', 'Outdoors'].map((loc) => (
                            <label
                              key={loc}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                                formData.workout_location === loc
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={loc} className="sr-only" />
                              <span className="text-xs font-semibold break-words">{loc}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Experience</Label>
                      <RadioGroup value={formData.workout_experience} onValueChange={(v) => updateFormData({ workout_experience: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Beginner', 'Intermediate', 'Advanced'].map((exp) => (
                            <label
                              key={exp}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                                formData.workout_experience === exp
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={exp} className="sr-only" />
                              <span className="text-xs font-semibold break-words">{exp}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Nutrition */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-2">
                        <Apple className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Nutrition</h2>
                      <p className="text-sm text-muted-foreground">Your dietary preferences</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Dietary Restrictions</Label>
                      <div className="space-y-2">
                        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'None'].map((diet) => (
                          <div key={diet} className="flex items-center gap-2">
                            <Checkbox
                              id={diet}
                              checked={formData.dietary_restrictions.includes(diet)}
                              onCheckedChange={(checked) => {
                                const newRestrictions = checked
                                  ? [...formData.dietary_restrictions, diet]
                                  : formData.dietary_restrictions.filter((d) => d !== diet);
                                updateFormData({ dietary_restrictions: newRestrictions });
                              }}
                            />
                            <Label htmlFor={diet} className="text-sm cursor-pointer">
                              {diet}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Meal Prep</Label>
                      <RadioGroup value={formData.meal_prep_preference} onValueChange={(v) => updateFormData({ meal_prep_preference: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'I meal prep weekly', icon: '📦' },
                            { value: 'I cook fresh daily', icon: '🍳' },
                            { value: 'I eat out mostly', icon: '🍽️' },
                            { value: 'Mixed approach', icon: '🎯' }
                          ].map((meal) => (
                            <label
                              key={meal.value}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                formData.meal_prep_preference === meal.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={meal.value} className="sr-only" />
                              <span className="text-2xl">{meal.icon}</span>
                              <span className="text-sm font-semibold">{meal.value}</span>
                              {formData.meal_prep_preference === meal.value && (
                                <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Cooking Experience</Label>
                      <RadioGroup value={formData.cooking_skill} onValueChange={(v) => updateFormData({ cooking_skill: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Beginner', 'Intermediate', 'Advanced'].map((skill) => (
                            <label
                              key={skill}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                                formData.cooking_skill === skill
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={skill} className="sr-only" />
                              <span className="text-xs font-semibold break-words">{skill}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Finish */}
                {currentStep === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-24 h-24 mx-auto mb-4">
                      <Award className="w-full h-full text-yellow-500" />
                    </div>
                    
                    <motion.h2 
                      className="text-2xl font-bold mb-3"
                      animate={{ 
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      You're All Set!
                    </motion.h2>
                    
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Your personalized plan is ready. Let's start your journey to a healthier, happier you!
                    </p>

                    <div className="space-y-2 max-w-sm mx-auto">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">Personalized Dashboard</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Custom Workout Plans</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <Apple className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">Nutrition Tracking</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          {/* Navigation */}
          <div className="border-t p-6 bg-muted/30">
            <div className="flex gap-3">
              {currentStep > 1 && currentStep < 7 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < 7 && (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  type="button"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {currentStep === 7 && (
                <Button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  type="button"
                >
                  {loading ? 'Setting up...' : "Let's GO! 🚀"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
