import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Bell,
  BellOff,
  ShoppingCart,
  Dumbbell,
  Coffee,
  Droplet,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

interface NotificationSettings {
  enabled: boolean;
  shopping_reminders: boolean;
  shopping_time: string;
  workout_reminders: boolean;
  workout_time: string;
  meal_prep_reminders: boolean;
  meal_prep_day: string;
  water_reminders: boolean;
  water_interval: number;
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    shopping_reminders: true,
    shopping_time: '09:00',
    workout_reminders: true,
    workout_time: '18:00',
    meal_prep_reminders: true,
    meal_prep_day: 'Sunday',
    water_reminders: true,
    water_interval: 2
  });

  useEffect(() => {
    loadSettings();
    checkNotificationStatus();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          enabled: data.notifications_enabled || false,
          shopping_reminders: data.shopping_reminders ?? true,
          shopping_time: data.shopping_time || '09:00',
          workout_reminders: data.workout_reminders ?? true,
          workout_time: data.workout_time || '18:00',
          meal_prep_reminders: data.meal_prep_reminders ?? true,
          meal_prep_day: data.meal_prep_day || 'Sunday',
          water_reminders: data.water_reminders ?? true,
          water_interval: data.water_interval || 2
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function checkNotificationStatus() {
    const enabled = await notificationService.init();
    setSettings(prev => ({ ...prev, enabled }));
  }

  async function toggleNotifications(enabled: boolean) {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        await updateSetting('notifications_enabled', true);
        toast({
          title: "🔔 Notifications enabled!",
          description: "You'll receive reminders and updates"
        });
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
      }
    } else {
      await notificationService.disable();
      await updateSetting('notifications_enabled', false);
      toast({
        title: "🔕 Notifications disabled",
        description: "You won't receive any reminders"
      });
    }
  }

  async function updateSetting(key: string, value: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, [key]: value } as any);

      setSettings(prev => ({ ...prev, [key.replace('_', '_')]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  async function testNotification(type: string) {
    switch (type) {
      case 'shopping':
        await notificationService.sendShoppingReminder('Weekly Shopping', 12);
        break;
      case 'workout':
        await notificationService.sendWorkoutReminder('Upper Body');
        break;
      case 'meal':
        await notificationService.sendMealPrepReminder();
        break;
      case 'water':
        await notificationService.sendWaterReminder();
        break;
    }
    toast({ title: "Test notification sent! 📬" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-500" />
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your reminders and alerts
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Master Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden mb-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${
              settings.enabled
                ? 'from-blue-500/10 to-cyan-500/10'
                : 'from-gray-500/10 to-gray-600/10'
            }`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    settings.enabled
                      ? 'from-blue-500 to-cyan-500'
                      : 'from-gray-500 to-gray-600'
                  } flex items-center justify-center`}>
                    {settings.enabled ? (
                      <Bell className="w-8 h-8 text-white" />
                    ) : (
                      <BellOff className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {settings.enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {settings.enabled
                        ? 'You\'ll receive reminders and updates'
                        : 'Enable to get reminders and updates'
                      }
                    </p>
                  </div>
                </div>

                <Switch
                  checked={settings.enabled}
                  onCheckedChange={toggleNotifications}
                  className="scale-125"
                />
              </div>

              {settings.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                >
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>All systems go! You'll receive personalized reminders</span>
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Shopping Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Shopping Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about incomplete shopping lists
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.shopping_reminders}
                  onCheckedChange={(v) => updateSetting('shopping_reminders', v)}
                  disabled={!settings.enabled}
                />
              </div>

              {settings.shopping_reminders && settings.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-sm mb-2 block">Reminder Time</Label>
                    <Select
                      value={settings.shopping_time}
                      onValueChange={(v) => updateSetting('shopping_time', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('shopping')}
                    className="w-full"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Test Notification
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Workout Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Workout Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Never miss your gym session
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.workout_reminders}
                  onCheckedChange={(v) => updateSetting('workout_reminders', v)}
                  disabled={!settings.enabled}
                />
              </div>

              {settings.workout_reminders && settings.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-sm mb-2 block">Workout Time</Label>
                    <Select
                      value={settings.workout_time}
                      onValueChange={(v) => updateSetting('workout_time', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('workout')}
                    className="w-full"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Test Notification
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Meal Prep & Water Reminders - condensed for brevity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Meal Prep Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Prepare meals for the week
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.meal_prep_reminders}
                  onCheckedChange={(v) => updateSetting('meal_prep_reminders', v)}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Water Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Stay hydrated throughout the day
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.water_reminders}
                  onCheckedChange={(v) => updateSetting('water_reminders', v)}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
