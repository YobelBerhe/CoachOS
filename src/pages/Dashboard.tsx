import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NutritionCard } from "@/components/dashboard/NutritionCard";
import { WorkoutCard } from "@/components/dashboard/WorkoutCard";
import { SleepCard } from "@/components/dashboard/SleepCard";
import { MedsCard } from "@/components/dashboard/MedsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <DashboardHeader userId={userId!} />
        
        <div className="space-y-3">
          <NutritionCard userId={userId!} />
          <WorkoutCard userId={userId!} />
          <SleepCard userId={userId!} />
          <MedsCard userId={userId!} />
        </div>
      </div>
      
      <QuickActions userId={userId!} />
    </div>
  );
};

export default Dashboard;
