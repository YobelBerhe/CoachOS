import { supabase } from '@/integrations/supabase/client';

class NotificationService {
  private permission: NotificationPermission = 'default';

  async init() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'granted') {
      await this.setupNotifications();
      return true;
    }

    return false;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === 'granted') {
      await this.setupNotifications();
      return true;
    }

    return false;
  }

  async setupNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notifications_enabled: true
        } as any);

      console.log('✅ Notifications enabled');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }

  async sendNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      ...options
    });

    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  async scheduleNotification(
    title: string,
    body: string,
    triggerAt: Date,
    type: 'shopping' | 'workout' | 'meal' | 'water'
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('scheduled_notifications').insert({
        user_id: user.id,
        title,
        body,
        type,
        trigger_at: triggerAt.toISOString(),
        sent: false
      } as any);

      console.log('📅 Notification scheduled:', title);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async sendShoppingReminder(listName: string, itemsLeft: number) {
    return this.sendNotification(
      '🛒 Shopping Reminder',
      {
        body: `Don't forget to shop! ${itemsLeft} items remaining in "${listName}"`,
        tag: 'shopping-reminder',
        data: { type: 'shopping' }
      }
    );
  }

  async sendMealPrepReminder() {
    return this.sendNotification(
      '👨‍🍳 Meal Prep Time!',
      {
        body: 'Time to prepare your meals for the week',
        tag: 'meal-prep',
        data: { type: 'meal' }
      }
    );
  }

  async sendWorkoutReminder(workoutType: string) {
    return this.sendNotification(
      '💪 Workout Time!',
      {
        body: `Time for your ${workoutType} workout`,
        tag: 'workout',
        data: { type: 'workout' }
      }
    );
  }

  async sendWaterReminder() {
    return this.sendNotification(
      '💧 Hydration Check',
      {
        body: 'Remember to drink water!',
        tag: 'water',
        data: { type: 'water' }
      }
    );
  }

  async sendHealthyChoiceCongrats(productName: string) {
    return this.sendNotification(
      '🎉 Great Choice!',
      {
        body: `${productName} is approved! Keep making healthy choices!`,
        tag: 'healthy-choice',
        data: { type: 'shopping' }
      }
    );
  }

  async sendUnhealthyWarning(productName: string, issues: number) {
    return this.sendNotification(
      '⚠️ Health Warning',
      {
        body: `${productName} has ${issues} red flags. Check for alternatives!`,
        tag: 'unhealthy-warning',
        data: { type: 'shopping' }
      }
    );
  }

  isEnabled() {
    return this.permission === 'granted';
  }

  async disable() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_settings')
      .update({ notifications_enabled: false } as any)
      .eq('user_id', user.id);

    this.permission = 'denied';
  }
}

export const notificationService = new NotificationService();
