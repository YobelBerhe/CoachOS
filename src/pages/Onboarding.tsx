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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
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
            <Card className="border-0 shadow-2xl backdrop-blur-xl bg-background/95">
              <CardContent className="p-8 md:p-12">
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <FloatingElement>
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl mb-4 shadow-2xl">
                          🎯
                        </div>
                      </FloatingElement>
                      <h2 className="text-3xl font-bold mb-2">What's Your Main Goal?</h2>
                      <p className="text-muted-foreground">Choose what matters most to you right now</p>
                    </div>

                    <RadioGroup value={formData.goal_type} onValueChange={(v) => setFormData({ ...formData, goal_type: v })}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { value: 'Lose Weight', icon: '📉', color: 'from-green-500 to-emerald-500', desc: 'Burn fat & get lean' },
                          { value: 'Gain Muscle', icon: '💪', color: 'from-blue-500 to-purple-500', desc: 'Build strength & size' },
                          { value: 'Maintain Weight', icon: '⚖️', color: 'from-orange-500 to-yellow-500', desc: 'Stay consistent' },
                          { value: 'Improve Energy', icon: '⚡', color: 'from-yellow-500 to-orange-500', desc: 'Feel more energized' }
                        ].map((goal) => (
                          <motion.label
                            key={goal.value}
                            whileHover={{ scale: 1.02, z: 20 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.goal_type === goal.value
                                ? 'border-primary bg-primary/5 shadow-lg'
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <RadioGroupItem value={goal.value} className="sr-only" />
                            <div className="flex items-start gap-4">
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center text-3xl shadow-lg`}>
                                {goal.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{goal.value}</h3>
                                <p className="text-sm text-muted-foreground">{goal.desc}</p>
                              </div>
                              {formData.goal_type === goal.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-3 right-3"
                                >
                                  <CheckCircle className="w-6 h-6 text-primary" />
                                </motion.div>
                              )}
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </RadioGroup>

                    {formData.goal_type && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4"
                      >
                        <div>
                          <Label className="text-lg font-semibold mb-2 block">Target Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="70"
                            value={formData.target_weight_kg}
                            onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                            className="text-lg h-14"
                          />
                        </div>

                        <div>
                          <Label className="text-lg font-semibold mb-3 block">How Fast?</Label>
                          <RadioGroup value={formData.goal_aggression} onValueChange={(v) => setFormData({ ...formData, goal_aggression: v })}>
                            <div className="space-y-3">
                              {[
                                { value: 'Slow', icon: '🐢', label: 'Slow & Steady', desc: '0.25kg/week - Sustainable' },
                                { value: 'Moderate', icon: '⚡', label: 'Moderate', desc: '0.5kg/week - Balanced' },
                                { value: 'Aggressive', icon: '🔥', label: 'Aggressive', desc: '1kg/week - Fast results' }
                              ].map((pace) => (
                                <motion.label
                                  key={pace.value}
                                  whileHover={{ x: 5 }}
                                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    formData.goal_aggression === pace.value
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <RadioGroupItem value={pace.value} />
                                  <span className="text-2xl">{pace.icon}</span>
                                  <div className="flex-1">
                                    <p className="font-semibold">{pace.label}</p>
                                    <p className="text-sm text-muted-foreground">{pace.desc}</p>
                                  </div>
                                </motion.label>
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <FloatingElement>
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl mb-4 shadow-2xl">
                          👤
                        </div>
                      </FloatingElement>
                      <h2 className="text-3xl font-bold mb-2">Tell Us About Yourself</h2>
                      <p className="text-muted-foreground">This helps us personalize your plan</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="h-12"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Age</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div>
                          <Label>Sex</Label>
                          <RadioGroup value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: v })}>
                            <div className="flex gap-3">
                              {['Male', 'Female', 'Other'].map((sex) => (
                                <motion.label
                                  key={sex}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                                    formData.sex === sex
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border'
                                  }`}
                                >
                                  <RadioGroupItem value={sex} className="sr-only" />
                                  <span className="font-medium">{sex}</span>
                                </motion.label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Height (cm)</Label>
                          <Input
                            type="number"
                            placeholder="175"
                            value={formData.height_cm}
                            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div>
                          <Label>Current Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="80"
                            value={formData.current_weight_kg}
                            onChange={(e) => setFormData({ ...formData, current_weight_kg: e.target.value })}
                            className="h-12"
                          />
                        </div>
                      </div>

                      {formData.current_weight_kg && formData.target_weight_kg && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Weight to {formData.goal_type === 'Lose Weight' ? 'lose' : 'gain'}:</span>
                            <span className="text-2xl font-bold">
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <FloatingElement>
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-5xl mb-4 shadow-2xl">
                          🏃
                        </div>
                      </FloatingElement>
                      <h2 className="text-3xl font-bold mb-2">How Active Are You?</h2>
                      <p className="text-muted-foreground">Outside of planned workouts</p>
                    </div>

                    <RadioGroup value={formData.activity_level} onValueChange={(v) => setFormData({ ...formData, activity_level: v })}>
                      <div className="space-y-4">
                        {[
                          { value: 'Sedentary', icon: '🪑', desc: 'Desk job, little/no exercise', multiplier: '1.2x' },
                          { value: 'Light', icon: '🚶', desc: 'Light exercise 1-3 days/week', multiplier: '1.375x' },
                          { value: 'Moderate', icon: '🏃', desc: 'Moderate exercise 3-5 days/week', multiplier: '1.55x' },
                          { value: 'Active', icon: '🚴', desc: 'Heavy exercise 6-7 days/week', multiplier: '1.725x' },
                          { value: 'Very Active', icon: '🏋️', desc: 'Very heavy/physical job', multiplier: '1.9x' }
                        ].map((level) => (
                          <motion.label
                            key={level.value}
                            whileHover={{ x: 5 }}
                            className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.activity_level === level.value
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={level.value} />
                            <span className="text-3xl">{level.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{level.value}</p>
                              <p className="text-sm text-muted-foreground">{level.desc}</p>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{level.multiplier}</span>
                          </motion.label>
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <FloatingElement>
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-5xl mb-4 shadow-2xl">
                          💪
                        </div>
                      </FloatingElement>
                      <h2 className="text-3xl font-bold mb-2">Your Workout Style</h2>
                      <p className="text-muted-foreground">Let's plan your training</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Preferred Split</Label>
                        <RadioGroup value={formData.workout_preference} onValueChange={(v) => setFormData({ ...formData, workout_preference: v })}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { value: 'Push/Pull/Legs', icon: '🔄' },
                              { value: 'Upper/Lower', icon: '⬆️' },
                              { value: 'Full Body', icon: '💪' },
                              { value: 'Bro Split', icon: '🏋️' }
                            ].map((split) => (
                              <motion.label
                                key={split.value}
                                whileHover={{ scale: 1.03 }}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  formData.workout_preference === split.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={split.value} className="sr-only" />
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{split.icon}</span>
                                  <span className="font-medium">{split.value}</span>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Frequency (days/week)</Label>
                          <div className="flex gap-2 mt-2">
                            {[3, 4, 5, 6].map((days) => (
                              <motion.button
                                key={days}
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData({ ...formData, workout_frequency: days.toString() })}
                                className={`flex-1 h-12 rounded-lg border-2 font-semibold transition-all ${
                                  formData.workout_frequency === days.toString()
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                {days}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Location</Label>
                          <RadioGroup value={formData.workout_location} onValueChange={(v) => setFormData({ ...formData, workout_location: v })}>
                            <div className="flex gap-2 mt-2">
                              {[
                                { value: 'Gym', icon: '🏋️' },
                                { value: 'Home', icon: '🏠' }
                              ].map((loc) => (
                                <motion.label
                                  key={loc.value}
                                  whileHover={{ scale: 1.05 }}
                                  className={`flex-1 h-12 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                    formData.workout_location === loc.value
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border'
                                  }`}
                                >
                                  <RadioGroupItem value={loc.value} className="sr-only" />
                                  <span className="text-xl">{loc.icon}</span>
                                  <span className="font-medium">{loc.value}</span>
                                </motion.label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div>
                        <Label>Experience Level</Label>
                        <RadioGroup value={formData.workout_experience} onValueChange={(v) => setFormData({ ...formData, workout_experience: v })}>
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                              <motion.label
                                key={level}
                                whileHover={{ scale: 1.05 }}
                                className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                                  formData.workout_experience === level
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={level} className="sr-only" />
                                <span className="font-medium">{level}</span>
                              </motion.label>
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <FloatingElement>
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-5xl mb-4 shadow-2xl">
                          🍎
                        </div>
                      </FloatingElement>
                      <h2 className="text-3xl font-bold mb-2">Nutrition Preferences</h2>
                      <p className="text-muted-foreground">Customize your meal plans</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Dietary Restrictions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo'].map((diet) => (
                            <motion.label
                              key={diet}
                              whileHover={{ scale: 1.03 }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                                      setFormData({ ...formData, dietary_restrictions: [...formData.dietary_restrictions, diet] });
                                    } else {
                                      setFormData({ ...formData, dietary_restrictions: formData.dietary_restrictions.filter(d => d !== diet) });
                                    }
                                  }}
                                />
                                <span className="font-medium">{diet}</span>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Meal Prep Style</Label>
                        <RadioGroup value={formData.meal_prep_preference} onValueChange={(v) => setFormData({ ...formData, meal_prep_preference: v })}>
                          <div className="space-y-3">
                            {[
                              { value: 'Daily', icon: '☀️', desc: 'Cook fresh every day' },
                              { value: 'Weekly', icon: '📦', desc: 'Batch prep for the week' },
                              { value: 'Mixed', icon: '🔄', desc: 'Combination of both' }
                            ].map((prep) => (
                              <motion.label
                                key={prep.value}
                                whileHover={{ x: 5 }}
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  formData.meal_prep_preference === prep.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={prep.value} />
                                <span className="text-2xl">{prep.icon}</span>
                                <div>
                                  <p className="font-semibold">{prep.value}</p>
                                  <p className="text-sm text-muted-foreground">{prep.desc}</p>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Cooking Experience</Label>
                        <RadioGroup value={formData.cooking_skill} onValueChange={(v) => setFormData({ ...formData, cooking_skill: v })}>
                          <div className="grid grid-cols-3 gap-3">
                            {['Beginner', 'Intermediate', 'Expert'].map((skill) => (
                              <motion.label
                                key={skill}
                                whileHover={{ scale: 1.05 }}
                                className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                                  formData.cooking_skill === skill
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={skill} className="sr-only" />
                                <ChefHat className="w-6 h-6 mx-auto mb-2" />
                                <span className="font-medium block">{skill}</span>
                              </motion.label>
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
                    className="text-center space-y-6"
                  >
                    <FloatingElement>
                      <motion.div
                        className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-6xl shadow-2xl mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        🏆
                      </motion.div>
                    </FloatingElement>

                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        You're All Set!
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Your personalized health plan is ready. Let's crush those goals! 💪
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Target className="w-10 h-10 text-blue-500 mb-3 mx-auto" />
                        <h3 className="font-bold text-lg mb-2">Goal: {formData.goal_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Target: {formData.target_weight_kg}kg
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Dumbbell className="w-10 h-10 text-green-500 mb-3 mx-auto" />
                        <h3 className="font-bold text-lg mb-2">{formData.workout_frequency}x per week</h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.workout_preference}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Apple className="w-10 h-10 text-orange-500 mb-3 mx-auto" />
                        <h3 className="font-bold text-lg mb-2">Meal Prep: {formData.meal_prep_preference}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.dietary_restrictions.length} restrictions
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Activity className="w-10 h-10 text-purple-500 mb-3 mx-auto" />
                        <h3 className="font-bold text-lg mb-2">{formData.activity_level}</h3>
                        <p className="text-sm text-muted-foreground">
                          Activity Level
                        </p>
                      </motion.div>
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
          className="flex items-center justify-between mt-8"
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
