import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useArchetypeTheme } from '@/contexts/ArchetypeThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  Sparkles, Target, User, Activity, Dumbbell, Apple, Moon, Sun,
  Coffee, Droplet, Brain, Heart, Book, Music, Users, Zap,
  Award, CheckCircle, ChevronLeft, ChevronRight, Camera,
  Clock, Sunrise, Sunset, AlertTriangle, Briefcase, Home,
  Smartphone, Tv, MessageSquare, UtensilsCrossed, Timer,
  Bell, Palette, Volume2, Smile, Frown, Meh, TrendingUp,
  Star, Trophy, Shield, Flame, Wind, Eye, Ear, Utensils,
  Pizza, Salad, Fish, Candy, Beer, Wine, Cigarette,
  Pill, Stethoscope, Siren, BedDouble, CloudRain, Cloudy,
  CloudSun, Thermometer, Waves, Mountain, Bike, Plane,
  Car, Bus, Train, Baby, Dog, Cat, GamepadIcon, Tv2,
  Headphones, Mic, Paintbrush, Scissors, Hammer, Wrench,
  Code, Monitor, Keyboard, Mouse, Printer, FileText,
  Folder, Archive, Package, ShoppingCart, CreditCard,
  DollarSign, Wallet, PiggyBank, TrendingDown, BarChart,
  PieChart, Calendar, MapPin, Map, Compass, Globe,
  Send, Mail, Phone, Video, Wifi, Bluetooth, Battery,
  Settings, Sliders, ToggleLeft, Lock, Unlock,
  Key, Shield as ShieldIcon, AlertCircle, Info, HelpCircle,
  Plus, Minus, X, Check, Search, Filter, Maximize2
} from 'lucide-react';

const ARCHETYPES = [
  {
    id: 'early-eagle',
    name: 'Early Eagle',
    emoji: '🦅',
    tagline: 'I own the morning. Sunrise is my power hour.',
    peak: '5 AM - 10 AM',
    gradient: 'from-orange-400 via-red-400 to-pink-500',
    bgGradient: 'from-orange-500/20 to-pink-500/20',
    wakeTime: '05:00',
    sleepTime: '21:30',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    emoji: '🦉',
    tagline: 'The world sleeps, I create. Midnight is my muse.',
    peak: '8 PM - 2 AM',
    gradient: 'from-indigo-400 via-purple-400 to-pink-500',
    bgGradient: 'from-indigo-500/20 to-purple-500/20',
    wakeTime: '10:00',
    sleepTime: '02:00',
  },
  {
    id: 'steady-tortoise',
    name: 'Steady Tortoise',
    emoji: '🐢',
    tagline: 'Slow and steady wins the race.',
    peak: 'Consistent',
    gradient: 'from-green-400 via-emerald-400 to-teal-500',
    bgGradient: 'from-green-500/20 to-teal-500/20',
    wakeTime: '07:00',
    sleepTime: '23:00',
  },
  {
    id: 'sprint-rabbit',
    name: 'Sprint Rabbit',
    emoji: '🐰',
    tagline: 'Fast bursts. Work hard, rest harder.',
    peak: 'Multiple bursts',
    gradient: 'from-yellow-400 via-orange-400 to-red-500',
    bgGradient: 'from-yellow-500/20 to-red-500/20',
    wakeTime: '06:30',
    sleepTime: '22:30',
  },
  {
    id: 'balanced-lion',
    name: 'Balanced Lion',
    emoji: '🦁',
    tagline: 'Strategy and rest in harmony.',
    peak: '9 AM - 3 PM',
    gradient: 'from-amber-400 via-orange-400 to-red-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    wakeTime: '06:30',
    sleepTime: '22:30',
  },
  {
    id: 'lone-wolf',
    name: 'Lone Wolf',
    emoji: '🐺',
    tagline: 'I chart my own path.',
    peak: 'Varies',
    gradient: 'from-gray-400 via-slate-400 to-blue-500',
    bgGradient: 'from-gray-500/20 to-blue-500/20',
    wakeTime: '08:00',
    sleepTime: '00:00',
  },
  {
    id: 'busy-bee',
    name: 'Busy Bee',
    emoji: '🐝',
    tagline: 'Always buzzing, always productive.',
    peak: 'All day',
    gradient: 'from-yellow-400 via-amber-400 to-orange-500',
    bgGradient: 'from-yellow-500/20 to-amber-500/20',
    wakeTime: '06:00',
    sleepTime: '22:00',
  },
  {
    id: 'clever-fox',
    name: 'Clever Fox',
    emoji: '🦊',
    tagline: 'Work smarter, not harder.',
    peak: 'Strategic',
    gradient: 'from-rose-400 via-pink-400 to-purple-500',
    bgGradient: 'from-rose-500/20 to-purple-500/20',
    wakeTime: '07:00',
    sleepTime: '23:00',
  },
];

const HEALTH_CONDITIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'High Blood Pressure',
  'High Cholesterol', 'Heart Disease', 'Thyroid Issues', 'PCOS',
  'Asthma', 'Arthritis', 'Kidney Disease', 'Liver Disease', 
  'IBS', 'Crohn\'s Disease', 'Celiac Disease', 'None'
];

