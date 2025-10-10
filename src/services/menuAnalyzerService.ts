import { supabase } from '@/integrations/supabase/client';

interface MenuDish {
  name: string;
  description?: string;
  price?: string;
  category: string;
}

interface AnalyzedDish extends MenuDish {
  health_score: number;
  approved: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  red_flags: string[];
  positives: string[];
  modifications: string[];
  better_alternatives: string[];
  reasoning: string;
}

// Red flag ingredients/cooking methods
const RED_FLAGS = [
  'fried', 'deep-fried', 'battered', 'breaded', 'crispy',
  'cream sauce', 'cheese sauce', 'alfredo', 'carbonara',
  'butter', 'mayo', 'mayonnaise',
  'soda', 'sugary', 'sweetened',
  'processed', 'bacon', 'sausage',
  'white bread', 'white rice',
  'extra cheese', 'loaded'
];

// Positive indicators
const POSITIVES = [
  'grilled', 'baked', 'roasted', 'steamed', 'broiled',
  'fresh', 'organic', 'whole grain', 'brown rice',
  'salad', 'vegetables', 'veggie',
  'lean', 'skinless', 'grilled chicken',
  'salmon', 'fish', 'seafood',
  'quinoa', 'avocado', 'nuts',
  'olive oil', 'vinaigrette'
];

// Modification suggestions database
const MODIFICATION_PATTERNS = [
  {
    trigger: ['fried', 'deep-fried'],
    suggestion: 'Ask for grilled instead of fried',
    calories_saved: 200,
    score_improvement: 20
  },
  {
    trigger: ['fries', 'french fries'],
    suggestion: 'Swap fries for side salad or steamed vegetables',
    calories_saved: 300,
    score_improvement: 30
  },
  {
    trigger: ['cream sauce', 'alfredo', 'cheese sauce'],
    suggestion: 'Request marinara or tomato-based sauce instead',
    calories_saved: 250,
    score_improvement: 25
  },
  {
    trigger: ['white bread', 'white bun'],
    suggestion: 'Ask for whole wheat bread',
    calories_saved: 50,
    score_improvement: 10
  },
  {
    trigger: ['mayo', 'mayonnaise'],
    suggestion: 'Hold the mayo or use mustard instead',
    calories_saved: 100,
    score_improvement: 15
  },
  {
    trigger: ['soda', 'soft drink'],
    suggestion: 'Choose water, unsweetened tea, or sparkling water',
    calories_saved: 150,
    score_improvement: 20
  },
  {
    trigger: ['extra cheese', 'loaded'],
    suggestion: 'Ask for light cheese or no cheese',
    calories_saved: 150,
    score_improvement: 15
  },
  {
    trigger: ['butter', 'buttered'],
    suggestion: 'Request no butter or light butter',
    calories_saved: 100,
    score_improvement: 10
  }
];

class MenuAnalyzerService {
  // Parse menu text from OCR
  parseMenuText(text: string): MenuDish[] {
    const dishes: MenuDish[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    let currentCategory = 'Entrees';
    const categories = ['appetizers', 'starters', 'entrees', 'mains', 'sides', 'desserts', 'beverages', 'drinks'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line is a category header
      const lowerLine = line.toLowerCase();
      if (categories.some(cat => lowerLine.includes(cat))) {
        currentCategory = line;
        continue;
      }
      
      // Check if line looks like a menu item (has letters and possibly price)
      if (line.length > 3 && /[a-zA-Z]/.test(line)) {
        const priceMatch = line.match(/\$\d+\.?\d*/);
        const price = priceMatch ? priceMatch[0] : undefined;
        
        const name = priceMatch 
          ? line.substring(0, line.indexOf(priceMatch[0])).trim()
          : line;
        
        // Get description (next line if it doesn't look like a dish name)
        let description = '';
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && !nextLine.match(/\$\d+/) && nextLine.length > 10) {
            description = nextLine;
            i++; // Skip the description line
          }
        }
        
        if (name.length > 2) {
          dishes.push({
            name,
            description,
            price,
            category: currentCategory
          });
        }
      }
    }
    
