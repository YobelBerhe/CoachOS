// Carbon footprint data (kg CO2 per kg of food)
export const CARBON_FOOTPRINT_DATA: { [key: string]: number } = {
  // Meat & Protein (highest impact)
  'beef': 27.0,
  'lamb': 39.2,
  'pork': 12.1,
  'chicken': 6.9,
  'turkey': 10.9,
  'fish': 5.1,
  'shrimp': 26.9,
  'eggs': 4.8,
  'tofu': 2.0,
  'beans': 2.0,
  'lentils': 0.9,
  
  // Dairy
  'milk': 3.2,
  'cheese': 13.5,
  'butter': 23.8,
  'yogurt': 2.2,
  'cream': 7.6,
  
  // Produce (lowest impact)
  'tomatoes': 1.4,
  'potatoes': 0.3,
  'lettuce': 1.3,
  'carrots': 0.4,
  'broccoli': 2.0,
  'apples': 0.4,
  'bananas': 0.7,
  'oranges': 0.4,
  'strawberries': 1.1,
  'avocados': 0.8,
  
  // Grains
  'rice': 2.7,
  'wheat': 1.4,
  'bread': 1.3,
  'pasta': 1.4,
  'oats': 2.5,
  
  // Processed
  'chocolate': 18.7,
  'coffee': 16.5,
  'wine': 1.8,
  'beer': 0.5,
  
  // Default for unknown items
  'default': 2.5
};

// Cost estimates per category (USD per kg)
export const COST_ESTIMATES: { [key: string]: number } = {
  'produce': 4.5,
  'meat': 12.0,
  'seafood': 18.0,
  'dairy': 6.0,
  'pantry': 5.0,
  'frozen': 7.0,
  'beverages': 3.0,
  'default': 5.0
};

// Typical shelf life in days
export const SHELF_LIFE: { [key: string]: number } = {
  // Produce
  'leafy_greens': 5,
  'tomatoes': 7,
  'potatoes': 30,
  'carrots': 21,
  'broccoli': 7,
  'apples': 30,
  'bananas': 7,
  'berries': 5,
  'avocados': 7,
  
  // Meat
  'raw_meat': 3,
  'cooked_meat': 4,
  'ground_meat': 2,
  'chicken': 2,
  'fish': 2,
  
  // Dairy
  'milk': 7,
  'yogurt': 14,
  'cheese': 21,
  'eggs': 28,
  
  // Pantry
  'bread': 7,
  'pasta': 730, // 2 years
  'rice': 730,
  'canned': 730,
  
  'default': 7
};

export function getCarbonFootprint(itemName: string, quantity: number = 1): number {
  const lowerName = itemName.toLowerCase();
  
  for (const [key, value] of Object.entries(CARBON_FOOTPRINT_DATA)) {
    if (lowerName.includes(key)) {
      return value * quantity;
    }
  }
  
  return CARBON_FOOTPRINT_DATA.default * quantity;
}

export function getEstimatedCost(category: string, quantity: number = 1): number {
  return (COST_ESTIMATES[category] || COST_ESTIMATES.default) * quantity;
}

export function getShelfLife(category: string, itemName: string): number {
  const lowerName = itemName.toLowerCase();
  
  for (const [key, value] of Object.entries(SHELF_LIFE)) {
    if (lowerName.includes(key.replace('_', ' '))) {
      return value;
    }
  }
  
  return SHELF_LIFE.default;
}

// Calculate trees equivalent
export function treesEquivalent(carbonKg: number): number {
  // Average tree absorbs ~21 kg CO2 per year
  return carbonKg / 21;
}

// Calculate miles driven equivalent
export function milesDrivenEquivalent(carbonKg: number): number {
  // Average car emits ~0.404 kg CO2 per mile
  return carbonKg / 0.404;
}
