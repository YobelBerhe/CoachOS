import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  User,
  Target,
  Bell,
  Moon,
  Shield,
  CreditCard,
  Globe,
  Trash2,
  Download,
  LogOut,
  Camera,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings2,
  Heart,
  Dumbbell,
  Apple,
  Flame,
  Clock,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Zap,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState({
    // Profile
    full_name: '',
    email: '',
    age: '',
    sex: '',
    height_cm: '',
    activity_level: '',
    
    // Goals
    goal_type: '',
    target_weight_kg: '',
    goal_aggression: '',
    
    // Workout preferences
    workout_preference: '',
    workout_frequency: '3',
    workout_location: 'Gym',
    workout_experience: 'Beginner',
    
    // Fasting
    fasting_enabled: false,
    fasting_type: '16:8',
    fasting_start: '12:00',
    fasting_end: '20:00',
    
    // Notifications
    meal_reminders: true,
    workout_reminders: true,
    medication_reminders: true,
    hydration_reminders: true,
    
    // Appearance
    theme: 'system',
    accent_color: 'orange',
    
    // Units
    units: 'metric',
    
    // Privacy
    show_profile: true,
    allow_messages: true
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Allergies
  const [allergies, setAllergies] = useState<any[]>([]);
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'moderate' });

  // Health conditions
  const [healthConditions, setHealthConditions] = useState<string[]>([]);

  const HEALTH_CONDITIONS_LIST = [
    'Diabetes (Type 1)',
    'Diabetes (Type 2)',
    'High Blood Pressure',
    'High Cholesterol',
    'Heart Disease',
    'Thyroid Issues',
    'PCOS',
    'Asthma',
    'Arthritis'
  ];

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadUserData(user.id);
  }

  async function loadUserData(uid: string) {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (profileData) {
        setProfile(profileData);
        setSettings(prev => ({
          ...prev,
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          age: profileData.age?.toString() || '',
          sex: profileData.sex || '',
          height_cm: profileData.height_cm?.toString() || '',
          activity_level: profileData.activity_level || '',
          workout_preference: profileData.workout_preference || '',
          workout_frequency: profileData.workout_frequency?.toString() || '3',
          workout_location: profileData.workout_location || 'Gym',
          workout_experience: profileData.workout_experience || 'Beginner'
        }));
        setHealthConditions(profileData.health_conditions || []);
      }

      // Load goal
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .maybeSingle();

      if (goalData) {
        setSettings(prev => ({
          ...prev,
          goal_type: goalData.type || '',
          target_weight_kg: goalData.target_weight_kg?.toString() || '',
          goal_aggression: goalData.aggression || ''
        }));
      }

      // Load fasting plan
      const { data: fastingData } = await supabase
        .from('fasting_plans')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .maybeSingle();

      if (fastingData) {
        setSettings(prev => ({
          ...prev,
          fasting_enabled: true,
          fasting_type: fastingData.type || '16:8',
          fasting_start: fastingData.eating_window_start || '12:00',
          fasting_end: fastingData.eating_window_end || '20:00'
        }));
      }

      // Load allergies
      const { data: allergiesData } = await supabase
        .from('user_allergies')
        .select('*')
        .eq('user_id', uid);

      if (allergiesData) {
        setAllergies(allergiesData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: settings.full_name,
          age: parseInt(settings.age) || null,
          sex: settings.sex,
          height_cm: parseFloat(settings.height_cm) || null,
          activity_level: settings.activity_level,
          health_conditions: healthConditions,
          workout_preference: settings.workout_preference,
          workout_frequency: parseInt(settings.workout_frequency),
          workout_location: settings.workout_location,
          workout_experience: settings.workout_experience
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update goal if exists
      if (settings.goal_type && settings.target_weight_kg) {
        // Get current weight from most recent weight log
        const { data: weightLog } = await supabase
          .from('weight_logs')
          .select('weight_kg')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        const { error: goalError } = await supabase
          .from('goals')
          .upsert({
            user_id: userId,
            type: settings.goal_type,
            current_weight_kg: weightLog?.weight_kg || parseFloat(settings.target_weight_kg),
            target_weight_kg: parseFloat(settings.target_weight_kg),
            aggression: settings.goal_aggression,
            is_active: true
          }, {
            onConflict: 'user_id,is_active'
          });

        if (goalError) throw goalError;
      }

      // Update or create fasting plan
      if (settings.fasting_enabled) {
        const { error: fastingError } = await supabase
          .from('fasting_plans')
          .upsert({
            user_id: userId,
            type: settings.fasting_type,
            eating_window_start: settings.fasting_start,
            eating_window_end: settings.fasting_end,
            is_active: true
          }, {
            onConflict: 'user_id'
          });

        if (fastingError) throw fastingError;
      } else {
        // Disable fasting
        await supabase
          .from('fasting_plans')
          .update({ is_active: false })
          .eq('user_id', userId);
      }

      toast({
        title: "Settings saved! ✅",
        description: "Your preferences have been updated"
      });

    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      toast({
        title: "Password updated! 🔒",
        description: "Your password has been changed successfully"
      });

      setShowPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleDeleteAccount() {
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account",
    });
    setShowDeleteDialog(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  async function addAllergy() {
    if (!newAllergy.name) return;

    try {
      const { error } = await supabase
        .from('user_allergies')
        .insert({
          user_id: userId,
          allergen_name: newAllergy.name,
          severity: newAllergy.severity
        });

      if (error) throw error;

      await loadUserData(userId);
      setNewAllergy({ name: '', severity: 'moderate' });
      
      toast({
        title: "Allergy added",
        description: "We'll warn you when logging foods with this allergen"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function deleteAllergy(id: string) {
    try {
      const { error } = await supabase
        .from('user_allergies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadUserData(userId);
      toast({ title: "Allergy removed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  function toggleHealthCondition(condition: string) {
    setHealthConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  }

  const SettingSection = ({ icon: Icon, title, children }: any) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Settings2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Settings2 className="w-6 h-6" />
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">Manage your account & preferences</p>
              </div>
            </div>

            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-secondary/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background py-3">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-background py-3">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-background py-3">
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background py-3">
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-background py-3">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingSection icon={User} title="Personal Information">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {settings.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Profile Picture</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={settings.full_name}
                        onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={settings.email}
                        disabled
                        className="bg-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={settings.age}
                        onChange={(e) => setSettings({ ...settings, age: e.target.value })}
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <Label>Sex</Label>
                      <Select value={settings.sex} onValueChange={(v) => setSettings({ ...settings, sex: v })}>
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
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        value={settings.height_cm}
                        onChange={(e) => setSettings({ ...settings, height_cm: e.target.value })}
                        placeholder="175"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Activity Level</Label>
                    <Select value={settings.activity_level} onValueChange={(v) => setSettings({ ...settings, activity_level: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="Light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="Moderate">Moderate (3-5 days/week)</SelectItem>
                        <SelectItem value="Active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="Very Active">Very Active (intense daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingSection icon={Dumbbell} title="Workout Preferences">
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Workout Split</Label>
                    <Select value={settings.workout_preference} onValueChange={(v) => setSettings({ ...settings, workout_preference: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Push/Pull/Legs">Push/Pull/Legs</SelectItem>
                        <SelectItem value="Upper/Lower">Upper/Lower</SelectItem>
                        <SelectItem value="Full Body">Full Body</SelectItem>
                        <SelectItem value="Bro Split">Bro Split (Chest/Back/Legs/Arms)</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Frequency (days/week)</Label>
                      <Select value={settings.workout_frequency} onValueChange={(v) => setSettings({ ...settings, workout_frequency: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="4">4 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="6">6 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Select value={settings.workout_location} onValueChange={(v) => setSettings({ ...settings, workout_location: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gym">🏋️ Gym</SelectItem>
                          <SelectItem value="Home">🏠 Home</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Experience Level</Label>
                      <Select value={settings.workout_experience} onValueChange={(v) => setSettings({ ...settings, workout_experience: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </SettingSection>
            </motion.div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingSection icon={Heart} title="Health Conditions">
                <p className="text-sm text-muted-foreground mb-4">
                  Select any health conditions to get personalized nutrition recommendations
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HEALTH_CONDITIONS_LIST.map((condition) => (
                    <Button
                      key={condition}
                      variant={healthConditions.includes(condition) ? 'default' : 'outline'}
                      onClick={() => toggleHealthCondition(condition)}
                      className="h-auto py-3 justify-start"
                    >
                      {healthConditions.includes(condition) && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {condition}
                    </Button>
                  ))}
                </div>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingSection icon={AlertTriangle} title="Food Allergies">
                <p className="text-sm text-muted-foreground mb-4">
                  We'll warn you when logging foods that contain your allergens
                </p>

                {/* Existing Allergies */}
                {allergies.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {allergies.map((allergy) => (
                      <div
                        key={allergy.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <div>
                          <p className="font-medium">{allergy.allergen_name}</p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              allergy.severity === 'life-threatening'
                                ? 'border-red-500 text-red-500'
                                : allergy.severity === 'severe'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-yellow-500 text-yellow-500'
                            }`}
                          >
                            {allergy.severity}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAllergy(allergy.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Allergy */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Allergen name (e.g., Peanuts)"
                    value={newAllergy.name}
                    onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                  />
                  <Select
                    value={newAllergy.severity}
                    onValueChange={(v) => setNewAllergy({ ...newAllergy, severity: v })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="life-threatening">Life-threatening</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addAllergy}>
                    Add
                  </Button>
                </div>
              </SettingSection>
            </motion.div>
          </TabsContent>

          {/* Goals & Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingSection icon={Target} title="Health Goals">
                <div className="space-y-4">
                  <div>
                    <Label>Primary Goal</Label>
                    <Select value={settings.goal_type} onValueChange={(v) => setSettings({ ...settings, goal_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lose Weight">🏃 Lose Body Fat</SelectItem>
                        <SelectItem value="Gain Muscle">💪 Gain Muscle</SelectItem>
                        <SelectItem value="Maintain Weight">⚖️ Maintain Weight</SelectItem>
                        <SelectItem value="Improve Energy">🔋 Improve Energy</SelectItem>
                        <SelectItem value="Improve Heart Health">❤️ Heart Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Target Weight (kg)</Label>
                      <Input
                        type="number"
                        value={settings.target_weight_kg}
                        onChange={(e) => setSettings({ ...settings, target_weight_kg: e.target.value })}
                        placeholder="70"
                      />
                    </div>

                    <div>
                      <Label>Goal Pace</Label>
                      <Select value={settings.goal_aggression} onValueChange={(v) => setSettings({ ...settings, goal_aggression: v })}>
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
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingSection icon={Clock} title="Intermittent Fasting">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Fasting Plan</p>
                      <p className="text-sm text-muted-foreground">Track your eating window</p>
                    </div>
                    <Switch
                      checked={settings.fasting_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, fasting_enabled: checked })}
                    />
                  </div>

                  {settings.fasting_enabled && (
                    <>
                      <Separator />
                      <div>
                        <Label>Fasting Type</Label>
                        <Select value={settings.fasting_type} onValueChange={(v) => setSettings({ ...settings, fasting_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:8">16:8 (16h fast, 8h eating)</SelectItem>
                            <SelectItem value="18:6">18:6 (18h fast, 6h eating)</SelectItem>
                            <SelectItem value="20:4">20:4 (20h fast, 4h eating)</SelectItem>
                            <SelectItem value="14:10">14:10 (14h fast, 10h eating)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Eating Window Start</Label>
                          <Input
                            type="time"
                            value={settings.fasting_start}
                            onChange={(e) => setSettings({ ...settings, fasting_start: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Eating Window End</Label>
                          <Input
                            type="time"
                            value={settings.fasting_end}
                            onChange={(e) => setSettings({ ...settings, fasting_end: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm">
                          <strong>Your eating window:</strong> {settings.fasting_start} - {settings.fasting_end}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </SettingSection>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingSection icon={Bell} title="Notification Preferences">
                <div className="mb-6">
                  <Button
                    onClick={() => navigate('/notifications')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Manage All Notifications
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Set up reminders for shopping, workouts, meals, and more
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Meal Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified to log your meals</p>
                    </div>
                    <Switch
                      checked={settings.meal_reminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, meal_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Workout Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified about scheduled workouts</p>
                    </div>
                    <Switch
                      checked={settings.workout_reminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, workout_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Medication Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified to take medications</p>
                    </div>
                    <Switch
                      checked={settings.medication_reminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, medication_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Hydration Reminders</p>
                      <p className="text-sm text-muted-foreground">Get reminded to drink water</p>
                    </div>
                    <Switch
                      checked={settings.hydration_reminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, hydration_reminders: checked })}
                    />
                  </div>
                </div>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingSection icon={Palette} title="Appearance">
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <Button
                        variant={currentTheme === 'light' ? 'default' : 'outline'}
                        onClick={() => setTheme('light')}
                      >
                        ☀️ Light
                      </Button>
                      <Button
                        variant={currentTheme === 'dark' ? 'default' : 'outline'}
                        onClick={() => setTheme('dark')}
                      >
                        🌙 Dark
                      </Button>
                      <Button
                        variant={currentTheme === 'system' ? 'default' : 'outline'}
                        onClick={() => setTheme('system')}
                      >
                        💻 System
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-4 gap-3 mt-2">
                      {['orange', 'blue', 'green', 'purple'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSettings({ ...settings, accent_color: color })}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            settings.accent_color === color ? 'border-primary scale-105' : 'border-transparent'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, 
                              ${color === 'orange' ? '#f97316, #fb923c' : 
                                color === 'blue' ? '#3b82f6, #60a5fa' :
                                color === 'green' ? '#10b981, #34d399' :
                                '#8b5cf6, #a78bfa'})`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SettingSection>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingSection icon={Shield} title="Security">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                    </div>
                    <Button variant="outline">
                      Enable
                    </Button>
                  </div>
                </div>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SettingSection icon={CreditCard} title="Subscription & Billing">
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Free Plan</p>
                      <p className="text-sm text-muted-foreground">Upgrade to unlock premium features</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>

                <Separator className="my-4" />

                <Button variant="outline" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Billing History
                </Button>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SettingSection icon={Globe} title="Data & Privacy">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Button>
                </div>
              </SettingSection>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-destructive/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    <h3 className="text-xl font-bold">Danger Zone</h3>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-semibold text-destructive mb-2">You will lose:</p>
              <ul className="text-sm space-y-1 text-destructive/80">
                <li>• All your health data and progress</li>
                <li>• All your recipes and meal plans</li>
                <li>• All your workout logs and achievements</li>
                <li>• Your subscription and purchase history</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
