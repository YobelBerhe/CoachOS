import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import NutritionCard from '@/components/dashboard/NutritionCard';
import WorkoutCard from '@/components/dashboard/WorkoutCard';
import SleepCard from '@/components/dashboard/SleepCard';
import MedsCard from '@/components/dashboard/MedsCard';
import { FastingCard } from '@/components/dashboard/FastingCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import ComplianceCard from '@/components/dashboard/ComplianceCard';
import HydrationCard from '@/components/dashboard/HydrationCard';
import { calculateComplianceScore, getCurrentStreak } from '@/lib/compliance';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [streak, setStreak] = useState(0);
  const [calculatingScore, setCalculatingScore] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
    }
    checkUser();
  }, [navigate]);

  const {
    targets,
    foodLogs,
    workout,
    sleepLog,
    fastingPlan,
    medications,
    medicationLogs,
    complianceScore,
    loading,
    error
  } = useDashboardData(userId);

  const today = new Date().toISOString().split('T')[0];

  // Calculate compliance and get streak
  useEffect(() => {
    async function calculateTodayScore() {
      if (!userId) return;
      
      try {
        setCalculatingScore(true);
        await calculateComplianceScore(userId, today);
        const currentStreak = await getCurrentStreak(userId);
        setStreak(currentStreak);
      } catch (error) {
        console.error('Error calculating compliance:', error);
      } finally {
        setCalculatingScore(false);
      }
    }

    if (userId) {
      calculateTodayScore();
    }
  }, [userId, today]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <DashboardHeader userId={userId!} />

        <div className="space-y-4 mt-6">
          <NutritionCard
            targets={targets}
            foodLogs={foodLogs}
            fastingPlan={fastingPlan}
          />

          <WorkoutCard workout={workout} userId={userId!} date={today} />

          <SleepCard sleepLog={sleepLog} userId={userId!} date={today} />

          <MedsCard medications={medications} medicationLogs={medicationLogs} userId={userId!} date={today} />

          <FastingCard userId={userId!} />

          <HydrationCard userId={userId!} date={today} />

          {complianceScore && <ComplianceCard score={complianceScore} />}
        </div>

        <QuickActions userId={userId!} />
      </div>
    </div>
  );
}
