import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Sparkles, Zap } from 'lucide-react';

export default function ProfileCompletionReminder() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkAndShow();
  }, []);

  async function checkAndShow() {
    if (dismissed) return;

    const lastDismissed = localStorage.getItem('profileReminderDismissed');
    if (lastDismissed) {
      const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', user.id)
      .single();

    if (!profile?.profile_completed) {
      setTimeout(() => setShow(true), 30000);
    }
  }

  function dismiss() {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('profileReminderDismissed', Date.now().toString());
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <Card className="border-2 border-primary shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-1">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlock AI recommendations & personalized insights
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        dismiss();
                        navigate('/profile-setup');
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Setup Now
                    </Button>
                    <Button
                      onClick={dismiss}
                      size="sm"
                      variant="ghost"
                    >
                      Later
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={dismiss}
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
