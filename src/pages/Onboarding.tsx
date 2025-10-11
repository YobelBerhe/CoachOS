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
          dietary_restrictions: formData.dietary_restrictions
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

  const FloatingElement = ({ children, delay = 0 }: any) => (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [-2, 2, -2]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );

  const Step3DCard = ({ children, isActive }: any) => (
    <motion.div
      initial={{ opacity: 0, rotateY: -20, z: -100 }}
      animate={{ 
        opacity: isActive ? 1 : 0.5, 
        rotateY: isActive ? 0 : -20,
        z: isActive ? 0 : -100,
        scale: isActive ? 1 : 0.95
      }}
      exit={{ opacity: 0, rotateY: 20, z: -100 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute bottom-40 left-1/4 w-36 h-36 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-3xl" />
        </FloatingElement>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-4xl">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((currentStep / STEPS.length) * 100)}% complete
            </p>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isPast = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isPast
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isCurrent ? 'translateZ(20px)' : 'translateZ(0px)'
                    }}
                  >
                    {isPast ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </motion.div>
                  <p className={`text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <Step3DCard key={currentStep} isActive={true}>
            <Card className="border-0 shadow-2xl backdrop-blur-xl bg-background/95 max-h-[calc(100vh-280px)] overflow-hidden">
              <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
                {/* Step 1: Welcome */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                  >
                    <FloatingElement>
                      <motion.div
                        className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl shadow-2xl"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: 'translateZ(50px)'
                        }}
                      >
                        🎯
                      </motion.div>
                    </FloatingElement>

                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to Your Journey!
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Let's set up your personalized health & fitness plan. This will only take 2 minutes! 🚀
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Target className="w-8 h-8 text-blue-500 mb-3 mx-auto" />
                        <h3 className="font-semibold mb-2">Personalized Goals</h3>
                        <p className="text-sm text-muted-foreground">Custom plans built for YOU</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Activity className="w-8 h-8 text-green-500 mb-3 mx-auto" />
                        <h3 className="font-semibold mb-2">Track Progress</h3>
                        <p className="text-sm text-muted-foreground">Watch yourself improve</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Award className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
                        <h3 className="font-semibold mb-2">Earn Rewards</h3>
                        <p className="text-sm text-muted-foreground">Unlock achievements</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Goal Selection */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <FloatingElement>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-xl">
                          🎯
                        </div>
                      </FloatingElement>
                      <h2 className="text-2xl font-bold mt-3 mb-1">Your Goal</h2>
                      <p className="text-sm text-muted-foreground">Choose what matters most to you</p>
                    </div>

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
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center text-2xl`}>
                                {goal.icon}
                              </div>
                              <span className="font-semibold text-sm">{goal.value}</span>
                              {formData.goal_type === goal.value && (
                                <CheckCircle className="w-4 h-4 text-primary absolute top-2 right-2" />
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>

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
                                  <RadioGroupItem value={pace.value} />
                                  <span className="text-xl">{pace.icon}</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{pace.label}</p>
                                    <p className="text-xs text-muted-foreground">{pace.desc}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Personal Info */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <FloatingElement>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl">
                          👤
                        </div>
                      </FloatingElement>
                      <h2 className="text-2xl font-bold mt-3 mb-1">About You</h2>
                      <p className="text-sm text-muted-foreground">Help us personalize your plan</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Full Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={formData.full_name}
                          onChange={(e) => updateFormData({ full_name: e.target.value })}
                          className="h-10 mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Age</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={formData.age}
                            onChange={(e) => updateFormData({ age: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Sex</Label>
                          <RadioGroup value={formData.sex} onValueChange={(v) => updateFormData({ sex: v })}>
                            <div className="flex gap-2 mt-1">
                              {['Male', 'Female', 'Other'].map((sex) => (
                                <label
                                  key={sex}
                                  className={`flex-1 p-2 rounded-lg border-2 cursor-pointer text-center transition-colors text-sm ${
                                    formData.sex === sex
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border'
                                  }`}
                                >
                                  <RadioGroupItem value={sex} className="sr-only" />
                                  <span className="font-medium">{sex}</span>
                                </label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Height (cm)</Label>
                          <Input
                            type="number"
                            placeholder="175"
                            value={formData.height_cm}
                            onChange={(e) => updateFormData({ height_cm: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Current Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="80"
                            value={formData.current_weight_kg}
                            onChange={(e) => updateFormData({ current_weight_kg: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                      </div>

                      {formData.current_weight_kg && formData.target_weight_kg && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Weight to {formData.goal_type === 'Lose Weight' ? 'lose' : 'gain'}:</span>
                            <span className="text-xl font-bold">
                              {Math.abs(parseFloat(formData.current_weight_kg) - parseFloat(formData.target_weight_kg)).toFixed(1)} kg
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Activity Level */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <FloatingElement>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl shadow-xl">
                          🏃
                        </div>
                      </FloatingElement>
                      <h2 className="text-2xl font-bold mt-3 mb-1">Activity Level</h2>
                      <p className="text-sm text-muted-foreground">Outside of planned workouts</p>
                    </div>

                    <RadioGroup value={formData.activity_level} onValueChange={(v) => updateFormData({ activity_level: v })}>
                      <div className="space-y-2">
                        {[
                          { value: 'Sedentary', icon: '🪑', desc: 'Desk job, little exercise', multiplier: '1.2x' },
                          { value: 'Light', icon: '🚶', desc: 'Light exercise 1-3 days/week', multiplier: '1.375x' },
                          { value: 'Moderate', icon: '🏃', desc: 'Moderate 3-5 days/week', multiplier: '1.55x' },
                          { value: 'Active', icon: '🚴', desc: 'Heavy 6-7 days/week', multiplier: '1.725x' },
                          { value: 'Very Active', icon: '🏋️', desc: 'Very heavy/physical job', multiplier: '1.9x' }
                        ].map((level) => (
                          <label
                            key={level.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.activity_level === level.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={level.value} />
                            <span className="text-2xl">{level.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{level.value}</p>
                              <p className="text-xs text-muted-foreground truncate">{level.desc}</p>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{level.multiplier}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 5: Fitness Preferences */}
                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <FloatingElement>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-xl">
                          💪
                        </div>
                      </FloatingElement>
                      <h2 className="text-2xl font-bold mt-3 mb-1">Workout Style</h2>
                      <p className="text-sm text-muted-foreground">Plan your training</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Preferred Split</Label>
                        <RadioGroup value={formData.workout_preference} onValueChange={(v) => updateFormData({ workout_preference: v })}>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'Push/Pull/Legs', icon: '🔄' },
                              { value: 'Upper/Lower', icon: '⬆️' },
                              { value: 'Full Body', icon: '💪' },
                              { value: 'Bro Split', icon: '🏋️' }
                            ].map((split) => (
                              <label
                                key={split.value}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  formData.workout_preference === split.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={split.value} className="sr-only" />
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{split.icon}</span>
                                  <span className="font-medium text-sm">{split.value}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Frequency (days/week)</Label>
                        <div className="flex gap-2">
                          {[3, 4, 5, 6].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => updateFormData({ workout_frequency: days.toString() })}
                              className={`flex-1 h-10 rounded-lg border-2 font-semibold transition-colors text-sm ${
                                formData.workout_frequency === days.toString()
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary'
                              }`}
                            >
                              {days}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Location</Label>
                        <RadioGroup value={formData.workout_location} onValueChange={(v) => updateFormData({ workout_location: v })}>
                          <div className="flex gap-2">
                            {[
                              { value: 'Gym', icon: '🏋️' },
                              { value: 'Home', icon: '🏠' }
                            ].map((loc) => (
                              <label
                                key={loc.value}
                                className={`flex-1 h-10 rounded-lg border-2 cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                                  formData.workout_location === loc.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={loc.value} className="sr-only" />
                                <span className="text-lg">{loc.icon}</span>
                                <span className="font-medium text-sm">{loc.value}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Experience Level</Label>
                        <RadioGroup value={formData.workout_experience} onValueChange={(v) => updateFormData({ workout_experience: v })}>
                          <div className="grid grid-cols-3 gap-2">
                            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                              <label
                                key={level}
                                className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-colors ${
                                  formData.workout_experience === level
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={level} className="sr-only" />
                                <span className="font-medium text-sm block">{level}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Nutrition Preferences */}
                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <FloatingElement>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-xl">
                          🍎
                        </div>
                      </FloatingElement>
                      <h2 className="text-2xl font-bold mt-3 mb-1">Nutrition</h2>
                      <p className="text-sm text-muted-foreground">Your meal preferences</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Dietary Restrictions</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo'].map((diet) => (
                            <label
                              key={diet}
                              className={`p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                                formData.dietary_restrictions.includes(diet)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={formData.dietary_restrictions.includes(diet)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateFormData({ dietary_restrictions: [...formData.dietary_restrictions, diet] });
                                    } else {
                                      updateFormData({ dietary_restrictions: formData.dietary_restrictions.filter(d => d !== diet) });
                                    }
                                  }}
                                />
                                <span className="font-medium text-xs">{diet}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Meal Prep Style</Label>
                        <RadioGroup value={formData.meal_prep_preference} onValueChange={(v) => updateFormData({ meal_prep_preference: v })}>
                          <div className="space-y-2">
                            {[
                              { value: 'Daily', icon: '☀️', desc: 'Cook fresh daily' },
                              { value: 'Weekly', icon: '📦', desc: 'Batch prep weekly' },
                              { value: 'Mixed', icon: '🔄', desc: 'Combination' }
                            ].map((prep) => (
                              <label
                                key={prep.value}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  formData.meal_prep_preference === prep.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={prep.value} />
                                <span className="text-xl">{prep.icon}</span>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{prep.value}</p>
                                  <p className="text-xs text-muted-foreground">{prep.desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Cooking Experience</Label>
                        <RadioGroup value={formData.cooking_skill} onValueChange={(v) => updateFormData({ cooking_skill: v })}>
                          <div className="grid grid-cols-3 gap-2">
                            {['Beginner', 'Intermediate', 'Expert'].map((skill) => (
                              <label
                                key={skill}
                                className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-colors ${
                                  formData.cooking_skill === skill
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={skill} className="sr-only" />
                                <ChefHat className="w-5 h-5 mx-auto mb-1" />
                                <span className="font-medium text-xs block break-words">{skill}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Finish */}
                {currentStep === 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-5xl shadow-xl mb-4"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      🏆
                    </motion.div>

                    <div>
                      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        You're All Set!
                      </h1>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        Your personalized health plan is ready 💪
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <Target className="w-8 h-8 text-blue-500 mb-2" />
                        <h3 className="font-bold text-sm mb-1">Goal: {formData.goal_type}</h3>
                        <p className="text-xs text-muted-foreground">
                          Target: {formData.target_weight_kg}kg
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <Dumbbell className="w-8 h-8 text-green-500 mb-2" />
                        <h3 className="font-bold text-sm mb-1">{formData.workout_frequency}x/week</h3>
                        <p className="text-xs text-muted-foreground">
                          {formData.workout_preference}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                        <Apple className="w-8 h-8 text-orange-500 mb-2" />
                        <h3 className="font-bold text-sm mb-1">{formData.meal_prep_preference}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formData.dietary_restrictions.length} restrictions
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <Activity className="w-8 h-8 text-purple-500 mb-2" />
                        <h3 className="font-bold text-sm mb-1">{formData.activity_level}</h3>
                        <p className="text-xs text-muted-foreground">
                          Activity Level
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </Step3DCard>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-4 pt-4 border-t sticky bottom-0 bg-background"
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              {loading ? 'Setting up...' : "Let's Go!"}
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
