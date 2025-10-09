import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job } = await req.json();
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`[Recommendation Jobs] Running job: ${job}`);

    switch (job) {
      case "calculate_trending_scores": {
        const { data: recipes } = await supabase
          .from("recipes")
          .select("id")
          .eq("status", "published");

        if (!recipes) {
          throw new Error("No recipes found");
        }

        for (const recipe of recipes) {
          await supabase.rpc("calculate_trending_score", {
            p_recipe_id: recipe.id,
          });
        }

        console.log(`[Trending] Calculated scores for ${recipes.length} recipes`);
        break;
      }

      case "calculate_recipe_similarities": {
        const { data: recipes } = await supabase
          .from("recipes")
          .select("id")
          .eq("status", "published")
          .limit(100);

        if (!recipes) {
          throw new Error("No recipes found");
        }

        for (let i = 0; i < recipes.length; i++) {
          for (let j = i + 1; j < recipes.length; j++) {
            const { data: similarity } = await supabase.rpc("calculate_recipe_similarity", {
              p_recipe_id: recipes[i].id,
              p_compare_recipe_id: recipes[j].id,
            });

            if (similarity && similarity > 30) {
              await supabase.from("recipe_similarities").upsert(
                {
                  recipe_id: recipes[i].id,
                  similar_recipe_id: recipes[j].id,
                  similarity_score: similarity,
                },
                { onConflict: "recipe_id,similar_recipe_id" }
              );
            }
          }
        }

        console.log(`[Similarity] Processed ${recipes.length} recipes`);
        break;
      }

      case "cleanup_old_recommendations": {
        const { error } = await supabase
          .from("personalized_recommendations")
          .delete()
          .lt("expires_at", new Date().toISOString());

        if (error) throw error;

        console.log("[Cleanup] Removed expired recommendation caches");
        break;
      }

      default:
        throw new Error(`Unknown job: ${job}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        job,
        message: "Job completed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Recommendation Jobs] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});