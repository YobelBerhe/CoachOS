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

        // Fetch all data in parallel
        // @ts-ignore - Type instantiation issue with Supabase types
        const results: any = await Promise.allSettled([
          // Profile
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single(),

          // Daily targets
          supabase
            .from('daily_targets')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single(),

          // Food logs
          supabase
            .from('food_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .order('time', { ascending: true }),

          // Workout session
          supabase
            .from('workout_sessions')
            .select('*, exercise_logs(*)')
            .eq('user_id', userId)
            .eq('date', today)
            .single(),

          // Sleep log
          supabase
            .from('sleep_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single(),

          // Fasting plan
          supabase
            .from('fasting_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single(),

          // Medications
          supabase
            .from('medications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true),

          // Medication logs
          supabase
            .from('medication_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('scheduled_time', `${today}T00:00:00`)
            .lte('scheduled_time', `${today}T23:59:59`),

          // Compliance score
          supabase
            .from('compliance_scores')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single()
        ]);

        const [
          profileRes,
          targetsRes,
          foodLogsRes,
          workoutRes,
          sleepRes,
          fastingRes,
          medsRes,
          medLogsRes,
          scoreRes
        ] = results;

        setData({
          profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
          targets: targetsRes.status === 'fulfilled' ? targetsRes.value.data : null,
          foodLogs: foodLogsRes.status === 'fulfilled' ? (foodLogsRes.value.data || []) : [],
          workout: workoutRes.status === 'fulfilled' ? workoutRes.value.data : null,
          sleepLog: sleepRes.status === 'fulfilled' ? sleepRes.value.data : null,
          fastingPlan: fastingRes.status === 'fulfilled' ? fastingRes.value.data : null,
          medications: medsRes.status === 'fulfilled' ? (medsRes.value.data || []) : [],
          medicationLogs: medLogsRes.status === 'fulfilled' ? (medLogsRes.value.data || []) : [],
          complianceScore: scoreRes.status === 'fulfilled' ? scoreRes.value.data : null,
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