const COMMON_ALLERGENS = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Gluten', 'Lactose', 'None'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setArchetype } = useArchetypeTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Archetype
    archetype: '',
    
    // Step 2: Personal
    full_name: '',
    age: '',
    sex: '',
    height_cm: '',
    current_weight_kg: '',
    
    // Step 3: Goals
    goal_type: '',
    target_weight_kg: '',
    goal_aggression: '',
    primary_motivation: '',
    secondary_goals: [] as string[],
    
    // Step 4: Morning Rhythm
    wake_time: '07:00',
    alarm_snooze: 'No',
    morning_mood: '',
    first_thing_morning: '',
    morning_beverage: '',
    shower_time: 'Morning',
    breakfast_time: '07:30',
    breakfast_type: '',
    
    // Step 5: Work/Activity
    work_start_time: '09:00',
    work_type: '',
    work_environment: '',
    commute_time: '',
    commute_method: '',
    break_frequency: '',
    focus_duration: '',
    productive_hours: [] as string[],
    
    // Step 6: Afternoon/Evening
    lunch_time: '12:00',
    lunch_type: '',
    afternoon_energy: '',
    afternoon_slump: '',
    dinner_time: '19:00',
    dinner_type: '',
    evening_routine: [] as string[],
    wind_down_time: '21:00',
    
    // Step 7: Sleep
    sleep_time: '22:30',
    sleep_quality: '',
    sleep_duration_target: '',
    sleep_issues: [] as string[],
    nap_habit: '',
    bedroom_temp: '',
    
    // Step 8: Fitness
    activity_level: '',
    workout_preference: '',
    workout_frequency: '3',
    workout_time_preference: '',
    workout_duration: '',
    workout_location: 'Gym',
    workout_experience: 'Beginner',
    daily_steps_goal: '10000',
    fitness_goals: [] as string[],
    
    // Step 9: Nutrition
    dietary_restrictions: [] as string[],
    meal_prep_preference: '',
    cooking_skill: 'Beginner',
    water_intake_goal: '2',
    caffeine_intake: '',
    caffeine_time: '',
    alcohol_frequency: '',
    sugar_intake: '',
    snacking_habit: '',
    
    // Step 10: Mindfulness
    meditation_experience: '',
    meditation_frequency: '',
    stress_level: '5',
    anxiety_frequency: '',
    journaling_habit: '',
    gratitude_practice: '',
    breathing_exercises: '',
    mental_health_priority: '',
    
    // Step 11: Social
    social_battery: '',
    relationship_status: '',
    family_time_priority: '',
    friend_time_frequency: '',
    social_activities: [] as string[],
    networking_interest: '',
    
    // Step 12: Productivity
    procrastination_level: '',
    distraction_sources: [] as string[],
    productivity_peaks: [] as string[],
    work_life_balance: '5',
    time_management_skill: '',
    planning_style: '',
    
    // Step 13: Hobbies
    hobbies: [] as string[],
    reading_frequency: '',
    reading_type: '',
    screen_time_daily: '',
    screen_time_concern: '',
    music_preference: '',
    creative_outlets: [] as string[],
    
    // Step 14: Health
    health_conditions: [] as string[],
    allergies: [] as string[],
    allergy_severity: {} as Record<string, string>,
    medications: '',
    supplements: '',
    health_tracking: [] as string[],
    
    // Step 15: Environment
    living_situation: '',
    pets: [] as string[],
    climate: '',
    outdoor_time: '',
    sunlight_exposure: '',
    air_quality_concern: '',
    
    // Step 16: Preferences
    notification_preference: '',
    notification_quiet_hours: [] as string[],
    theme_preference: 'Auto',
    voice_preference: '',
    gamification_level: 'Medium',
    privacy_level: '',
    data_sharing: '',
    
    // Step 17: Vision
    life_goals: [] as string[],
    thirty_day_goal: '',
    ninety_day_goal: '',
    one_year_vision: '',
    life_mission: '',
    role_models: '',
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    const currentArray = formData[key] as string[];
    if (currentArray.includes(item)) {
      updateFormData({ [key]: currentArray.filter(i => i !== item) });
    } else {
      updateFormData({ [key]: [...currentArray, item] });
    }
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

  const totalSteps = 17;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return formData.archetype !== '';
      case 2: return formData.full_name && formData.age && formData.sex && formData.height_cm && formData.current_weight_kg;
      case 3: return formData.goal_type && formData.target_weight_kg && formData.goal_aggression && formData.primary_motivation;
      case 4: return formData.wake_time && formData.morning_mood && formData.first_thing_morning;
      case 5: return formData.work_type && formData.focus_duration;
      case 6: return formData.afternoon_energy && formData.evening_routine.length > 0;
      case 7: return formData.sleep_time && formData.sleep_quality && formData.sleep_duration_target;
      case 8: return formData.activity_level && formData.workout_preference;
      case 9: return formData.meal_prep_preference && formData.water_intake_goal;
      case 10: return formData.stress_level && formData.mental_health_priority;
      case 11: return formData.social_battery;
      case 12: return formData.procrastination_level && formData.time_management_skill;
      case 13: return formData.hobbies.length > 0;
      case 14: return formData.health_conditions.length > 0;
      case 15: return formData.living_situation && formData.outdoor_time;
      case 16: return formData.notification_preference && formData.theme_preference;
      case 17: return formData.thirty_day_goal && formData.one_year_vision;
      default: return false;
    }
  };

  async function completeOnboarding() {
    setLoading(true);
    try {
      const selectedArchetype = ARCHETYPES.find(a => a.id === formData.archetype);
      
      // Update profile with comprehensive data
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
          health_conditions: formData.health_conditions.filter(c => c !== 'None'),
          archetype: formData.archetype,
          profile_completed: true,
          onboarding_data: formData // Store complete onboarding data as JSON
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Create initial goal
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
      await supabase.from('weight_logs').insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        weight_kg: parseFloat(formData.current_weight_kg)
      });

      // Save allergies if any
      if (formData.allergies.length > 0 && !formData.allergies.includes('None')) {
        const allergyInserts = formData.allergies.map(allergen => ({
          user_id: userId,
          allergen_name: allergen,
          severity: formData.allergy_severity[allergen] || 'moderate'
        }));

        await supabase.from('user_allergies').insert(allergyInserts);
      }

      // Epic confetti celebration
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF69B4', '#00FF00']
      });

      toast({
        title: "🎉 Welcome to DayAI!",
        description: "Your personalized life OS is ready!",
      });

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Progress Bar */}
      {currentStep > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-gray-400">Step {currentStep} of {totalSteps}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-bold text-gray-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* STEP 0: WELCOME */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-8"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative inline-block"
                >
                  <img src="/dayai-icon-64.png" alt="DayAI" className="w-32 h-32 mx-auto rounded-full" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-2xl opacity-50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome to DayAI
                </h1>

                <p className="text-2xl md:text-3xl text-gray-300">
                  Become the Main Character of Your Life
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { icon: Sparkles, text: 'AI-Powered Coach', color: 'from-purple-500 to-pink-500' },
                    { icon: Zap, text: 'Personalized to YOU', color: 'from-blue-500 to-cyan-500' },
                    { icon: Trophy, text: 'Gamified Progress', color: 'from-green-500 to-emerald-500' },
                    { icon: Heart, text: 'Complete Tracking', color: 'from-orange-500 to-red-500' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${item.color} bg-opacity-10 rounded-full border border-white/20`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={nextStep}
                  className="relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-bold text-xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Let's Get Started
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      →
                    </motion.span>
                  </span>
                </motion.button>

                <p className="text-sm text-gray-500">Takes 5 minutes • Join 2.1M+ optimizers</p>
              </motion.div>
            )}

            {/* STEP 1: CHARACTER SELECTION */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Archetype</h2>
                  <p className="text-xl text-gray-400">Which character resonates with your natural rhythm?</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ARCHETYPES.map((archetype) => (
                     <motion.button
                      key={archetype.id}
                      onClick={() => {
                        updateFormData({ 
                          archetype: archetype.id,
                          wake_time: archetype.wakeTime,
                          sleep_time: archetype.sleepTime
                        });
                        setArchetype(archetype.id as any); // Apply theme instantly
                      }}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        formData.archetype === archetype.id
                          ? `border-white/30 bg-gradient-to-br ${archetype.bgGradient}`
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.05, rotate: formData.archetype === archetype.id ? 0 : 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="text-5xl mb-2"
                        animate={formData.archetype === archetype.id ? {
                          rotate: [0, -5, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {archetype.emoji}
                      </motion.div>
                      <div className={`font-bold text-sm ${
                        formData.archetype === archetype.id 
                          ? `bg-gradient-to-r ${archetype.gradient} bg-clip-text text-transparent` 
                          : 'text-white'
                      }`}>
                        {archetype.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{archetype.peak}</div>
                      {formData.archetype === archetype.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {formData.archetype && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="text-center">
                      <p className="text-2xl italic text-gray-300 mb-4">
                        "{ARCHETYPES.find(a => a.id === formData.archetype)?.tagline}"
                      </p>
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Sunrise className="w-5 h-5 text-orange-400" />
                          <span>Wake: {ARCHETYPES.find(a => a.id === formData.archetype)?.wakeTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-5 h-5 text-purple-400" />
                          <span>Sleep: {ARCHETYPES.find(a => a.id === formData.archetype)?.sleepTime}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: PERSONAL INFO */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <User className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <h2 className="text-3xl font-bold mb-2">About You</h2>
                      <p className="text-gray-400">Let's personalize your experience</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <Input
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => updateFormData({ full_name: e.target.value })}
                        className="bg-white/10 border-white/20 h-12 text-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Age</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={formData.age}
                          onChange={(e) => updateFormData({ age: e.target.value })}
                          className="bg-white/10 border-white/20 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Sex</Label>
                        <Select value={formData.sex} onValueChange={(v) => updateFormData({ sex: v })}>
                          <SelectTrigger className="bg-white/10 border-white/20 h-12">
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
                        <Label className="text-sm font-semibold mb-2 block">Height (cm)</Label>
                        <Input
                          type="number"
                          placeholder="175"
                          value={formData.height_cm}
                          onChange={(e) => updateFormData({ height_cm: e.target.value })}
                          className="bg-white/10 border-white/20 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Current Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="70"
                          value={formData.current_weight_kg}
                          onChange={(e) => updateFormData({ current_weight_kg: e.target.value })}
                          className="bg-white/10 border-white/20 h-12"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: GOALS */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Target className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                      <h2 className="text-3xl font-bold mb-2">Your Goals</h2>
                      <p className="text-gray-400">What do you want to achieve?</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Primary Goal</Label>
                      <RadioGroup value={formData.goal_type} onValueChange={(v) => updateFormData({ goal_type: v })}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Lose Weight', icon: '📉', color: 'from-green-500 to-emerald-500' },
                            { value: 'Gain Muscle', icon: '💪', color: 'from-blue-500 to-purple-500' },
                            { value: 'Maintain Weight', icon: '⚖️', color: 'from-orange-500 to-yellow-500' },
                            { value: 'Improve Energy', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
                            { value: 'Better Sleep', icon: '😴', color: 'from-indigo-500 to-purple-500' },
                            { value: 'Mental Wellness', icon: '🧘', color: 'from-pink-500 to-rose-500' }
                          ].map((goal) => (
                            <label
                              key={goal.value}
                              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.goal_type === goal.value
                                  ? 'border-primary bg-primary/5 shadow-lg'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={goal.value} className="sr-only" />
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center text-2xl`}>
                                  {goal.icon}
                                </div>
                                <span className="font-semibold text-sm">{goal.value}</span>
                                {formData.goal_type === goal.value && (
                                  <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.goal_type && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">Target Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="70"
                            value={formData.target_weight_kg}
                            onChange={(e) => updateFormData({ target_weight_kg: e.target.value })}
                            className="bg-white/10 border-white/20 h-12"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-semibold mb-3 block">Pace</Label>
                          <RadioGroup value={formData.goal_aggression} onValueChange={(v) => updateFormData({ goal_aggression: v })}>
                            <div className="space-y-2">
                              {[
                                { value: 'Slow', icon: '🐢', label: 'Slow & Steady', desc: '0.25kg/week - Sustainable' },
                                { value: 'Moderate', icon: '⚡', label: 'Moderate', desc: '0.5kg/week - Balanced' },
                                { value: 'Aggressive', icon: '🔥', label: 'Fast Track', desc: '1kg/week - Intense' }
                              ].map((pace) => (
                                <label
                                  key={pace.value}
                                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.goal_aggression === pace.value
                                      ? 'border-primary bg-primary/5'
                                      : 'border-white/10 hover:border-white/30'
                                  }`}
                                >
                                  <RadioGroupItem value={pace.value} className="sr-only" />
                                  <span className="text-3xl">{pace.icon}</span>
                                  <div className="flex-1">
                                    <p className="font-semibold">{pace.label}</p>
                                    <p className="text-sm text-gray-400">{pace.desc}</p>
                                  </div>
                                  {formData.goal_aggression === pace.value && (
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                  )}
                                </label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold mb-3 block">What motivates you most?</Label>
                          <RadioGroup value={formData.primary_motivation} onValueChange={(v) => updateFormData({ primary_motivation: v })}>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { value: 'Health', icon: Heart },
                                { value: 'Appearance', icon: Eye },
                                { value: 'Energy', icon: Zap },
                                { value: 'Confidence', icon: Star },
                                { value: 'Longevity', icon: TrendingUp },
                                { value: 'Performance', icon: Trophy }
                              ].map((motivation) => (
                                <label
                                  key={motivation.value}
                                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                                    formData.primary_motivation === motivation.value
                                      ? 'border-primary bg-primary/10'
                                      : 'border-white/10 hover:border-white/30'
                                  }`}
                                >
                                  <RadioGroupItem value={motivation.value} className="sr-only" />
                                  <motivation.icon className="w-5 h-5" />
                                  <span className="text-sm font-medium">{motivation.value}</span>
                                </label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 4: MORNING RHYTHM */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Sunrise className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                      <h2 className="text-3xl font-bold mb-2">Morning Rhythm</h2>
                      <p className="text-gray-400">How do you start your day?</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Wake Time</Label>
                      <Input
                        type="time"
                        value={formData.wake_time}
                        onChange={(e) => updateFormData({ wake_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Do you snooze your alarm?</Label>
                      <RadioGroup value={formData.alarm_snooze} onValueChange={(v) => updateFormData({ alarm_snooze: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Never', 'Sometimes', 'Always'].map((option) => (
                            <label
                              key={option}
                              className={`p-3 rounded-lg border-2 cursor-pointer text-center ${
                                formData.alarm_snooze === option
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={option} className="sr-only" />
                              <span className="text-sm font-medium">{option}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">How do you feel when you wake up?</Label>
                      <RadioGroup value={formData.morning_mood} onValueChange={(v) => updateFormData({ morning_mood: v })}>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Energized', icon: '😃', color: 'from-green-500 to-emerald-500' },
                            { value: 'Neutral', icon: '😐', color: 'from-yellow-500 to-orange-500' },
                            { value: 'Groggy', icon: '😴', color: 'from-blue-500 to-purple-500' }
                          ].map((mood) => (
                            <label
                              key={mood.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer ${
                                formData.morning_mood === mood.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={mood.value} className="sr-only" />
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center text-2xl mb-2`}>
                                  {mood.icon}
                                </div>
                                <span className="text-sm font-semibold">{mood.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">First thing you do in the morning?</Label>
                      <RadioGroup value={formData.first_thing_morning} onValueChange={(v) => updateFormData({ first_thing_morning: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'Check phone', icon: Smartphone },
                            { value: 'Drink water', icon: Droplet },
                            { value: 'Stretch/Exercise', icon: Activity },
                            { value: 'Meditate', icon: Brain },
                            { value: 'Make coffee', icon: Coffee },
                            { value: 'Shower', icon: Droplet }
                          ].map((activity) => (
                            <label
                              key={activity.value}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.first_thing_morning === activity.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={activity.value} className="sr-only" />
                              <activity.icon className="w-5 h-5" />
                              <span className="text-sm font-medium">{activity.value}</span>
                              {formData.first_thing_morning === activity.value && (
                                <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Morning beverage preference?</Label>
                      <RadioGroup value={formData.morning_beverage} onValueChange={(v) => updateFormData({ morning_beverage: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {['Coffee', 'Tea', 'Water', 'Juice', 'Smoothie', 'None'].map((beverage) => (
                            <label
                              key={beverage}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.morning_beverage === beverage
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={beverage} className="sr-only" />
                              <span className="text-sm font-medium">{beverage}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Breakfast Time</Label>
                      <Input
                        type="time"
                        value={formData.breakfast_time}
                        onChange={(e) => updateFormData({ breakfast_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Breakfast type?</Label>
                      <RadioGroup value={formData.breakfast_type} onValueChange={(v) => updateFormData({ breakfast_type: v })}>
                        <div className="space-y-2">
                          {[
                            'Big breakfast',
                            'Light breakfast',
                            'Skip breakfast (IF)',
                            'Varies daily'
                          ].map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.breakfast_type === type
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={type} className="sr-only" />
                              <span className="text-sm font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 5: WORK/ACTIVITY */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                      <h2 className="text-3xl font-bold mb-2">Work & Activity</h2>
                      <p className="text-gray-400">Tell us about your typical workday</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Work Start Time</Label>
                      <Input
                        type="time"
                        value={formData.work_start_time}
                        onChange={(e) => updateFormData({ work_start_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Type of work?</Label>
                      <RadioGroup value={formData.work_type} onValueChange={(v) => updateFormData({ work_type: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'Desk job', icon: Monitor },
                            { value: 'Physical labor', icon: Hammer },
                            { value: 'Mixed activity', icon: Activity },
                            { value: 'Remote work', icon: Home },
                            { value: 'Student', icon: Book },
                            { value: 'Entrepreneur', icon: Briefcase }
                          ].map((work) => (
                            <label
                              key={work.value}
                              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                                formData.work_type === work.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={work.value} className="sr-only" />
                              <work.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{work.value}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Work environment?</Label>
                      <RadioGroup value={formData.work_environment} onValueChange={(v) => updateFormData({ work_environment: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {['Office', 'Home', 'Hybrid', 'Outdoors', 'Varies'].map((env) => (
                            <label
                              key={env}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.work_environment === env
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={env} className="sr-only" />
                              <span className="text-sm font-medium">{env}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Commute time?</Label>
                      <RadioGroup value={formData.commute_time} onValueChange={(v) => updateFormData({ commute_time: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {['No commute', '< 15 min', '15-30 min', '30-60 min', '60+ min'].map((time) => (
                            <label
                              key={time}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.commute_time === time
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={time} className="sr-only" />
                              <span className="text-sm font-medium">{time}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">How long can you focus without a break?</Label>
                      <RadioGroup value={formData.focus_duration} onValueChange={(v) => updateFormData({ focus_duration: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            '< 30 min',
                            '30-60 min',
                            '60-90 min',
                            '90+ min'
                          ].map((duration) => (
                            <label
                              key={duration}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.focus_duration === duration
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={duration} className="sr-only" />
                              <span className="text-sm font-medium">{duration}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Break frequency?</Label>
                      <RadioGroup value={formData.break_frequency} onValueChange={(v) => updateFormData({ break_frequency: v })}>
                        <div className="space-y-2">
                          {[
                            'Every 25 min (Pomodoro)',
                            'Every hour',
                            'Every 2 hours',
                            'Whenever needed',
                            'Rarely take breaks'
                          ].map((freq) => (
                            <label
                              key={freq}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.break_frequency === freq
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={freq} className="sr-only" />
                              <span className="text-sm font-medium">{freq}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">When are you most productive? (Select all)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Early morning (5-9 AM)',
                          'Mid morning (9-12 PM)',
                          'Afternoon (12-5 PM)',
                          'Evening (5-9 PM)',
                          'Night (9 PM+)'
                        ].map((time) => (
                          <div
                            key={time}
                            onClick={() => toggleArrayItem('productive_hours', time)}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.productive_hours.includes(time)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.productive_hours.includes(time)} />
                              <span className="text-sm font-medium">{time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 6: AFTERNOON/EVENING */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Sunset className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                      <h2 className="text-3xl font-bold mb-2">Afternoon & Evening</h2>
                      <p className="text-gray-400">How do you wind down?</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Lunch Time</Label>
                      <Input
                        type="time"
                        value={formData.lunch_time}
                        onChange={(e) => updateFormData({ lunch_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Lunch style?</Label>
                      <RadioGroup value={formData.lunch_type} onValueChange={(v) => updateFormData({ lunch_type: v })}>
                        <div className="space-y-2">
                          {[
                            'Packed from home',
                            'Buy lunch',
                            'Eat out',
                            'Skip lunch',
                            'Varies'
                          ].map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.lunch_type === type
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={type} className="sr-only" />
                              <span className="text-sm font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Afternoon energy level?</Label>
                      <RadioGroup value={formData.afternoon_energy} onValueChange={(v) => updateFormData({ afternoon_energy: v })}>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'High', icon: '⚡', color: 'from-green-500 to-emerald-500' },
                            { value: 'Medium', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
                            { value: 'Low', icon: '🔋', color: 'from-red-500 to-pink-500' }
                          ].map((energy) => (
                            <label
                              key={energy.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer ${
                                formData.afternoon_energy === energy.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={energy.value} className="sr-only" />
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${energy.color} flex items-center justify-center text-2xl mb-2`}>
                                  {energy.icon}
                                </div>
                                <span className="text-sm font-semibold">{energy.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Experience afternoon slump?</Label>
                      <RadioGroup value={formData.afternoon_slump} onValueChange={(v) => updateFormData({ afternoon_slump: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Always', 'Sometimes', 'Rarely'].map((option) => (
                            <label
                              key={option}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.afternoon_slump === option
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={option} className="sr-only" /> <span className="text-sm font-medium">{option}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Dinner Time</Label>
                      <Input
                        type="time"
                        value={formData.dinner_time}
                        onChange={(e) => updateFormData({ dinner_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Dinner style?</Label>
                      <RadioGroup value={formData.dinner_type} onValueChange={(v) => updateFormData({ dinner_type: v })}>
                        <div className="space-y-2">
                          {[
                            'Home cooked',
                            'Takeout/Delivery',
                            'Meal prep',
                            'Eat out',
                            'Varies daily'
                          ].map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.dinner_type === type
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={type} className="sr-only" />
                              <span className="text-sm font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Evening routine activities? (Select all)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'Watch TV/Movies', icon: Tv },
                          { value: 'Read', icon: Book },
                          { value: 'Exercise', icon: Dumbbell },
                          { value: 'Cook', icon: UtensilsCrossed },
                          { value: 'Socialize', icon: Users },
                          { value: 'Hobby time', icon: Paintbrush },
                          { value: 'Gaming', icon: GamepadIcon },
                          { value: 'Family time', icon: Heart }
                        ].map((activity) => (
                          <div
                            key={activity.value}
                            onClick={() => toggleArrayItem('evening_routine', activity.value)}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.evening_routine.includes(activity.value)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.evening_routine.includes(activity.value)} />
                              <activity.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{activity.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Wind Down Time (stop work/screens)</Label>
                      <Input
                        type="time"
                        value={formData.wind_down_time}
                        onChange={(e) => updateFormData({ wind_down_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 7: SLEEP */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Moon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <h2 className="text-3xl font-bold mb-2">Sleep & Rest</h2>
                      <p className="text-gray-400">Quality sleep = quality life</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Target Sleep Time</Label>
                      <Input
                        type="time"
                        value={formData.sleep_time}
                        onChange={(e) => updateFormData({ sleep_time: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">How would you rate your sleep quality?</Label>
                      <RadioGroup value={formData.sleep_quality} onValueChange={(v) => updateFormData({ sleep_quality: v })}>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Excellent', icon: '😴', color: 'from-green-500 to-emerald-500' },
                            { value: 'Good', icon: '🙂', color: 'from-blue-500 to-cyan-500' },
                            { value: 'Fair', icon: '😐', color: 'from-yellow-500 to-orange-500' },
                            { value: 'Poor', icon: '😰', color: 'from-orange-500 to-red-500' },
                            { value: 'Terrible', icon: '😫', color: 'from-red-500 to-pink-500' }
                          ].map((quality) => (
                            <label
                              key={quality.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer ${
                                formData.sleep_quality === quality.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={quality.value} className="sr-only" />
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${quality.color} flex items-center justify-center text-2xl mb-2`}>
                                  {quality.icon}
                                </div>
                                <span className="text-xs font-semibold">{quality.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Target sleep duration?</Label>
                      <RadioGroup value={formData.sleep_duration_target} onValueChange={(v) => updateFormData({ sleep_duration_target: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            '< 6 hours',
                            '6-7 hours',
                            '7-8 hours',
                            '8-9 hours',
                            '9+ hours'
                          ].map((duration) => (
                            <label
                              key={duration}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.sleep_duration_target === duration
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={duration} className="sr-only" />
                              <span className="text-sm font-medium">{duration}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Sleep issues? (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Trouble falling asleep',
                          'Wake during night',
                          'Wake too early',
                          'Snoring',
                          'Sleep apnea',
                          'Restless legs',
                          'Nightmares',
                          'None'
                        ].map((issue) => (
                          <div
                            key={issue}
                            onClick={() => {
                              if (issue === 'None') {
                                updateFormData({ sleep_issues: ['None'] });
                              } else {
                                const filtered = formData.sleep_issues.filter(i => i !== 'None');
                                if (filtered.includes(issue)) {
                                  updateFormData({ sleep_issues: filtered.filter(i => i !== issue) });
                                } else {
                                  updateFormData({ sleep_issues: [...filtered, issue] });
                                }
                              }
                            }}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.sleep_issues.includes(issue)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.sleep_issues.includes(issue)} />
                              <span className="text-sm font-medium">{issue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Do you nap?</Label>
                      <RadioGroup value={formData.nap_habit} onValueChange={(v) => updateFormData({ nap_habit: v })}>
                        <div className="space-y-2">
                          {[
                            'Daily napper',
                            'Occasional napper',
                            'Rarely nap',
                            'Never nap'
                          ].map((habit) => (
                            <label
                              key={habit}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.nap_habit === habit
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={habit} className="sr-only" />
                              <span className="text-sm font-medium">{habit}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Bedroom temperature preference?</Label>
                      <RadioGroup value={formData.bedroom_temp} onValueChange={(v) => updateFormData({ bedroom_temp: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'Cool', icon: '❄️' },
                            { value: 'Moderate', icon: '🌡️' },
                            { value: 'Warm', icon: '🔥' }
                          ].map((temp) => (
                            <label
                              key={temp.value}
                              className={`p-4 rounded-lg border text-center cursor-pointer ${
                                formData.bedroom_temp === temp.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={temp.value} className="sr-only" />
                              <div className="text-2xl mb-1">{temp.icon}</div>
                              <span className="text-sm font-medium">{temp.value}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 8: FITNESS */}
            {currentStep === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Dumbbell className="w-16 h-16 mx-auto mb-4 text-red-400" />
                      <h2 className="text-3xl font-bold mb-2">Fitness & Movement</h2>
                      <p className="text-gray-400">Let's optimize your physical activity</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Activity Level</Label>
                      <RadioGroup value={formData.activity_level} onValueChange={(v) => updateFormData({ activity_level: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'Sedentary', icon: '🪑', desc: 'Little to no exercise' },
                            { value: 'Lightly Active', icon: '🚶', desc: 'Exercise 1-3 days/week' },
                            { value: 'Moderately Active', icon: '🏃', desc: 'Exercise 3-5 days/week' },
                            { value: 'Very Active', icon: '💪', desc: 'Exercise 6-7 days/week' },
                            { value: 'Extremely Active', icon: '🔥', desc: 'Physical job + daily exercise' }
                          ].map((level) => (
                            <label
                              key={level.value}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                                formData.activity_level === level.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={level.value} className="sr-only" />
                              <span className="text-3xl">{level.icon}</span>
                              <div className="flex-1">
                                <p className="font-semibold">{level.value}</p>
                                <p className="text-sm text-gray-400">{level.desc}</p>
                              </div>
                              {formData.activity_level === level.value && (
                                <CheckCircle className="w-6 h-6 text-primary" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Workout Preference</Label>
                      <RadioGroup value={formData.workout_preference} onValueChange={(v) => updateFormData({ workout_preference: v })}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Strength Training', icon: '🏋️' },
                            { value: 'Cardio', icon: '🏃' },
                            { value: 'Yoga/Pilates', icon: '🧘' },
                            { value: 'Sports', icon: '⚽' },
                            { value: 'Mixed/Varied', icon: '🎯' },
                            { value: 'Walking', icon: '🚶' }
                          ].map((pref) => (
                            <label
                              key={pref.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer ${
                                formData.workout_preference === pref.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={pref.value} className="sr-only" />
                              <div className="text-center">
                                <span className="text-3xl block mb-2">{pref.icon}</span>
                                <span className="text-sm font-semibold">{pref.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Workout Frequency (days/week)</Label>
                      <RadioGroup value={formData.workout_frequency} onValueChange={(v) => updateFormData({ workout_frequency: v })}>
                        <div className="grid grid-cols-4 gap-2">
                          {['2', '3', '4', '5', '6', '7'].map((freq) => (
                            <label
                              key={freq}
                              className={`p-4 rounded-lg border-2 cursor-pointer text-center ${
                                formData.workout_frequency === freq
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={freq} className="sr-only" />
                              <span className="text-lg font-bold">{freq}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">When do you prefer to workout?</Label>
                      <RadioGroup value={formData.workout_time_preference} onValueChange={(v) => updateFormData({ workout_time_preference: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'Early Morning (5-7 AM)', icon: Sunrise },
                            { value: 'Morning (7-10 AM)', icon: Sun },
                            { value: 'Midday (10 AM-2 PM)', icon: CloudSun },
                            { value: 'Afternoon (2-6 PM)', icon: Cloudy },
                            { value: 'Evening (6-9 PM)', icon: Sunset },
                            { value: 'Night (9 PM+)', icon: Moon }
                          ].map((time) => (
                            <label
                              key={time.value}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.workout_time_preference === time.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={time.value} className="sr-only" />
                              <time.icon className="w-5 h-5" />
                              <span className="text-sm font-medium">{time.value}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Workout Duration</Label>
                      <RadioGroup value={formData.workout_duration} onValueChange={(v) => updateFormData({ workout_duration: v })}>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            '< 30 min',
                            '30-45 min',
                            '45-60 min',
                            '60-90 min',
                            '90+ min'
                          ].map((duration) => (
                            <label
                              key={duration}
                              className={`p-3 rounded-lg border text-center cursor-pointer ${
                                formData.workout_duration === duration
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={duration} className="sr-only" />
                              <span className="text-sm font-medium">{duration}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Workout Location</Label>
                      <RadioGroup value={formData.workout_location} onValueChange={(v) => updateFormData({ workout_location: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'Gym', icon: Dumbbell },
                            { value: 'Home', icon: Home },
                            { value: 'Outdoors', icon: Mountain }
                          ].map((loc) => (
                            <label
                              key={loc.value}
                              className={`p-4 rounded-lg border-2 cursor-pointer ${
                                formData.workout_location === loc.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={loc.value} className="sr-only" />
                              <div className="text-center">
                                <loc.icon className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-sm font-semibold">{loc.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Experience Level</Label>
                      <RadioGroup value={formData.workout_experience} onValueChange={(v) => updateFormData({ workout_experience: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Beginner', 'Intermediate', 'Advanced'].map((exp) => (
                            <label
                              key={exp}
                              className={`p-4 rounded-lg border-2 text-center cursor-pointer ${
                                formData.workout_experience === exp
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={exp} className="sr-only" />
                              <span className="text-sm font-semibold">{exp}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Daily Steps Goal</Label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={formData.daily_steps_goal}
                          onChange={(e) => updateFormData({ daily_steps_goal: e.target.value })}
                          className="bg-white/10 border-white/20 h-12"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>5,000</span>
                          <span>10,000 (recommended)</span>
                          <span>15,000+</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Fitness Goals (Select all)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Lose fat',
                          'Build muscle',
                          'Increase strength',
                          'Improve endurance',
                          'Flexibility',
                          'Athletic performance',
                          'General health',
                          'Stress relief'
                        ].map((goal) => (
                          <div
                            key={goal}
                            onClick={() => toggleArrayItem('fitness_goals', goal)}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.fitness_goals.includes(goal)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.fitness_goals.includes(goal)} />
                              <span className="text-sm font-medium">{goal}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 9: NUTRITION */}
            {currentStep === 9 && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Apple className="w-16 h-16 mx-auto mb-4 text-green-400" />
                      <h2 className="text-3xl font-bold mb-2">Nutrition & Diet</h2>
                      <p className="text-gray-400">Fuel your body right</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Dietary Restrictions (Select all)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Vegetarian',
                          'Vegan',
                          'Pescatarian',
                          'Keto',
                          'Paleo',
                          'Gluten-Free',
                          'Dairy-Free',
                          'Low-Carb',
                          'Halal',
                          'Kosher',
                          'None'
                        ].map((diet) => (
                          <div
                            key={diet}
                            onClick={() => {
                              if (diet === 'None') {
                                updateFormData({ dietary_restrictions: ['None'] });
                              } else {
                                const filtered = formData.dietary_restrictions.filter(d => d !== 'None');
                                if (filtered.includes(diet)) {
                                  updateFormData({ dietary_restrictions: filtered.filter(d => d !== diet) });
                                } else {
                                  updateFormData({ dietary_restrictions: [...filtered, diet] });
                                }
                              }
                            }}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.dietary_restrictions.includes(diet)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.dietary_restrictions.includes(diet)} />
                              <span className="text-sm font-medium">{diet}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Meal Prep Style</Label>
                      <RadioGroup value={formData.meal_prep_preference} onValueChange={(v) => updateFormData({ meal_prep_preference: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'Weekly meal prep', icon: '📦', desc: 'Cook everything Sunday' },
                            { value: 'Cook fresh daily', icon: '🍳', desc: 'Fresh meals every day' },
                            { value: 'Mostly eat out', icon: '🍽️', desc: 'Restaurants/takeout' },
                            { value: 'Mixed approach', icon: '🎯', desc: 'Combination of all' }
                          ].map((meal) => (
                            <label
                              key={meal.value}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                                formData.meal_prep_preference === meal.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={meal.value} className="sr-only" />
                              <span className="text-3xl">{meal.icon}</span>
                              <div className="flex-1">
                                <p className="font-semibold">{meal.value}</p>
                                <p className="text-sm text-gray-400">{meal.desc}</p>
                              </div>
                              {formData.meal_prep_preference === meal.value && (
                                <CheckCircle className="w-6 h-6 text-primary" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Cooking Skill Level</Label>
                      <RadioGroup value={formData.cooking_skill} onValueChange={(v) => updateFormData({ cooking_skill: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Beginner', 'Intermediate', 'Advanced'].map((skill) => (
                            <label
                              key={skill}
                              className={`p-4 rounded-lg border-2 text-center cursor-pointer ${
                                formData.cooking_skill === skill
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={skill} className="sr-only" />
                              <span className="text-sm font-semibold">{skill}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Daily Water Intake Goal (Liters)</Label>
                      <div className="space-y-4">
                        <Slider
                          value={[parseFloat(formData.water_intake_goal)]}
                          onValueChange={(v) => updateFormData({ water_intake_goal: v[0].toString() })}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="text-center">
                          <span className="text-3xl font-bold text-cyan-400">{formData.water_intake_goal}L</span>
                          <p className="text-sm text-gray-400 mt-1">~{Math.round(parseFloat(formData.water_intake_goal) * 33.8)} oz</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Caffeine Intake</Label>
                      <RadioGroup value={formData.caffeine_intake} onValueChange={(v) => updateFormData({ caffeine_intake: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'None', icon: '🚫' },
                            { value: '1 cup/day', icon: '☕' },
                            { value: '2-3 cups/day', icon: '☕☕' },
                            { value: '4+ cups/day', icon: '☕☕☕' },
                            { value: 'Energy drinks', icon: '🥤' }
                          ].map((caffeine) => (
                            <label
                              key={caffeine.value}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.caffeine_intake === caffeine.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={caffeine.value} className="sr-only" />
                              <span className="text-2xl">{caffeine.icon}</span>
                              <span className="text-sm font-medium">{caffeine.value}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.caffeine_intake && formData.caffeine_intake !== 'None' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <Label className="text-sm font-semibold mb-3 block">When do you have your last caffeine?</Label>
                        <RadioGroup value={formData.caffeine_time} onValueChange={(v) => updateFormData({ caffeine_time: v })}>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              'Before 10 AM',
                              'Before 12 PM',
                              'Before 2 PM',
                              'Before 4 PM',
                              'Anytime'
                            ].map((time) => (
                              <label
                                key={time}
                                className={`p-3 rounded-lg border text-center cursor-pointer ${
                                  formData.caffeine_time === time
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/10 hover:border-white/30'
                                }`}
                              >
                                <RadioGroupItem value={time} className="sr-only" />
                                <span className="text-sm font-medium">{time}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </motion.div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Alcohol Consumption</Label>
                      <RadioGroup value={formData.alcohol_frequency} onValueChange={(v) => updateFormData({ alcohol_frequency: v })}>
                        <div className="space-y-2">
                          {[
                            'Never',
                            'Rarely (special occasions)',
                            '1-2 times/week',
                            '3-4 times/week',
                            'Daily'
                          ].map((freq) => (
                            <label
                              key={freq}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.alcohol_frequency === freq
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={freq} className="sr-only" />
                              <span className="text-sm font-medium">{freq}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Sugar/Sweets Intake</Label>
                      <RadioGroup value={formData.sugar_intake} onValueChange={(v) => updateFormData({ sugar_intake: v })}>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'Low', icon: '🟢' },
                            { value: 'Moderate', icon: '🟡' },
                            { value: 'High', icon: '🔴' }
                          ].map((sugar) => (
                            <label
                              key={sugar.value}
                              className={`p-4 rounded-lg border-2 cursor-pointer ${
                                formData.sugar_intake === sugar.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={sugar.value} className="sr-only" />
                              <div className="text-center">
                                <span className="text-3xl block mb-1">{sugar.icon}</span>
                                <span className="text-sm font-semibold">{sugar.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Snacking Habit</Label>
                      <RadioGroup value={formData.snacking_habit} onValueChange={(v) => updateFormData({ snacking_habit: v })}>
                        <div className="space-y-2">
                          {[
                            'Never snack',
                            'Healthy snacks only',
                            'Occasional treats',
                            'Frequent snacker',
                            'Constantly grazing'
                          ].map((habit) => (
                            <label
                              key={habit}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.snacking_habit === habit
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={habit} className="sr-only" />
                              <span className="text-sm font-medium">{habit}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 10: MINDFULNESS */}
            {currentStep === 10 && (
              <motion.div
                key="step10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-pink-400" />
                      <h2 className="text-3xl font-bold mb-2">Mental Wellness</h2>
                      <p className="text-gray-400">Your mind matters as much as your body</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Meditation Experience</Label>
                      <RadioGroup value={formData.meditation_experience} onValueChange={(v) => updateFormData({ meditation_experience: v })}>
                        <div className="space-y-2">
                          {[
                            'Never tried',
                            'Tried a few times',
                            'Occasional practice',
                            'Regular practice',
                            'Daily meditator'
                          ].map((exp) => (
                            <label
                              key={exp}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.meditation_experience === exp
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={exp} className="sr-only" />
                              <span className="text-sm font-medium">{exp}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.meditation_experience && formData.meditation_experience !== 'Never tried' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <Label className="text-sm font-semibold mb-3 block">How often do you meditate?</Label>
                        <RadioGroup value={formData.meditation_frequency} onValueChange={(v) => updateFormData({ meditation_frequency: v })}>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              'Daily',
                              '3-5 times/week',
                              '1-2 times/week',
                              'Occasionally'
                            ].map((freq) => (
                              <label
                                key={freq}
                                className={`p-3 rounded-lg border text-center cursor-pointer ${
                                  formData.meditation_frequency === freq
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/10 hover:border-white/30'
                                }`}
                              >
                                <RadioGroupItem value={freq} className="sr-only" />
                                <span className="text-sm font-medium">{freq}</span>
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      </motion.div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Current Stress Level: <span className="text-2xl text-orange-400">{formData.stress_level}/10</span>
                      </Label>
                      <Slider
                        value={[parseInt(formData.stress_level)]}
                        onValueChange={(v) => updateFormData({ stress_level: v[0].toString() })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>😌 Zen</span>
                        <span>😰 Stressed</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">How often do you feel anxious?</Label>
                      <RadioGroup value={formData.anxiety_frequency} onValueChange={(v) => updateFormData({ anxiety_frequency: v })}>
                        <div className="space-y-2">
                          {[
                            { value: 'Rarely', icon: '😊', color: 'from-green-500 to-emerald-500' },
                            { value: 'Sometimes', icon: '😐', color: 'from-yellow-500 to-orange-500' },
                            { value: 'Often', icon: '😟', color: 'from-orange-500 to-red-500' },
                            { value: 'Constantly', icon: '😰', color: 'from-red-500 to-pink-500' }
                          ].map((anxiety) => (
                            <label
                              key={anxiety.value}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                                formData.anxiety_frequency === anxiety.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={anxiety.value} className="sr-only" />
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${anxiety.color} flex items-center justify-center text-2xl`}>
                                {anxiety.icon}
                              </div>
                              <span className="text-sm font-semibold flex-1">{anxiety.value}</span>
                              {formData.anxiety_frequency === anxiety.value && (
                                <CheckCircle className="w-6 h-6 text-primary" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Do you journal?</Label>
                      <RadioGroup value={formData.journaling_habit} onValueChange={(v) => updateFormData({ journaling_habit: v })}>
                        <div className="space-y-2">
                          {[
                            'Daily',
                            'Few times a week',
                            'Occasionally',
                            'Never, but interested',
                            'Never, not interested'
                          ].map((habit) => (
                            <label
                              key={habit}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.journaling_habit === habit
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={habit} className="sr-only" />
                              <Book className="w-5 h-5" />
                              <span className="text-sm font-medium">{habit}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Gratitude Practice</Label>
                      <RadioGroup value={formData.gratitude_practice} onValueChange={(v) => updateFormData({ gratitude_practice: v })}>
                        <div className="space-y-2">
                          {[
                            'Daily gratitude list',
                            'Weekly reflection',
                            'Occasional practice',
                            'Never, but interested',
                            'Never practiced'
                          ].map((practice) => (
                            <label
                              key={practice}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.gratitude_practice === practice
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={practice} className="sr-only" />
                              <Heart className="w-5 h-5" />
                              <span className="text-sm font-medium">{practice}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Breathing Exercises</Label>
                      <RadioGroup value={formData.breathing_exercises} onValueChange={(v) => updateFormData({ breathing_exercises: v })}>
                        <div className="space-y-2">
                          {[
                            'Yes, regularly',
                            'Sometimes',
                            'Tried before',
                            'Never tried'
                          ].map((practice) => (
                            <label
                              key={practice}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                                formData.breathing_exercises === practice
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={practice} className="sr-only" />
                              <Wind className="w-5 h-5" />
                              <span className="text-sm font-medium">{practice}</span>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">How important is mental health to you?</Label>
                      <RadioGroup value={formData.mental_health_priority} onValueChange={(v) => updateFormData({ mental_health_priority: v })}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Top priority', icon: Star, color: 'from-yellow-500 to-orange-500' },
                            { value: 'Very important', icon: Shield, color: 'from-blue-500 to-purple-500' },
                            { value: 'Somewhat important', icon: Heart, color: 'from-pink-500 to-rose-500' },
                            { value: 'Not a focus', icon: Meh, color: 'from-gray-500 to-slate-500' }
                          ].map((priority) => (
                            <label
                              key={priority.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer ${
                                formData.mental_health_priority === priority.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <RadioGroupItem value={priority.value} className="sr-only" />
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${priority.color} flex items-center justify-center mb-2`}>
                                  <priority.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold">{priority.value}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 17: YOUR VISION */}
            {currentStep === 17 && (
              <motion.div
                key="step17"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                        Your Vision
                      </h2>
                      <p className="text-xl text-gray-400">Where are you headed?</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Life Goals (Select all that resonate)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'Financial freedom', icon: DollarSign },
                          { value: 'Career success', icon: Briefcase },
                          { value: 'Health & fitness', icon: Heart },
                          { value: 'Strong relationships', icon: Users },
                          { value: 'Personal growth', icon: TrendingUp },
                          { value: 'Creative expression', icon: Paintbrush },
                          { value: 'Adventure & travel', icon: Plane },
                          { value: 'Inner peace', icon: Brain },
                          { value: 'Help others', icon: Heart },
                          { value: 'Build something', icon: Hammer },
                          { value: 'Learn & master skills', icon: Book },
                          { value: 'Leave a legacy', icon: Star }
                        ].map((goal) => (
                          <div
                            key={goal.value}
                            onClick={() => toggleArrayItem('life_goals', goal.value)}
                            className={`p-3 rounded-lg border cursor-pointer ${
                              formData.life_goals.includes(goal.value)
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={formData.life_goals.includes(goal.value)} />
                              <goal.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{goal.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        🎯 What's your #1 goal for the next 30 days?
                      </Label>
                      <Input
                        placeholder="E.g., Lose 5kg, Run 5K, Read 3 books, Launch side project..."
                        value={formData.thirty_day_goal}
                        onChange={(e) => updateFormData({ thirty_day_goal: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        🚀 What's your 90-day milestone?
                      </Label>
                      <Input
                        placeholder="E.g., Complete marathon training, Hit revenue target, Master a skill..."
                        value={formData.ninety_day_goal}
                        onChange={(e) => updateFormData({ ninety_day_goal: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        ✨ Where do you see yourself in 1 year?
                      </Label>
                      <textarea
                        placeholder="Paint the picture... What does your ideal life look like? How do you feel? What have you accomplished?"
                        value={formData.one_year_vision}
                        onChange={(e) => updateFormData({ one_year_vision: e.target.value })}
                        className="w-full bg-white/10 border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        💫 What's your life mission? (Optional)
                      </Label>
                      <textarea
                        placeholder="Your deeper purpose... Why do you do what you do? What impact do you want to make?"
                        value={formData.life_mission}
                        onChange={(e) => updateFormData({ life_mission: e.target.value })}
                        className="w-full bg-white/10 border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        🌟 Who inspires you? (Optional)
                      </Label>
                      <Input
                        placeholder="Role models, mentors, people you admire..."
                        value={formData.role_models}
                        onChange={(e) => updateFormData({ role_models: e.target.value })}
                        className="bg-white/10 border-white/20 h-12"
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl border-2 border-purple-500/30 mt-8"
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-8 h-8 text-yellow-400" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">You're All Set! 🎉</h3>
                          <p className="text-gray-300 leading-relaxed">
                            Your personalized DayAI is ready to launch. We've created a custom roadmap based on your unique archetype, goals, and lifestyle. 
                            Get ready to become the main character of your life!
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Target className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                          <p className="text-xs font-medium">Smart Goals</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Brain className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                          <p className="text-xs font-medium">AI Coach</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-400" />
                          <p className="text-xs font-medium">Progress Tracking</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
                          <p className="text-xs font-medium">Achievements</p>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep > 0 && (
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && currentStep < totalSteps && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 bg-white/10 border-white/20 hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps && (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xl py-6"
                >
                  {loading ? '🚀 Launching...' : '🚀 Launch My DayAI!'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
