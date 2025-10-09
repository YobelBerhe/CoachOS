import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatorOnboardingProps {
  userId: string;
}

export default function CreatorOnboarding({ userId }: CreatorOnboardingProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);

  useEffect(() => {
    checkAccountStatus();
  }, [userId]);

  async function checkAccountStatus() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('stripe_connect_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { data: statusData } = await supabase.functions.invoke('stripe-connect', {
          body: {
            action: 'check_account_status',
            accountId: data.stripe_account_id
          }
        });

        if (statusData?.success) {
          setAccountStatus({
            ...data,
            ...statusData.status
          });
        } else {
          setAccountStatus(data);
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startOnboarding() {
    try {
      setProcessing(true);

      let currentAccountId = accountStatus?.stripe_account_id;

      if (!currentAccountId) {
        const { data: createData, error: createError } = await supabase.functions.invoke(
          'stripe-connect',
          {
            body: {
              action: 'create_account',
              userId
            }
          }
        );

        if (createError) throw createError;
        if (!createData?.success) throw new Error('Failed to create account');

        currentAccountId = createData.accountId;
      }

      const returnUrl = `${window.location.origin}/creator-dashboard?onboarding=complete`;
      const refreshUrl = `${window.location.origin}/creator-dashboard?onboarding=refresh`;

      const { data: linkData, error: linkError } = await supabase.functions.invoke(
        'stripe-connect',
        {
          body: {
            action: 'create_account_link',
            accountId: currentAccountId,
            returnUrl,
            refreshUrl
          }
        }
      );

      if (linkError) throw linkError;
      if (!linkData?.success) throw new Error('Failed to create onboarding link');

      window.location.href = linkData.url;

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  }

  async function openDashboard() {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: {
          action: 'create_login_link',
          accountId: accountStatus.stripe_account_id
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error('Failed to create dashboard link');

      window.open(data.url, '_blank');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading account status...</p>
        </CardContent>
      </Card>
    );
  }

  const isComplete = accountStatus?.onboarding_complete && accountStatus?.payouts_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Creator Payouts Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {accountStatus && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <span className="font-semibold">
                {isComplete ? 'Ready to Receive Payments' : 'Setup Required'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm">Onboarding</span>
                {accountStatus.onboarding_complete ? (
                  <Badge variant="default" className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm">Payouts</span>
                {accountStatus.payouts_enabled ? (
                  <Badge variant="default" className="bg-green-600">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {!isComplete && (
          <Alert>
            <Sparkles className="w-4 h-4" />
            <AlertDescription>
              Complete your setup to start earning money from your recipes!
              Setup takes about 5 minutes.
            </AlertDescription>
          </Alert>
        )}

        {!accountStatus && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">What You'll Need:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Email address</li>
              <li>✓ Bank account details</li>
              <li>✓ Tax information (SSN or EIN)</li>
              <li>✓ Personal identification</li>
            </ul>
          </div>
        )}

        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
          <h4 className="font-semibold mb-2">Creator Benefits:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>💰 Earn 85% from each recipe sale</li>
            <li>🚀 Weekly automatic payouts</li>
            <li>📊 Real-time earnings dashboard</li>
            <li>🔒 Secure payment processing</li>
          </ul>
        </div>

        <div className="flex gap-3">
          {!isComplete ? (
            <Button
              onClick={startOnboarding}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {accountStatus ? 'Complete Setup' : 'Start Setup'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={openDashboard}
              disabled={processing}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Dashboard
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Powered by Stripe • Your data is secure and encrypted
        </p>
      </CardContent>
    </Card>
  );
}
