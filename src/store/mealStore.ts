/**
 * Meal Store — Zustand with localStorage persistence
 * 
 * Manages daily meal logs, meal history, streak tracking,
 * and weekly data for trend charts.
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MealEntry,
  DailyTotals,
  calculateDailyTotals,
  calculateStreak,
  generateId,
} from '@/lib/nutrition';
import { generateMealHistory } from '@/lib/mockData';
import { getLocalDateString } from '@/lib/dateUtils';

interface MealState {
  // Meals indexed by date (YYYY-MM-DD)
  meals: Record<string, MealEntry[]>;
  initialized: boolean;

  // Actions
  addMeal: (meal: Omit<MealEntry, 'id'>) => string;
  editMeal: (mealId: string, date: string, updates: Partial<MealEntry>) => void;
  deleteMeal: (mealId: string, date: string) => void;
  
  // Computed getters
  getMealsForDate: (date: string) => MealEntry[];
  getDailyTotals: (date: string) => DailyTotals;
  getStreak: () => number;
  getWeeklyData: () => DailyTotals[];
  
  // Initialization
  initializeMockData: () => void;
  clearAllMeals: () => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: {},
      initialized: false,

      addMeal: (mealData) => {
        const id = generateId();
        const meal: MealEntry = { ...mealData, id };
        const date = meal.date;

        set((state) => ({
          meals: {
            ...state.meals,
            [date]: [...(state.meals[date] ?? []), meal],
          },
        }));

        return id;
      },

      editMeal: (mealId, date, updates) => {
        set((state) => {
          const dateMeals = state.meals[date] ?? [];
          return {
            meals: {
              ...state.meals,
              [date]: dateMeals.map((m) =>
                m.id === mealId ? { ...m, ...updates } : m
              ),
            },
          };
        });
      },

      deleteMeal: (mealId, date) => {
        set((state) => {
          const dateMeals = state.meals[date] ?? [];
          return {
            meals: {
              ...state.meals,
              [date]: dateMeals.filter((m) => m.id !== mealId),
            },
          };
        });
      },

      getMealsForDate: (date) => {
        return get().meals[date] ?? [];
      },

      getDailyTotals: (date) => {
        const meals = get().meals[date] ?? [];
        if (meals.length === 0) {
          return {
            date,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            mealCount: 0,
          };
        }
        return calculateDailyTotals(meals);
      },

      getStreak: () => {
        return calculateStreak(get().meals);
      },

      getWeeklyData: () => {
        const today = new Date();
        const weekData: DailyTotals[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = getLocalDateString(date);
          weekData.push(get().getDailyTotals(dateStr));
        }

        return weekData;
      },

      initializeMockData: () => {
        if (get().initialized) return;
        const mockHistory = generateMealHistory();
        set({ meals: mockHistory, initialized: true });
      },

      clearAllMeals: () => {
        set({ meals: {}, initialized: false });
      },
    }),
    {
      name: 'nutrilens-meals',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
