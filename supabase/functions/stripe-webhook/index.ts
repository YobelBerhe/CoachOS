import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = WEBHOOK_SECRET 
      ? stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
      : JSON.parse(body);

    console.log(`[Webhook] Received event: ${event.type}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);

        const { error: txError } = await supabase
          .from("payment_transactions")
          .update({
            status: "succeeded",
            stripe_charge_id: paymentIntent.latest_charge as string,
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (txError) {
          console.error("[Webhook] Error updating transaction:", txError);
          throw txError;
        }

        const { data: transaction } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single();

        if (transaction) {
          const { error: unlockError } = await supabase
            .from("recipe_unlocks")
            .insert({
              user_id: transaction.buyer_id,
              recipe_id: transaction.recipe_id,
              amount_paid: transaction.amount_total / 100,
              platform_fee: transaction.amount_platform_fee / 100,
              creator_payout: transaction.amount_creator_payout / 100,
              stripe_payment_intent_id: paymentIntent.id,
              status: "completed",
            });

          if (unlockError) {
            console.error("[Webhook] Error creating unlock:", unlockError);
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);

        await supabase
          .from("payment_transactions")
          .update({
            status: "failed",
            failure_reason: paymentIntent.last_payment_error?.message,
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        console.log(`[Webhook] Account updated: ${account.id}`);

        await supabase
          .from("stripe_connect_accounts")
          .update({
            onboarding_complete: account.details_submitted || false,
            details_submitted: account.details_submitted || false,
            charges_enabled: account.charges_enabled || false,
            payouts_enabled: account.payouts_enabled || false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_account_id", account.id);

        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
