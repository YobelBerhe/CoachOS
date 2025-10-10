import { ScannedProduct } from '@/types/barcode';

interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name: string;
    brands: string;
    image_url: string;
    serving_size?: string;
    nutriments: {
      energy_kcal_100g?: number;
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
      sodium_100g?: number;
      cholesterol_100g?: number;
      'saturated-fat_100g'?: number;
      'trans-fat_100g'?: number;
    };
    ingredients_text?: string;
    allergens?: string;
    additives_tags?: string[];
    nutrient_levels?: {
      fat?: string;
      salt?: string;
      'saturated-fat'?: string;
      sugars?: string;
    };
    nutrition_grade_fr?: string;
    nova_group?: number;
  };
  status: number;
  status_verbose: string;
}

// Bobby-style health analysis
function analyzeProduct(product: OpenFoodFactsProduct['product']): {
  approved: boolean;
  health_score: number;
  processing_level: 'minimal' | 'processed' | 'ultra-processed';
  warnings: string[];
  red_flags: string[];
  positives: string[];
} {
  const warnings: string[] = [];
  const red_flags: string[] = [];
  const positives: string[] = [];
  let score = 100;

  // NOVA group (processing level)
  const nova = product.nova_group || 1;
  let processing_level: 'minimal' | 'processed' | 'ultra-processed' = 'minimal';
  
  if (nova === 4) {
    processing_level = 'ultra-processed';
    score -= 30;
    warnings.push('Ultra-processed food');
  } else if (nova === 3) {
    processing_level = 'processed';
    score -= 15;
  } else {
    positives.push('Minimally processed');
  }

  // Check for harmful additives
  const harmfulAdditives = [
    'en:e102', // Tartrazine (artificial color)
    'en:e110', // Sunset Yellow (artificial color)
    'en:e621', // MSG
    'en:e951', // Aspartame
    'en:e950', // Acesulfame K
    'en:e955', // Sucralose
  ];

  if (product.additives_tags) {
    const foundHarmful = product.additives_tags.filter(tag => 
      harmfulAdditives.includes(tag)
    );
    
    if (foundHarmful.length > 0) {
      score -= foundHarmful.length * 10;
      foundHarmful.forEach(additive => {
        red_flags.push(`Contains ${additive.replace('en:', '').toUpperCase()} (artificial additive)`);
      });
    }
  }

  // Check ingredients for seed oils
  const seedOils = ['soybean oil', 'canola oil', 'sunflower oil', 'corn oil', 'vegetable oil'];
  const ingredients = product.ingredients_text?.toLowerCase() || '';
  
  seedOils.forEach(oil => {
    if (ingredients.includes(oil)) {
      score -= 15;
      red_flags.push(`Contains ${oil} (inflammatory seed oil)`);
    }
  });

  // Sugar analysis
  const sugar = product.nutriments.sugars_100g || 0;
  if (sugar > 15) {
    score -= 20;
    warnings.push(`High sugar content (${sugar.toFixed(1)}g per 100g)`);
  } else if (sugar < 5) {
    positives.push('Low sugar content');
  }

  // Protein check
  const protein = product.nutriments.proteins_100g || 0;
  if (protein > 15) {
    positives.push(`High protein (${protein.toFixed(1)}g per 100g)`);
    score += 5;
  }

  // Fiber check
  const fiber = product.nutriments.fiber_100g || 0;
  if (fiber > 5) {
    positives.push(`Good fiber content (${fiber.toFixed(1)}g per 100g)`);
    score += 5;
  }

  // Sodium check
  const sodium = product.nutriments.sodium_100g || 0;
  if (sodium > 1) { // >1g per 100g is high
    warnings.push(`High sodium (${(sodium * 1000).toFixed(0)}mg per 100g)`);
    score -= 10;
  }

  // Trans fat check
  const transFat = product.nutriments['trans-fat_100g'] || 0;
  if (transFat > 0) {
    red_flags.push('Contains trans fats');
    score -= 20;
  } else {
    positives.push('No trans fats');
  }

  // Nutri-Score bonus/penalty
  if (product.nutrition_grade_fr === 'a') {
    score += 10;
    positives.push('Excellent Nutri-Score (A)');
  } else if (product.nutrition_grade_fr === 'e') {
    score -= 15;
    warnings.push('Poor Nutri-Score (E)');
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  // Approval logic
  const approved = score >= 70 && processing_level !== 'ultra-processed' && red_flags.length === 0;

  return {
    approved,
    health_score: Math.round(score),
    processing_level,
    warnings,
    red_flags,
    positives
  };
}

// Extract ingredients and identify harmful ones
function extractIngredients(product: OpenFoodFactsProduct['product']): {
  ingredients: string[];
  harmful_ingredients: string[];
} {
  const ingredientsText = product.ingredients_text || '';
  const ingredients = ingredientsText
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);

  const harmfulKeywords = [
    'artificial',
    'high fructose corn syrup',
    'corn syrup',
    'maltodextrin',
    'msg',
    'monosodium glutamate',
    'aspartame',
    'sucralose',
    'saccharin',
    'acesulfame',
    'soybean oil',
    'canola oil',
    'vegetable oil',
    'partially hydrogenated',
    'hydrogenated',
    'trans fat'
  ];

  const harmful_ingredients = ingredients.filter(ingredient => {
    const lower = ingredient.toLowerCase();
    return harmfulKeywords.some(keyword => lower.includes(keyword));
  });

  return { ingredients, harmful_ingredients };
}

