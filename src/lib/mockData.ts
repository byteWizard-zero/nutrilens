/**
 * Mock Data — Realistic meal data, AI responses, and weekly trends
 * 
 * Covers Indian, Western, and mixed cuisines with full nutritional data.
 * Used until real backend/AI integration is connected.
 */

import { FoodItem, MealEntry, MealType, NutritionData, generateId } from './nutrition';
import { getLocalDateString } from './dateUtils';

// ──────────────────────────────────────────────
// Food Item Templates
// ──────────────────────────────────────────────

const FOOD_DATABASE: Record<string, Omit<FoodItem, 'id' | 'portionMultiplier'>> = {
  // Indian
  dal_tadka: {
    name: 'Dal Tadka',
    quantity: 1,
    unit: 'bowl (200g)',
    confidence: 0.92,
    nutrition: { calories: 198, protein: 12, carbs: 28, fat: 5, fiber: 6, sugar: 3, sodium: 420, potassium: 380, calcium: 45, iron: 3.2 },
  },
  jeera_rice: {
    name: 'Jeera Rice',
    quantity: 1,
    unit: 'serving (180g)',
    confidence: 0.95,
    nutrition: { calories: 245, protein: 5, carbs: 48, fat: 4, fiber: 1, sugar: 0.5, sodium: 280, potassium: 65, calcium: 15, iron: 1.1 },
  },
  roti: {
    name: 'Whole Wheat Roti',
    quantity: 2,
    unit: 'pieces',
    confidence: 0.97,
    nutrition: { calories: 170, protein: 6, carbs: 32, fat: 3.5, fiber: 4, sugar: 1, sodium: 210, potassium: 110, calcium: 20, iron: 2.0 },
  },
  paneer_butter_masala: {
    name: 'Paneer Butter Masala',
    quantity: 1,
    unit: 'bowl (200g)',
    confidence: 0.89,
    nutrition: { calories: 380, protein: 16, carbs: 15, fat: 28, fiber: 2, sugar: 5, sodium: 650, potassium: 220, calcium: 280, iron: 1.8 },
  },
  chicken_biryani: {
    name: 'Chicken Biryani',
    quantity: 1,
    unit: 'plate (350g)',
    confidence: 0.91,
    nutrition: { calories: 490, protein: 28, carbs: 55, fat: 16, fiber: 2, sugar: 3, sodium: 780, potassium: 340, calcium: 55, iron: 3.5 },
  },
  masala_dosa: {
    name: 'Masala Dosa',
    quantity: 1,
    unit: 'piece',
    confidence: 0.94,
    nutrition: { calories: 320, protein: 8, carbs: 42, fat: 14, fiber: 3, sugar: 4, sodium: 520, potassium: 290, calcium: 35, iron: 2.4 },
  },
  idli_sambar: {
    name: 'Idli with Sambar',
    quantity: 3,
    unit: 'pieces + bowl',
    confidence: 0.93,
    nutrition: { calories: 230, protein: 10, carbs: 40, fat: 3, fiber: 4, sugar: 5, sodium: 480, potassium: 310, calcium: 40, iron: 2.8 },
  },
  chole_bhature: {
    name: 'Chole Bhature',
    quantity: 1,
    unit: 'plate',
    confidence: 0.88,
    nutrition: { calories: 520, protein: 15, carbs: 58, fat: 24, fiber: 8, sugar: 6, sodium: 890, potassium: 420, calcium: 80, iron: 4.5 },
  },
  raita: {
    name: 'Cucumber Raita',
    quantity: 1,
    unit: 'bowl (100g)',
    confidence: 0.91,
    nutrition: { calories: 65, protein: 3, carbs: 5, fat: 3.5, fiber: 0.5, sugar: 4, sodium: 180, potassium: 150, calcium: 120, iron: 0.3 },
  },

  // Western
  grilled_chicken_salad: {
    name: 'Grilled Chicken Salad',
    quantity: 1,
    unit: 'bowl (300g)',
    confidence: 0.93,
    nutrition: { calories: 320, protein: 35, carbs: 12, fat: 15, fiber: 4, sugar: 5, sodium: 480, potassium: 520, calcium: 60, iron: 1.8 },
  },
  avocado_toast: {
    name: 'Avocado Toast',
    quantity: 2,
    unit: 'slices',
    confidence: 0.96,
    nutrition: { calories: 290, protein: 8, carbs: 28, fat: 18, fiber: 7, sugar: 2, sodium: 320, potassium: 480, calcium: 30, iron: 1.5 },
  },
  pasta_marinara: {
    name: 'Pasta Marinara',
    quantity: 1,
    unit: 'plate (280g)',
    confidence: 0.90,
    nutrition: { calories: 420, protein: 14, carbs: 62, fat: 12, fiber: 4, sugar: 8, sodium: 680, potassium: 350, calcium: 45, iron: 2.8 },
  },
  greek_yogurt_bowl: {
    name: 'Greek Yogurt Bowl',
    quantity: 1,
    unit: 'bowl (200g)',
    confidence: 0.94,
    nutrition: { calories: 180, protein: 18, carbs: 15, fat: 6, fiber: 2, sugar: 12, sodium: 80, potassium: 280, calcium: 200, iron: 0.5 },
  },
  scrambled_eggs: {
    name: 'Scrambled Eggs',
    quantity: 2,
    unit: 'eggs',
    confidence: 0.97,
    nutrition: { calories: 182, protein: 12, carbs: 2, fat: 14, fiber: 0, sugar: 1, sodium: 340, potassium: 160, calcium: 55, iron: 1.8 },
  },
  protein_shake: {
    name: 'Whey Protein Shake',
    quantity: 1,
    unit: 'scoop (300ml)',
    confidence: 0.96,
    nutrition: { calories: 150, protein: 25, carbs: 8, fat: 2, fiber: 1, sugar: 3, sodium: 120, potassium: 200, calcium: 150, iron: 0.8 },
  },
  burger: {
    name: 'Chicken Burger',
    quantity: 1,
    unit: 'piece',
    confidence: 0.92,
    nutrition: { calories: 450, protein: 25, carbs: 38, fat: 22, fiber: 2, sugar: 6, sodium: 820, potassium: 310, calcium: 80, iron: 2.5 },
  },

  // Snacks & Beverages
  banana: {
    name: 'Banana',
    quantity: 1,
    unit: 'medium',
    confidence: 0.98,
    nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1, potassium: 422, calcium: 6, iron: 0.3 },
  },
  apple: {
    name: 'Apple',
    quantity: 1,
    unit: 'medium',
    confidence: 0.97,
    nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2, potassium: 195, calcium: 11, iron: 0.2 },
  },
  mixed_nuts: {
    name: 'Mixed Nuts',
    quantity: 1,
    unit: 'handful (30g)',
    confidence: 0.90,
    nutrition: { calories: 175, protein: 5, carbs: 8, fat: 15, fiber: 2, sugar: 1, sodium: 3, potassium: 200, calcium: 30, iron: 1.2 },
  },
  chai: {
    name: 'Masala Chai',
    quantity: 1,
    unit: 'cup (200ml)',
    confidence: 0.95,
    nutrition: { calories: 85, protein: 3, carbs: 12, fat: 3, fiber: 0, sugar: 10, sodium: 45, potassium: 120, calcium: 95, iron: 0.5 },
  },
  coffee: {
    name: 'Black Coffee',
    quantity: 1,
    unit: 'cup (240ml)',
    confidence: 0.98,
    nutrition: { calories: 5, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 5, potassium: 116, calcium: 5, iron: 0.1 },
  },
};

