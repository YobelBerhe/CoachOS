import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ComplianceCard } from "@/components/dashboard/ComplianceCard";
import { NutritionCard } from "@/components/dashboard/NutritionCard";
import { WorkoutCard } from "@/components/dashboard/WorkoutCard";
import { FastingCard } from "@/components/dashboard/FastingCard";
import { SleepCard } from "@/components/dashboard/SleepCard";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <DashboardHeader userId={userId!} />
        <ComplianceCard userId={userId!} />
        
        <div className="space-y-3">
          <NutritionCard userId={userId!} />
          <WorkoutCard userId={userId!} />
          <FastingCard userId={userId!} />
          <SleepCard userId={userId!} />
        </div>
      </div>
      
      <QuickActions userId={userId!} />
    </div>
  );
};

export default Dashboard;
