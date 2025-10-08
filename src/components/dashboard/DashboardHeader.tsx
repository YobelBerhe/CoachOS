import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Flame } from "lucide-react";
import { format } from "date-fns";

interface DashboardHeaderProps {
  userId: string;
}

export const DashboardHeader = ({ userId }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [streak, setStreak] = useState(0);
  const today = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    fetchUserProfile();
    fetchStreak();
  }, [userId]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    
    if (data?.full_name) {
      setUserName(data.full_name.split(' ')[0]);
    }
  };

  const fetchStreak = async () => {
    const { data } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .eq('type', 'compliance')
      .single();
    
    if (data) {
      setStreak(data.current_streak);
    }
  };

  return (
    <header className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full">
          <Flame className="h-4 w-4 text-primary" />
          <span className="font-semibold">{streak} day streak</span>
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
      </div>
    </header>
  );
};
