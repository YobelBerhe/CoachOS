import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Flame } from "lucide-react";
import { format } from "date-fns";

interface DashboardHeaderProps {
  userId: string;
}

export const DashboardHeader = ({ userId }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const today = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    // Fetch user's current streak - placeholder for now
    setStreak(0);
  }, [userId]);

  return (
    <header className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">CoachOS</h1>
        </div>
        <p className="text-sm text-muted-foreground">{today}</p>
        {streak > 0 && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{streak} day streak</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate("/auth");
        }}
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </header>
  );
};
