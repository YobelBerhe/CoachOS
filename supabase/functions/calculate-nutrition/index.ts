import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

interface NutritionData {
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  saturated_fat_g: number;
  trans_fat_g: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  calcium_mg: number;
  iron_mg: number;
  potassium_mg: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipe_id } = await req.json();

    if (!recipe_id) {
      throw new Error("recipe_id is required");
    }

    console.log(`[Nutrition Calculator] Processing recipe: ${recipe_id}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch recipe data
    const { data: recipe, error: fetchError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipe_id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch recipe: ${fetchError.message}`);
    }

    console.log(`[Nutrition Calculator] Found recipe: ${recipe.name}`);
    console.log(`[Nutrition Calculator] Servings: ${recipe.servings}`);
    console.log(`[Nutrition Calculator] Ingredients count: ${recipe.ingredients.length}`);

    // Calculate nutrition using Lovable AI
    const nutrition = await calculateNutritionWithAI(
      recipe.ingredients,
      recipe.servings,
      recipe.name
    );

    console.log(`[Nutrition Calculator] Calculated nutrition:`, nutrition);

    // Auto-categorize for goal-based filtering
    const goalFlags = categorizeRecipeForGoals(nutrition, recipe.tags || []);

    // Update recipe with nutrition data
    const { error: updateError } = await supabase
      .from("recipes")
      .update({
        calories_per_serving: nutrition.calories_per_serving,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fats_g: nutrition.fats_g,
        fiber_g: nutrition.fiber_g,
        sugar_g: nutrition.sugar_g,
        sodium_mg: nutrition.sodium_mg,
        nutrition_breakdown: {
          cholesterol_mg: nutrition.cholesterol_mg,
          saturated_fat_g: nutrition.saturated_fat_g,
          trans_fat_g: nutrition.trans_fat_g,
          vitamin_a_mcg: nutrition.vitamin_a_mcg,
          vitamin_c_mg: nutrition.vitamin_c_mg,
          calcium_mg: nutrition.calcium_mg,
          iron_mg: nutrition.iron_mg,
          potassium_mg: nutrition.potassium_mg,
        },
        ...goalFlags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipe_id);

    if (updateError) {
      throw new Error(`Failed to update recipe: ${updateError.message}`);
    }

    console.log(`[Nutrition Calculator] Successfully updated recipe ${recipe_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        recipe_id,
        nutrition,
        message: "Nutrition calculated and saved successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Nutrition Calculator] Error:", error);

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

/**
 * Calculate nutrition using Lovable AI (Gemini 2.5 Flash)
 */
async function calculateNutritionWithAI(
  ingredients: Ingredient[],
  servings: number,
  recipeName: string
): Promise<NutritionData> {
  if (!LOVABLE_API_KEY) {
    console.warn("[Nutrition Calculator] Lovable AI not configured, using fallback");
    return generateFallbackNutrition(ingredients, servings);
  }

  try {
    const ingredientsList = ingredients
      .map((ing) => `${ing.amount} ${ing.unit} ${ing.item}`)
      .join("\n");

    const prompt = `You are a professional nutritionist. Calculate the detailed nutrition facts for this recipe.

Recipe: ${recipeName}
Servings: ${servings}

Ingredients:
${ingredientsList}

Return ONLY a JSON object with these exact fields (all numbers, no strings):
{
  "calories_per_serving": number,
  "protein_g": number,
  "carbs_g": number,
  "fats_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "cholesterol_mg": number,
  "saturated_fat_g": number,
  "trans_fat_g": number,
  "vitamin_a_mcg": number,
  "vitamin_c_mg": number,
  "calcium_mg": number,
  "iron_mg": number,
  "potassium_mg": number
}

Calculate nutrition PER SERVING. Use USDA database values. Be accurate.`;

    console.log("[Nutrition Calculator] Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition calculation expert. Always return valid JSON with accurate nutritional data based on USDA standards.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[Nutrition Calculator] Lovable AI error:", response.status, errorData);
      
      // Handle rate limits
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    console.log("[Nutrition Calculator] Lovable AI raw response:", content);

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const nutrition = JSON.parse(jsonMatch[0]);

    // Validate nutrition data
    validateNutritionData(nutrition);

    return nutrition;
  } catch (error: any) {
    console.error("[Nutrition Calculator] AI calculation failed:", error);
    console.log("[Nutrition Calculator] Falling back to estimation");
    return generateFallbackNutrition(ingredients, servings);
  }
}

/**
 * Validate nutrition data structure
 */
function validateNutritionData(nutrition: any): void {
  const requiredFields = [
    "calories_per_serving",
    "protein_g",
    "carbs_g",
    "fats_g",
    "fiber_g",
    "sugar_g",
    "sodium_mg",
  ];

  for (const field of requiredFields) {
    if (typeof nutrition[field] !== "number" || isNaN(nutrition[field])) {
      throw new Error(`Invalid or missing field: ${field}`);
    }
  }

  // Sanity checks
  if (nutrition.calories_per_serving < 0 || nutrition.calories_per_serving > 5000) {
    throw new Error(`Unrealistic calorie value: ${nutrition.calories_per_serving}`);
  }

  if (nutrition.protein_g < 0 || nutrition.protein_g > 300) {
    throw new Error(`Unrealistic protein value: ${nutrition.protein_g}`);
  }
}

/**
 * Fallback nutrition estimation when AI is unavailable
 */
function generateFallbackNutrition(
  ingredients: Ingredient[],
  servings: number
): NutritionData {
  console.log("[Nutrition Calculator] Using fallback estimation");

  // Simple estimation based on ingredient keywords
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const ingredient of ingredients) {
    const item = ingredient.item.toLowerCase();
    const amount = parseFloat(ingredient.amount) || 1;

    // Basic estimation (very simplified)
    if (item.includes("chicken") || item.includes("beef") || item.includes("pork")) {
      totalCalories += 200 * amount;
      totalProtein += 25 * amount;
      totalFats += 10 * amount;
    } else if (item.includes("fish") || item.includes("salmon")) {
      totalCalories += 180 * amount;
      totalProtein += 22 * amount;
      totalFats += 8 * amount;
    } else if (item.includes("egg")) {
      totalCalories += 70 * amount;
      totalProtein += 6 * amount;
      totalFats += 5 * amount;
    } else if (item.includes("rice") || item.includes("pasta")) {
      totalCalories += 130 * amount;
      totalCarbs += 28 * amount;
      totalProtein += 3 * amount;
    } else if (item.includes("potato")) {
      totalCalories += 110 * amount;
      totalCarbs += 26 * amount;
      totalProtein += 2 * amount;
    } else if (item.includes("bread")) {
      totalCalories += 80 * amount;
      totalCarbs += 15 * amount;
      totalProtein += 3 * amount;
    } else if (item.includes("oil") || item.includes("butter")) {
      totalCalories += 120 * amount;
      totalFats += 14 * amount;
    } else if (item.includes("cheese")) {
      totalCalories += 100 * amount;
      totalProtein += 7 * amount;
      totalFats += 8 * amount;
    } else if (
      item.includes("vegetable") ||
      item.includes("lettuce") ||
      item.includes("spinach")
    ) {
      totalCalories += 25 * amount;
      totalCarbs += 5 * amount;
    } else {
      // Generic ingredient
      totalCalories += 50 * amount;
      totalCarbs += 10 * amount;
    }
  }

  // Calculate per serving
  const caloriesPerServing = Math.round(totalCalories / servings);
  const proteinPerServing = Math.round((totalProtein / servings) * 10) / 10;
  const carbsPerServing = Math.round((totalCarbs / servings) * 10) / 10;
  const fatsPerServing = Math.round((totalFats / servings) * 10) / 10;

  return {
    calories_per_serving: caloriesPerServing,
    protein_g: proteinPerServing,
    carbs_g: carbsPerServing,
    fats_g: fatsPerServing,
    fiber_g: Math.round(carbsPerServing * 0.15 * 10) / 10,
    sugar_g: Math.round(carbsPerServing * 0.2 * 10) / 10,
    sodium_mg: Math.round(caloriesPerServing * 0.8),
    cholesterol_mg: Math.round(proteinPerServing * 2),
    saturated_fat_g: Math.round(fatsPerServing * 0.3 * 10) / 10,
    trans_fat_g: 0,
    vitamin_a_mcg: 50,
    vitamin_c_mg: 5,
    calcium_mg: 50,
    iron_mg: 2,
    potassium_mg: 200,
  };
}

/**
 * Categorize recipe for goal-based filtering
 */
function categorizeRecipeForGoals(
  nutrition: NutritionData,
  tags: string[]
): Record<string, boolean> {
  const flags: Record<string, boolean> = {
    good_for_weight_loss: false,
    good_for_muscle_gain: false,
    good_for_heart_health: false,
    good_for_energy: false,
    good_for_late_night: false,
    good_for_fasting: false,
  };

  // Weight Loss: Low cal, high protein, low carb
  if (
    nutrition.calories_per_serving < 500 &&
    nutrition.protein_g > 20 &&
    nutrition.carbs_g < 40
  ) {
    flags.good_for_weight_loss = true;
  }

  // Muscle Gain: High protein, high calories
  if (nutrition.protein_g > 30 && nutrition.calories_per_serving > 400) {
    flags.good_for_muscle_gain = true;
  }

  // Heart Health: Low sodium, low saturated fat
  if (nutrition.sodium_mg < 500 && nutrition.saturated_fat_g < 5) {
    flags.good_for_heart_health = true;
  }

  // Energy: Balanced carbs and protein
  if (
    nutrition.carbs_g > 30 &&
    nutrition.carbs_g < 60 &&
    nutrition.protein_g > 15
  ) {
    flags.good_for_energy = true;
  }

  // Late Night: Light, low calorie
  if (nutrition.calories_per_serving < 300 && nutrition.fats_g < 10) {
    flags.good_for_late_night = true;
  }

  // Fasting-friendly: High protein, low carb
  if (nutrition.protein_g > 25 && nutrition.carbs_g < 30) {
    flags.good_for_fasting = true;
  }

  // Check tags for additional context
  const tagLower = tags.map((t) => t.toLowerCase());
  if (tagLower.includes("low carb") || tagLower.includes("keto")) {
    flags.good_for_weight_loss = true;
    flags.good_for_fasting = true;
  }

  if (tagLower.includes("high protein") || tagLower.includes("post-workout")) {
    flags.good_for_muscle_gain = true;
  }

  if (
    tagLower.includes("heart healthy") ||
    tagLower.includes("mediterranean")
  ) {
    flags.good_for_heart_health = true;
  }

  return flags;
}
