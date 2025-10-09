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
const PLATFORM_FEE_PERCENT = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipeId, buyerId } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`[Payment] Processing payment for recipe: ${recipeId}`);

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("*, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      throw new Error("Recipe not found");
    }

    if (!recipe.is_paid || !recipe.price) {
      throw new Error("Recipe is not for sale");
    }

    const { data: existingUnlock } = await supabase
      .from("recipe_unlocks")
      .select("id")
      .eq("user_id", buyerId)
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (existingUnlock) {
      throw new Error("Recipe already unlocked");
    }

    const { data: sellerAccount, error: accountError } = await supabase
      .from("stripe_connect_accounts")
      .select("stripe_account_id, payouts_enabled")
      .eq("user_id", recipe.user_id)
      .maybeSingle();

    if (accountError || !sellerAccount) {
      throw new Error("Seller has not set up payouts");
    }

    if (!sellerAccount.payouts_enabled) {
      throw new Error("Seller's account is not ready to receive payments");
    }

    const amountTotal = Math.round(recipe.price * 100);
    const platformFee = Math.round(amountTotal * (PLATFORM_FEE_PERCENT / 100));
    const creatorPayout = amountTotal - platformFee;

    console.log(`[Payment] Amount: $${recipe.price}, Platform: $${platformFee / 100}, Creator: $${creatorPayout / 100}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerAccount.stripe_account_id,
      },
      metadata: {
        recipe_id: recipeId,
        buyer_id: buyerId,
        seller_id: recipe.user_id,
      },
    });

    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        buyer_id: buyerId,
        seller_id: recipe.user_id,
        recipe_id: recipeId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_total: amountTotal,
        amount_platform_fee: platformFee,
        amount_creator_payout: creatorPayout,
        currency: "usd",
        status: "pending",
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    console.log(`[Payment] Payment Intent created: ${paymentIntent.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        transactionId: transaction.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[Payment] Error:", error);
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
