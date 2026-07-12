/**
 * Nutrition Calculation Utilities
 * 
 * TDEE calculation using Mifflin-St Jeor formula,
 * macro ratio calculations, and daily aggregation.
 */

import { getLocalDateString } from './dateUtils';

export type Goal = 'lose' | 'maintain' | 'gain';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryRestrictions: string[];
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  portionMultiplier: number;
  confidence: number;
  nutrition: NutritionData;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  mealType: MealType;
  items: FoodItem[];
  totalNutrition: NutritionData;
  photoUrl?: string;
  loggedAt: string; // ISO timestamp
  date: string; // YYYY-MM-DD
}

export interface DailyTotals {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  mealCount: number;
}

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little to no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Goal-based calorie adjustments
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,     // 500 cal deficit ≈ 0.45kg/week loss
  maintain: 0,
  gain: 300,      // 300 cal surplus for lean gain
};

// Goal-based macro ratios (as percentage of total calories)
const MACRO_RATIOS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  lose: { protein: 0.35, carbs: 0.35, fat: 0.30 },      // Higher protein for muscle preservation
  maintain: { protein: 0.25, carbs: 0.50, fat: 0.25 },   // Balanced
  gain: { protein: 0.30, carbs: 0.45, fat: 0.25 },       // Higher protein + carbs for growth
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor formula
 * 
 * Men:   BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age(y) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age(y) – 161
 */
export function calculateBMR(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex'>): number {
  const { weightKg, heightCm, age, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

/**
 * Calculate Total Daily Energy Expenditure
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex' | 'activityLevel'>): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

/**
 * Calculate daily calorie target based on TDEE and goal
 */
export function calculateCalorieTarget(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex' | 'activityLevel' | 'goal'>): number {
  const tdee = calculateTDEE(profile);
  const target = tdee + GOAL_ADJUSTMENTS[profile.goal];
  // Minimum floor of 1200 calories for safety
  return Math.max(1200, Math.round(target));
}

/**
 * Calculate macro targets in grams from calorie target and goal
 * 
 * Protein: 4 cal/g
 * Carbs: 4 cal/g
 * Fat: 9 cal/g
 */
export function calculateMacroTargets(calories: number, goal: Goal): MacroTargets {
  const ratios = MACRO_RATIOS[goal];
  
  const protein = Math.round((calories * ratios.protein) / 4);
  const carbs = Math.round((calories * ratios.carbs) / 4);
  const fat = Math.round((calories * ratios.fat) / 9);
  
  // Fiber recommendation: 14g per 1000 calories
  const fiber = Math.round((calories / 1000) * 14);

  return { calories, protein, carbs, fat, fiber };
}

/**
 * Calculate full macro targets from user profile
 */
export function calculateFullTargets(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex' | 'activityLevel' | 'goal'>): MacroTargets {
  const calories = calculateCalorieTarget(profile);
  return calculateMacroTargets(calories, profile.goal);
}

/**
 * Aggregate nutrition data from a list of food items
 */
export function aggregateNutrition(items: FoodItem[]): NutritionData {
  return items.reduce<NutritionData>(
    (total, item) => {
      const m = item.portionMultiplier;
      return {
        calories: total.calories + Math.round(item.nutrition.calories * m),
        protein: total.protein + Math.round(item.nutrition.protein * m * 10) / 10,
        carbs: total.carbs + Math.round(item.nutrition.carbs * m * 10) / 10,
        fat: total.fat + Math.round(item.nutrition.fat * m * 10) / 10,
        fiber: total.fiber + Math.round(item.nutrition.fiber * m * 10) / 10,
        sugar: total.sugar + Math.round(item.nutrition.sugar * m * 10) / 10,
        sodium: (total.sodium ?? 0) + Math.round((item.nutrition.sodium ?? 0) * m),
        potassium: (total.potassium ?? 0) + Math.round((item.nutrition.potassium ?? 0) * m),
        calcium: (total.calcium ?? 0) + Math.round((item.nutrition.calcium ?? 0) * m),
        iron: (total.iron ?? 0) + Math.round((item.nutrition.iron ?? 0) * m * 10) / 10,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0 }
  );
}

/**
 * Calculate daily totals from meals
 */
export function calculateDailyTotals(meals: MealEntry[]): DailyTotals {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalNutrition.calories,
      protein: acc.protein + meal.totalNutrition.protein,
      carbs: acc.carbs + meal.totalNutrition.carbs,
      fat: acc.fat + meal.totalNutrition.fat,
      fiber: acc.fiber + meal.totalNutrition.fiber,
      sugar: acc.sugar + meal.totalNutrition.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  return {
    date: meals[0]?.date ?? getLocalDateString(),
    ...totals,
    mealCount: meals.length,
  };
}

/**
 * Calculate streak (consecutive days with at least 1 logged meal)
 */
export function calculateStreak(mealsByDate: Record<string, MealEntry[]>): number {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getLocalDateString(date);
    
    if (mealsByDate[dateStr] && mealsByDate[dateStr].length > 0) {
      streak++;
    } else if (i === 0) {
      // Today might not have meals yet, skip
      continue;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get calorie adherence status
 */
export function getCalorieAdherence(consumed: number, target: number): {
  percentage: number;
  status: 'under' | 'on-track' | 'over';
  remaining: number;
} {
  const percentage = Math.round((consumed / target) * 100);
  const remaining = target - consumed;
  
  let status: 'under' | 'on-track' | 'over';
  if (percentage < 80) status = 'under';
  else if (percentage <= 110) status = 'on-track';
  else status = 'over';
  
  return { percentage, status, remaining };
}

/**
 * Format a number with locale-appropriate separators
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get activity level display labels
 */
export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (office job)',
  light: 'Lightly Active (1-3 days/week)',
  moderate: 'Moderately Active (3-5 days/week)',
  active: 'Very Active (6-7 days/week)',
  very_active: 'Extra Active (athlete/physical job)',
};

/**
 * Get goal display labels
 */
export const GOAL_LABELS: Record<Goal, { title: string; description: string; emoji: string }> = {
  lose: { title: 'Lose Weight', description: 'Calorie deficit for fat loss', emoji: '🔥' },
  maintain: { title: 'Maintain Weight', description: 'Stay at current weight', emoji: '⚖️' },
  gain: { title: 'Gain Weight', description: 'Calorie surplus for muscle gain', emoji: '💪' },
};

/**
 * Available dietary restrictions
 */
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Low-Fat',
  'Low-Sodium',
] as const;

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get meal type display info
 */
export const MEAL_TYPE_INFO: Record<MealType, { label: string; emoji: string; timeRange: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', timeRange: '6:00 - 10:00 AM' },
  lunch: { label: 'Lunch', emoji: '☀️', timeRange: '12:00 - 2:00 PM' },
  dinner: { label: 'Dinner', emoji: '🌙', timeRange: '7:00 - 9:00 PM' },
  snack: { label: 'Snack', emoji: '🍿', timeRange: 'Anytime' },
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DayTrendData {
  date: string;
  dayLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target: number;
}
