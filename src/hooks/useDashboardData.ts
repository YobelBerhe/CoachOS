import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  profile: any;
  targets: any;
  foodLogs: any[];
  workout: any;
  sleepLog: any;
  fastingPlan: any;
  medications: any[];
  medicationLogs: any[];
  complianceScore: any;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(userId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    targets: null,
    foodLogs: [],
    workout: null,
    sleepLog: null,
    fastingPlan: null,
    medications: [],
    medicationLogs: [],
    complianceScore: null,
    loading: true,
    error: null
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    async function fetchAllData() {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Fetch daily targets
        const { data: targets } = await supabase
          .from('daily_targets')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        // Fetch food logs
        const { data: foodLogs } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .order('time', { ascending: true });

        // Fetch workout session
        const { data: workout } = await supabase
          .from('workout_sessions')
          .select('*, exercise_logs(*)')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        // Fetch sleep log
        const { data: sleepLog } = await supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        // Fetch fasting plan
        const { data: fastingPlan } = await supabase
          .from('fasting_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        // Fetch medications
        const { data: medications } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        // Fetch medication logs
        const { data: medicationLogs } = await supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('scheduled_time', `${today}T00:00:00`)
          .lte('scheduled_time', `${today}T23:59:59`);

        // Fetch compliance score
        const { data: complianceScore } = await supabase
          .from('compliance_scores')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        setData({
          profile,
          targets,
          foodLogs: foodLogs || [],
          workout,
          sleepLog,
          fastingPlan,
          medications: medications || [],
          medicationLogs: medicationLogs || [],
          complianceScore,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    }

    fetchAllData();

    // Subscribe to real-time updates for food logs
    const foodLogsSubscription = supabase
      .channel('food_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_logs',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      foodLogsSubscription.unsubscribe();
    };
  }, [userId, today]);

  return data;
}
