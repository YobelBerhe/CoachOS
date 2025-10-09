import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, userId, accountId, returnUrl, refreshUrl } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`[Stripe Connect] Action: ${action}`);

    switch (action) {
      case "create_account": {
        console.log(`[Stripe Connect] Creating account for user: ${userId}`);

        const { data: existing } = await supabase
          .from("stripe_connect_accounts")
          .select("stripe_account_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({
              success: true,
              accountId: existing.stripe_account_id,
              message: "Account already exists",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const account = await stripe.accounts.create({
          type: "express",
          country: "US",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

        const { error: dbError } = await supabase
          .from("stripe_connect_accounts")
          .insert({
            user_id: userId,
            stripe_account_id: account.id,
            account_type: "express",
            country: "US",
            currency: "usd",
          });

        if (dbError) throw dbError;

        console.log(`[Stripe Connect] Created account: ${account.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            accountId: account.id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_account_link": {
        console.log(`[Stripe Connect] Creating account link for: ${accountId}`);

        const accountLink = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: refreshUrl || `${returnUrl}?refresh=true`,
          return_url: returnUrl,
          type: "account_onboarding",
        });

        return new Response(
          JSON.stringify({
            success: true,
            url: accountLink.url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_account_status": {
        console.log(`[Stripe Connect] Checking status for: ${accountId}`);

        const account = await stripe.accounts.retrieve(accountId);

        const { error: updateError } = await supabase
          .from("stripe_connect_accounts")
          .update({
            onboarding_complete: account.details_submitted || false,
            details_submitted: account.details_submitted || false,
            charges_enabled: account.charges_enabled || false,
            payouts_enabled: account.payouts_enabled || false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_account_id", accountId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            status: {
              onboarding_complete: account.details_submitted,
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_login_link": {
        console.log(`[Stripe Connect] Creating login link for: ${accountId}`);

        const loginLink = await stripe.accounts.createLoginLink(accountId);

        return new Response(
          JSON.stringify({
            success: true,
            url: loginLink.url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("[Stripe Connect] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