export async function fetchProductByBarcode(barcode: string): Promise<ScannedProduct | null> {
  // Check cache first
  const { barcodeCache } = await import('./barcodeCache');
  const cached = await barcodeCache.get(barcode);
  if (cached) {
    console.log('🚀 Using cached data for:', barcode);
    return cached;
  }

  try {
    console.log('🌐 Fetching from Open Food Facts:', barcode);
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data: OpenFoodFactsProduct = await response.json();

    if (data.status !== 1) {
      return null;
    }

    const product = data.product;

    // Get nutrition per serving (assuming 100g serving if not specified)
    const servingSize = product.serving_size || '100g';
    const calories = product.nutriments['energy-kcal_100g'] || product.nutriments.energy_kcal_100g || 0;

    // Extract ingredients
    const { ingredients, harmful_ingredients } = extractIngredients(product);

    // Perform health analysis
    const health_analysis = analyzeProduct(product);

    // Extract allergens
    const allergens = product.allergens
      ? product.allergens.split(',').map(a => a.trim())
      : [];

    const scannedProduct: ScannedProduct = {
      barcode: data.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      image: product.image_url || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=400&fit=crop',
      serving_size: servingSize,
      servings_per_container: 1,
      nutrition: {
        calories: Math.round(calories),
        protein: Math.round(product.nutriments.proteins_100g || 0),
        carbs: Math.round(product.nutriments.carbohydrates_100g || 0),
        fats: Math.round(product.nutriments.fat_100g || 0),
        fiber: Math.round(product.nutriments.fiber_100g || 0),
        sugar: Math.round(product.nutriments.sugars_100g || 0),
        sodium: Math.round((product.nutriments.sodium_100g || 0) * 1000), // Convert to mg
        cholesterol: Math.round((product.nutriments.cholesterol_100g || 0) * 1000),
        saturated_fat: Math.round(product.nutriments['saturated-fat_100g'] || 0),
        trans_fat: Math.round(product.nutriments['trans-fat_100g'] || 0)
      },
      health_analysis,
      ingredients,
      harmful_ingredients,
      allergens,
      alternatives: []
    };

    // Cache the result
    const { barcodeCache } = await import('./barcodeCache');
    await barcodeCache.set(barcode, scannedProduct);

    return scannedProduct;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Search products by name (useful for manual search)
export async function searchProducts(query: string, page: number = 1): Promise<ScannedProduct[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=20&json=1`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    const products = await Promise.all(
      data.products.map(async (p: any) => {
        return fetchProductByBarcode(p.code);
      })
    );

    return products.filter((p): p is ScannedProduct => p !== null);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
