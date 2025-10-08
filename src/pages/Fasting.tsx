import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FastingCircularProgress } from "@/components/fasting/FastingCircularProgress";
import { FastingTimeline } from "@/components/fasting/FastingTimeline";
import { EditFastingDialog } from "@/components/fasting/EditFastingDialog";
import { ArrowLeft, Settings, Flame, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Fasting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [fastingPlan, setFastingPlan] = useState<any>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(960); // 16 hours default
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (fastingPlan) {
      const interval = setInterval(() => {
        updateFastingStatus();
      }, 60000); // Update every minute

      updateFastingStatus();
      return () => clearInterval(interval);
    }
  }, [fastingPlan]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const { data: plan } = await supabase
        .from('fasting_plans')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .single();

      if (plan) {
        setFastingPlan(plan);
        
        // Fetch streak
        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', uid)
          .eq('type', 'fasting')
          .single();

        if (streakData) {
          setStreak({
            current: streakData.current_streak,
            longest: streakData.longest_streak
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching fasting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFastingStatus = () => {
    if (!fastingPlan) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(fastingPlan.eating_window_start);
    const endMinutes = parseTime(fastingPlan.eating_window_end);

    let isCurrentlyFasting: boolean;
    let elapsed: number;
    let total: number;

    if (startMinutes < endMinutes) {
      // Normal case: eating window within same day
      isCurrentlyFasting = currentMinutes < startMinutes || currentMinutes >= endMinutes;
      
      if (currentMinutes < startMinutes) {
        elapsed = (24 * 60 - endMinutes) + currentMinutes;
        total = (24 * 60 - endMinutes) + startMinutes;
      } else {
        elapsed = currentMinutes - endMinutes;
        total = (24 * 60 - endMinutes) + startMinutes;
      }
    } else {
      // Eating window crosses midnight
      isCurrentlyFasting = currentMinutes >= endMinutes && currentMinutes < startMinutes;
      elapsed = currentMinutes - endMinutes;
      total = startMinutes - endMinutes;
    }

    if (!isCurrentlyFasting) {
      // In eating window
      elapsed = currentMinutes - startMinutes;
      total = endMinutes - startMinutes;
    }

    setIsFasting(isCurrentlyFasting);
    setElapsedMinutes(Math.max(0, elapsed));
    setTotalMinutes(total);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!fastingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Fasting Timer</h1>
          </div>

          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">No fasting plan set up yet</p>
              <Button onClick={() => setShowEditDialog(true)}>
                Set Up Fasting Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {userId && (
          <EditFastingDialog
            open={showEditDialog}
            onClose={() => setShowEditDialog(false)}
            userId={userId}
            currentPlan={null}
            onSuccess={() => fetchData(userId)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Fasting Timer</h1>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <Badge 
              variant={isFasting ? "default" : "secondary"}
              className="mb-4 text-sm px-4 py-1"
            >
              {isFasting ? "🔒 Fasting" : "🍽️ Eating Window Open"}
            </Badge>

            <FastingCircularProgress
              totalMinutes={totalMinutes}
              elapsedMinutes={elapsedMinutes}
              isFasting={isFasting}
            />

            <div className="text-center mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">
                {fastingPlan.type} Schedule
              </p>
              <p className="text-sm font-medium">
                Eating Window: {fastingPlan.eating_window_start} - {fastingPlan.eating_window_end}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">24-Hour Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <FastingTimeline
              eatingWindowStart={fastingPlan.eating_window_start}
              eatingWindowEnd={fastingPlan.eating_window_end}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">{streak.current}</p>
              </div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">{streak.longest}</p>
              </div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Perfect Days</span>
              <span className="font-semibold">0/7</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep your streak going by staying within your eating window!
            </p>
          </CardContent>
        </Card>
      </div>

      {userId && (
        <EditFastingDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          userId={userId}
          currentPlan={fastingPlan}
          onSuccess={() => fetchData(userId)}
        />
      )}
    </div>
  );
};

export default Fasting;
