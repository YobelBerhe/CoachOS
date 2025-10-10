import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

const ACHIEVEMENTS = [
  {
    type: 'first_save',
    name: 'First Victory',
    description: 'Saved your first item from waste',
    icon: '🎉',
    threshold: 1
  },
  {
    type: 'money_saver_10',
    name: 'Thrifty',
    description: 'Saved $10 from food waste',
    icon: '💰',
    threshold: 10
  },
  {
    type: 'money_saver_50',
    name: 'Budget Master',
    description: 'Saved $50 from food waste',
    icon: '💎',
    threshold: 50
  },
  {
    type: 'money_saver_100',
    name: 'Savings Champion',
    description: 'Saved $100 from food waste',
    icon: '🏆',
    threshold: 100
  },
  {
    type: 'carbon_hero_10',
    name: 'Eco Warrior',
    description: 'Prevented 10kg CO2 emissions',
    icon: '🌱',
    threshold: 10
  },
  {
    type: 'carbon_hero_50',
    name: 'Climate Champion',
    description: 'Prevented 50kg CO2 emissions',
    icon: '🌍',
    threshold: 50
  },
  {
    type: 'zero_waste_week',
    name: 'Zero Waste Week',
    description: "Didn't waste any food for 7 days",
    icon: '⭐',
    threshold: 7
  },
  {
    type: 'recipe_master',
    name: 'Chef Master',
    description: 'Generated 10 rescue recipes',
    icon: '👨‍🍳',
    threshold: 10
  }
];

export async function checkAchievements() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user stats
    const { data: savingsData } = await supabase
      .from('carbon_savings')
      .select('*')
      .eq('user_id', user.id);

    const totalSaved = (savingsData || []).reduce((acc, item) => ({
      money: acc.money + item.money_saved,
      carbon: acc.carbon + item.carbon_saved_kg,
      items: acc.items + item.waste_prevented_count
    }), { money: 0, carbon: 0, items: 0 });

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      // Check if already earned
      const { data: existing } = await supabase
        .from('waste_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_type', achievement.type)
        .maybeSingle();

      if (existing) continue; // Already earned

      let shouldUnlock = false;
      let milestoneValue = 0;

      // Check conditions
      if (achievement.type.startsWith('money_saver_')) {
        shouldUnlock = totalSaved.money >= achievement.threshold;
        milestoneValue = totalSaved.money;
      } else if (achievement.type.startsWith('carbon_hero_')) {
        shouldUnlock = totalSaved.carbon >= achievement.threshold;
        milestoneValue = totalSaved.carbon;
      } else if (achievement.type === 'first_save') {
        shouldUnlock = totalSaved.items >= 1;
        milestoneValue = totalSaved.items;
      }

      // Unlock achievement
      if (shouldUnlock) {
        await supabase
          .from('waste_achievements')
          .insert({
            user_id: user.id,
            achievement_type: achievement.type,
            achievement_name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            earned_date: new Date().toISOString().split('T')[0],
            milestone_value: milestoneValue
          });

        // Celebrate!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });

        // Show notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🏆 Achievement Unlocked!', {
            body: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
            icon: '/icon-192x192.png'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
