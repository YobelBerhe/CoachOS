import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Flame, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { calculateComplianceScore } from "@/lib/compliance";

interface DashboardHeaderProps {
  userId: string;
}

export const DashboardHeader = ({ userId }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchUserProfile();
    fetchStreak();
    fetchOrCalculateScore();
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

  const fetchOrCalculateScore = async () => {
    const { data: existingScore } = await supabase
      .from('compliance_scores')
      .select('overall_score')
      .eq('user_id', userId)
      .eq('date', todayDate)
      .single();
    
    if (existingScore) {
      setScore(existingScore.overall_score);
    } else {
      const newScore = await calculateComplianceScore(userId, todayDate);
      if (newScore) {
        setScore(newScore.overall_score);
      }
    }
  };

  const getScoreBadgeClasses = () => {
    if (score >= 80) return "bg-success text-success-foreground";
    if (score >= 60) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <header className="space-y-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/creator-dashboard")}
            className="gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Creator
          </Button>
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
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-semibold">{streak} day streak</span>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${getScoreBadgeClasses()}`}>
          {score}% Compliance
        </div>
      </div>
    </header>
  );
};
