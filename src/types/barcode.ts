export interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  serving_size: string;
  servings_per_container: number;
  
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    saturated_fat: number;
    trans_fat: number;
  };
  
  health_analysis: {
    approved: boolean;
    health_score: number;
    processing_level: 'minimal' | 'processed' | 'ultra-processed';
    warnings: string[];
    red_flags: string[];
    positives: string[];
  };
  
  ingredients: string[];
  harmful_ingredients: string[];
  allergens: string[];
  
  alternatives?: Array<{
    name: string;
    brand: string;
    image: string;
    health_score: number;
    price_diff: string;
  }>;
}

export interface ScanHistory {
  id: string;
  product: ScannedProduct;
  scanned_at: string;
  added_to_diary: boolean;
}
