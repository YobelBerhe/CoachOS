import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Moon } from "lucide-react";
import { AddSleepDialog } from "@/components/sleep/AddSleepDialog";

const Sleep = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [showAddSleep, setShowAddSleep] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchLogs(session.user.id);
      }
    });
  }, [navigate]);

  const fetchLogs = async (uid: string) => {
    const { data } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(7);
    
    if (data) setRecentLogs(data);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const avgSleep = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((sum, log) => sum + log.duration_min, 0) / recentLogs.length / 60 * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Sleep</h1>
            <p className="text-sm text-muted-foreground">Track your rest and recovery</p>
          </div>
        </header>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>7-Day Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{avgSleep}h</div>
              <p className="text-sm text-muted-foreground">average sleep per night</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Nights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">No sleep logs yet</p>
                <Button onClick={() => setShowAddSleep(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Sleep
                </Button>
              </div>
            ) : (
              <>
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.bedtime} - {log.wake_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Math.floor(log.duration_min / 60)}h {log.duration_min % 60}m</p>
                      {log.quality && <p className="text-sm text-muted-foreground">★ {log.quality}/10</p>}
                    </div>
                  </div>
                ))}
                <Button onClick={() => setShowAddSleep(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Sleep
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddSleepDialog 
        open={showAddSleep} 
        onClose={() => setShowAddSleep(false)}
        userId={userId}
        onSuccess={() => fetchLogs(userId)}
      />
    </div>
  );
};

export default Sleep;