    return dishes;
  }

  // Analyze a single dish
  analyzeDish(dish: MenuDish, userGoal?: string): AnalyzedDish {
    const text = `${dish.name} ${dish.description || ''}`.toLowerCase();
    
    // Find red flags
    const redFlags: string[] = [];
    for (const flag of RED_FLAGS) {
      if (text.includes(flag)) {
        redFlags.push(this.formatRedFlag(flag));
      }
    }
    
    // Find positives
    const positives: string[] = [];
    for (const positive of POSITIVES) {
      if (text.includes(positive)) {
        positives.push(this.formatPositive(positive));
      }
    }
    
    // Calculate health score (0-100)
    let healthScore = 50; // Start at neutral
    healthScore -= redFlags.length * 8; // Each red flag -8 points
    healthScore += positives.length * 10; // Each positive +10 points
    healthScore = Math.max(0, Math.min(100, healthScore)); // Clamp 0-100
    
    // Determine if approved (score >= 70)
    const approved = healthScore >= 70;
    
    // Estimate macros (simplified - in production use ML model)
    const { calories, protein, carbs, fats } = this.estimateMacros(dish, text);
    
    // Find applicable modifications
    const modifications: string[] = [];
    for (const pattern of MODIFICATION_PATTERNS) {
      if (pattern.trigger.some(trigger => text.includes(trigger))) {
        modifications.push(pattern.suggestion);
      }
    }
    
    // Reasoning
    const reasoning = this.generateReasoning(redFlags, positives, healthScore, userGoal);
    
    return {
      ...dish,
      health_score: healthScore,
      approved,
      calories,
      protein,
      carbs,
      fats,
      red_flags: redFlags,
      positives,
      modifications,
      better_alternatives: [],
      reasoning
    };
  }

  // Estimate macros based on dish
  estimateMacros(dish: MenuDish, text: string): { calories: number; protein: number; carbs: number; fats: number } {
    let calories = 400; // Base estimate
    let protein = 20;
    let carbs = 40;
    let fats = 15;
    
    // Adjust based on category
    if (dish.category.toLowerCase().includes('appetizer')) {
      calories = 300;
      protein = 10;
      carbs = 30;
      fats = 12;
    } else if (dish.category.toLowerCase().includes('dessert')) {
      calories = 500;
      protein = 5;
      carbs = 70;
      fats = 20;
    }
    
    // Adjust based on keywords
    if (text.includes('fried') || text.includes('crispy')) {
      calories += 200;
      fats += 15;
    }
    if (text.includes('salad')) {
      calories -= 100;
      fats -= 5;
    }
    if (text.includes('chicken') || text.includes('fish')) {
      protein += 15;
    }
    if (text.includes('pasta') || text.includes('rice')) {
      carbs += 30;
    }
    if (text.includes('cream') || text.includes('cheese')) {
      calories += 150;
      fats += 12;
    }
    
    return { calories, protein, carbs, fats };
  }

  formatRedFlag(flag: string): string {
    const messages: { [key: string]: string } = {
      'fried': 'Deep fried - high in unhealthy fats',
      'cream sauce': 'Heavy cream sauce - high in saturated fat',
      'cheese sauce': 'Cheese-based sauce - high in calories',
      'white bread': 'Refined carbs - low nutritional value',
      'soda': 'Added sugars - empty calories',
      'mayo': 'High in calories and unhealthy fats'
    };
    return messages[flag] || `Contains ${flag}`;
  }

  formatPositive(positive: string): string {
    const messages: { [key: string]: string } = {
      'grilled': 'Grilled - healthier cooking method',
      'fresh': 'Fresh ingredients',
      'salad': 'Rich in vegetables and fiber',
      'salmon': 'High in omega-3 fatty acids',
      'whole grain': 'Complex carbs with fiber',
      'lean': 'Low in saturated fat'
    };
    return messages[positive] || `Contains ${positive}`;
  }

  generateReasoning(redFlags: string[], positives: string[], score: number, userGoal?: string): string {
    if (score >= 80) {
      return `Excellent choice! This dish is packed with nutritious ingredients${positives.length > 0 ? ` like ${positives[0].split('-')[0].trim()}` : ''} and aligns well with your ${userGoal || 'fitness'} goals.`;
    } else if (score >= 70) {
      return `Good option! While healthy overall, ${redFlags.length > 0 ? `watch out for ${redFlags[0].split('-')[0].trim().toLowerCase()}` : 'be mindful of portion sizes'}.`;
    } else if (score >= 50) {
      return `Moderate choice. ${redFlags.length > 0 ? `Contains ${redFlags.length} concern(s) including ${redFlags[0].split('-')[0].trim().toLowerCase()}` : 'Could be healthier'}. Consider modifications for better nutritional value.`;
    } else {
      return `Not recommended. This dish has ${redFlags.length} red flags including ${redFlags.slice(0, 2).map(f => f.split('-')[0].trim().toLowerCase()).join(' and ')}. Look for healthier alternatives on the menu.`;
    }
  }

  // Find better alternatives on same menu
  findBetterAlternatives(analyzedDishes: AnalyzedDish[], currentDish: AnalyzedDish): string[] {
    const alternatives: string[] = [];
    
    // Find dishes in same category with higher health score
    const sameCategory = analyzedDishes.filter(d => 
      d.category === currentDish.category && 
      d.health_score > currentDish.health_score &&
      d.name !== currentDish.name
    );
    
    // Sort by health score
    sameCategory.sort((a, b) => b.health_score - a.health_score);
    
    // Return top 3
    return sameCategory.slice(0, 3).map(d => 
      `${d.name} (Score: ${d.health_score}) - ${d.reasoning.split('.')[0]}`
    );
  }

  // Analyze entire menu
  async analyzeMenu(dishes: MenuDish[], userGoal?: string): Promise<AnalyzedDish[]> {
    const analyzed = dishes.map(dish => this.analyzeDish(dish, userGoal));
    
    // Add better alternatives to each dish
    for (const dish of analyzed) {
      dish.better_alternatives = this.findBetterAlternatives(analyzed, dish);
    }
    
    return analyzed;
  }

  // Save to database
  async saveMenuScan(
    restaurantName: string,
    analyzedItems: AnalyzedDish[],
    imageUrl?: string,
    ocrText?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('scanned_menus')
        .insert({
          user_id: user.id,
          restaurant_name: restaurantName,
          analyzed_items: analyzedItems,
          image_url: imageUrl,
          ocr_text: ocrText
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving menu scan:', error);
      return null;
    }
  }

  // Save order to history
  async saveOrderToHistory(
    restaurantName: string,
    item: AnalyzedDish,
    mealType: string,
    modifications?: string,
    notes?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('menu_scan_history')
        .insert({
          user_id: user.id,
          restaurant_name: restaurantName,
          item_ordered: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          health_score: item.health_score,
          approved: item.approved,
          modifications_made: modifications,
          date_ordered: new Date().toISOString().split('T')[0],
          meal_type: mealType,
          notes
        });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }
}

export const menuAnalyzer = new MenuAnalyzerService();
