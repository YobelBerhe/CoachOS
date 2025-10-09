import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Only initialize Stripe if the publishable key is available
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentCheckoutProps {
  recipeId: string;
  recipeName: string;
  price: number;
  onSuccess: () => void;
}

function CheckoutForm({ recipeId, recipeName, price, onSuccess }: PaymentCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/recipe/${recipeId}?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        onSuccess();
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="font-medium">{recipeName}</span>
          <span className="font-bold">${price.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          One-time purchase • Instant access • Lifetime unlock
        </p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${price.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        <Lock className="w-3 h-3 inline mr-1" />
        Secure payment powered by Stripe
      </p>
    </form>
  );
}

export default function PaymentCheckout(props: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: {
            recipeId: props.recipeId,
            buyerId: user.id
          }
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Failed to create payment');

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [props.recipeId, toast]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Preparing checkout...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to initialize payment</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