/**
 * Create a FoodItem from a template key
 */
function createFoodItem(key: string, overrides?: Partial<FoodItem>): FoodItem {
  const template = FOOD_DATABASE[key];
  if (!template) throw new Error(`Unknown food: ${key}`);
  return {
    id: generateId(),
    portionMultiplier: 1,
    ...template,
    ...overrides,
  };
}

/**
 * Calculate total nutrition from items
 */
function calcTotal(items: FoodItem[]): NutritionData {
  return items.reduce<NutritionData>(
    (total, item) => {
      const m = item.portionMultiplier;
      return {
        calories: total.calories + Math.round(item.nutrition.calories * m),
        protein: Math.round((total.protein + item.nutrition.protein * m) * 10) / 10,
        carbs: Math.round((total.carbs + item.nutrition.carbs * m) * 10) / 10,
        fat: Math.round((total.fat + item.nutrition.fat * m) * 10) / 10,
        fiber: Math.round((total.fiber + item.nutrition.fiber * m) * 10) / 10,
        sugar: Math.round((total.sugar + item.nutrition.sugar * m) * 10) / 10,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
}

// ──────────────────────────────────────────────
// Pre-built Meal Templates
// ──────────────────────────────────────────────

function createMeal(
  mealType: MealType,
  foodKeys: string[],
  date: string,
  timeOffset: string
): MealEntry {
  const items = foodKeys.map(key => createFoodItem(key));
  return {
    id: generateId(),
    mealType,
    items,
    totalNutrition: calcTotal(items),
    loggedAt: `${date}T${timeOffset}`,
    date,
  };
}

/**
 * Generate 7 days of meal history
 */
export function generateMealHistory(): Record<string, MealEntry[]> {
  const history: Record<string, MealEntry[]> = {};
  const today = new Date();

  const dailyMealPlans: Array<Array<{ type: MealType; foods: string[]; time: string }>> = [
    // Day 0 (today)
    [
      { type: 'breakfast', foods: ['idli_sambar', 'chai'], time: '08:15:00' },
      { type: 'lunch', foods: ['dal_tadka', 'jeera_rice', 'raita'], time: '13:00:00' },
      { type: 'snack', foods: ['banana', 'coffee'], time: '16:30:00' },
    ],
    // Day 1 (yesterday)
    [
      { type: 'breakfast', foods: ['avocado_toast', 'scrambled_eggs', 'coffee'], time: '07:45:00' },
      { type: 'lunch', foods: ['chicken_biryani', 'raita'], time: '12:30:00' },
      { type: 'snack', foods: ['protein_shake'], time: '16:00:00' },
      { type: 'dinner', foods: ['grilled_chicken_salad'], time: '20:00:00' },
    ],
    // Day 2
    [
      { type: 'breakfast', foods: ['masala_dosa', 'chai'], time: '08:30:00' },
      { type: 'lunch', foods: ['paneer_butter_masala', 'roti'], time: '13:15:00' },
      { type: 'dinner', foods: ['pasta_marinara'], time: '19:45:00' },
      { type: 'snack', foods: ['mixed_nuts', 'apple'], time: '17:00:00' },
    ],
    // Day 3
    [
      { type: 'breakfast', foods: ['greek_yogurt_bowl', 'banana'], time: '07:30:00' },
      { type: 'lunch', foods: ['chole_bhature'], time: '12:45:00' },
      { type: 'snack', foods: ['chai', 'mixed_nuts'], time: '16:15:00' },
      { type: 'dinner', foods: ['dal_tadka', 'roti'], time: '20:30:00' },
    ],
    // Day 4
    [
      { type: 'breakfast', foods: ['scrambled_eggs', 'avocado_toast'], time: '08:00:00' },
      { type: 'lunch', foods: ['grilled_chicken_salad'], time: '13:00:00' },
      { type: 'dinner', foods: ['chicken_biryani'], time: '19:30:00' },
    ],
    // Day 5
    [
      { type: 'breakfast', foods: ['idli_sambar', 'coffee'], time: '07:45:00' },
      { type: 'lunch', foods: ['paneer_butter_masala', 'jeera_rice'], time: '12:30:00' },
      { type: 'snack', foods: ['protein_shake', 'banana'], time: '16:00:00' },
      { type: 'dinner', foods: ['burger'], time: '20:15:00' },
    ],
    // Day 6
    [
      { type: 'breakfast', foods: ['masala_dosa', 'chai'], time: '09:00:00' },
      { type: 'lunch', foods: ['dal_tadka', 'roti', 'raita'], time: '13:30:00' },
      { type: 'dinner', foods: ['pasta_marinara'], time: '19:00:00' },
    ],
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getLocalDateString(date);

    const plan = dailyMealPlans[i % dailyMealPlans.length];
    history[dateStr] = plan.map(m => createMeal(m.type, m.foods, dateStr, m.time));
  }

  return history;
}

// ──────────────────────────────────────────────
// Mock AI Analysis Responses
// ──────────────────────────────────────────────

export interface MockAnalysisResult {
  items: FoodItem[];
  totalNutrition: NutritionData;
  overallConfidence: number;
  suggestions: string[];
}

const MOCK_ANALYSES: MockAnalysisResult[] = [
  {
    items: [
      createFoodItem('dal_tadka'),
      createFoodItem('jeera_rice'),
      createFoodItem('roti', { quantity: 1, unit: 'piece' }),
    ],
    totalNutrition: { calories: 528, protein: 20.5, carbs: 104, fat: 10, fiber: 9.5, sugar: 3.5 },
    overallConfidence: 0.91,
    suggestions: [
      'Great protein from dal! Consider adding a side of yogurt for calcium.',
      'This meal is carb-heavy — pair with a protein-rich snack later.',
    ],
  },
  {
    items: [
      createFoodItem('grilled_chicken_salad'),
      createFoodItem('avocado_toast', { quantity: 1, unit: 'slice' }),
    ],
    totalNutrition: { calories: 465, protein: 39, carbs: 26, fat: 24, fiber: 8.5, sugar: 6 },
    overallConfidence: 0.93,
    suggestions: [
      'Excellent protein-to-calorie ratio! Great for muscle recovery.',
      'Good fiber content from avocado and salad greens.',
    ],
  },
  {
    items: [
      createFoodItem('chicken_biryani'),
      createFoodItem('raita'),
    ],
    totalNutrition: { calories: 555, protein: 31, carbs: 60, fat: 19.5, fiber: 2.5, sugar: 7 },
    overallConfidence: 0.90,
    suggestions: [
      'Biryani is calorie-dense — consider a lighter dinner if this is lunch.',
      'Raita adds probiotics — great for digestion!',
    ],
  },
  {
    items: [
      createFoodItem('masala_dosa'),
      createFoodItem('chai'),
    ],
    totalNutrition: { calories: 405, protein: 11, carbs: 54, fat: 17, fiber: 3, sugar: 14 },
    overallConfidence: 0.94,
    suggestions: [
      'Try adding a protein source like eggs or paneer to balance this meal.',
      'Masala dosa provides good carbs for morning energy.',
    ],
  },
];

/**
 * Get a random mock analysis result
 */
export function getRandomAnalysis(): MockAnalysisResult {
  return MOCK_ANALYSES[Math.floor(Math.random() * MOCK_ANALYSES.length)];
}

// ──────────────────────────────────────────────
// Mock AI Chat Responses
// ──────────────────────────────────────────────



const CHAT_RESPONSES: Record<string, string[]> = {
  default: [
    "Based on your meals today, you're doing well with your protein intake! You've hit about 70% of your daily protein target. Consider adding a protein-rich snack like Greek yogurt or a handful of almonds to close the gap.",
    "Looking at your nutrition today, I notice your fiber intake is a bit low. Try adding some vegetables to your next meal — a simple cucumber salad or some steamed broccoli would boost your fiber by 4-5g.",
    "Great job logging consistently! Your 5-day streak shows real commitment. Keep it up! 🔥 Here's a tip: try to eat your largest meal earlier in the day when your metabolism is most active.",
  ],
  protein: [
    "You're currently at {protein}g of protein today, which is {proteinPct}% of your {proteinTarget}g target. To close the gap, consider:\n\n• Greek yogurt (18g protein per serving)\n• A handful of almonds (6g protein)\n• Whey protein shake (25g protein)\n\nRemember, spreading protein across meals helps with absorption! 💪",
  ],
  healthy: [
    "Let me analyze your lunch! 🔍\n\nYour meal had a good balance of macros:\n• **Protein**: Good — {protein}g helps with satiety\n• **Carbs**: {carbs}g — provides sustained energy\n• **Fat**: {fat}g — within healthy range\n\nOverall rating: ⭐⭐⭐⭐ (4/5)\n\nTo make it a 5/5, add a serving of green vegetables for extra fiber and micronutrients!",
  ],
  snack: [
    "Based on your remaining calories ({remaining} kcal) and macro gaps, here are my top snack suggestions:\n\n🥜 **Mixed Nuts** (175 kcal) — Good fats + protein\n🍌 **Banana + Peanut Butter** (200 kcal) — Quick energy + protein\n🥛 **Protein Shake** (150 kcal) — Pure protein boost\n🥒 **Hummus with Veggies** (120 kcal) — Fiber + healthy fats\n\nMy pick? The protein shake, since you're a bit short on protein today!",
  ],
  greeting: [
    "Hello! 👋 I'm your AI nutritionist. I can see you've logged {mealCount} meals today totaling {calories} kcal. You have {remaining} kcal remaining for your daily goal.\n\nFeel free to ask me anything about your nutrition! I can:\n• Analyze if your meals are balanced\n• Suggest snacks based on your macro gaps\n• Give tips for meeting your {goal} goal\n\nWhat would you like to know?",
  ],
  offtopic: [
    "I am NutriLens AI, specialized exclusively in nutrition, food, diet tracking, and health goals! 🥗 I can't help with coding, math, or non-nutrition topics. Feel free to ask me about your meals, macros, or calorie goals instead!",
  ],
};

/**
 * Get a contextual mock chat response
 */
export function getMockChatResponse(
  userMessage: string,
  context: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    calorieTarget: number;
    proteinTarget: number;
    mealCount: number;
    goal: string;
  }
): string {
  const msg = userMessage.toLowerCase();
  const remaining = context.calorieTarget - context.calories;
  const proteinPct = Math.round((context.protein / context.proteinTarget) * 100);

  let responses: string[];

  const offTopicKeywords = ['python', 'code', 'coding', 'javascript', 'html', 'css', 'script', 'program', 'function', 'class ', 'def ', 'import ', 'essay', 'math', 'calculator', 'history', 'geography', 'physics', 'chemistry', 'game'];
  const isOffTopic = offTopicKeywords.some(kw => msg.includes(kw));

  if (isOffTopic) {
    responses = CHAT_RESPONSES.offtopic;
  } else if (msg.includes('protein')) {
    responses = CHAT_RESPONSES.protein;
  } else if (msg.includes('healthy') || msg.includes('lunch') || msg.includes('dinner') || msg.includes('breakfast')) {
    responses = CHAT_RESPONSES.healthy;
  } else if (msg.includes('snack') || msg.includes('suggest') || msg.includes('eat')) {
    responses = CHAT_RESPONSES.snack;
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    responses = CHAT_RESPONSES.greeting;
  } else {
    responses = CHAT_RESPONSES.default;
  }

  const template = responses[Math.floor(Math.random() * responses.length)];

  return template
    .replace('{calories}', String(context.calories))
    .replace('{protein}', String(Math.round(context.protein)))
    .replace('{proteinPct}', String(proteinPct))
    .replace('{proteinTarget}', String(context.proteinTarget))
    .replace('{carbs}', String(Math.round(context.carbs)))
    .replace('{fat}', String(Math.round(context.fat)))
    .replace('{remaining}', String(Math.max(0, remaining)))
    .replace('{mealCount}', String(context.mealCount))
    .replace('{goal}', context.goal);
}


