/**
 * Chat Store — Zustand for AI Nutritionist Chat
 * 
 * Manages chat messages, typing state, and mock AI streaming.
 */

'use client';

import { create } from 'zustand';
import { getAIService, ChatContext } from '@/lib/aiService';
import { generateId, ChatMessage, MealType, aggregateNutrition } from '@/lib/nutrition';
import { useMealStore } from './mealStore';
import { useUserStore } from './userStore';
import { getLocalDateString } from '@/lib/dateUtils';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentStreamedText: string;

  // Actions
  sendMessage: (content: string, context: ChatContext) => Promise<void>;
  clearHistory: () => void;
  addSystemMessage: (content: string) => void;
}

interface ActionItem {
  name?: string;
  quantity?: number;
  unit?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
}

function parseAndExecuteAction(responseContent: string) {
  const match = responseContent.match(/```json:action\s*([\s\S]*?)\s*```/);
  if (!match) return null;

  try {
    const actionPayload = JSON.parse(match[1].trim());
    const today = getLocalDateString();

    if (actionPayload.action === 'log_meal') {
      const rawItems: ActionItem[] = actionPayload.items || [];
      const items = rawItems.map((item) => ({
        id: generateId(),
        name: item.name || 'Food Item',
        quantity: item.quantity || 1,
        unit: item.unit || 'serving',
        portionMultiplier: 1.0,
        confidence: 0.95,
        nutrition: {
          calories: item.nutrition?.calories || 150,
          protein: item.nutrition?.protein || 5,
          carbs: item.nutrition?.carbs || 20,
          fat: item.nutrition?.fat || 5,
          fiber: item.nutrition?.fiber || 2,
          sugar: item.nutrition?.sugar || 2,
        },
      }));

      const totalNutrition = aggregateNutrition(items);
      const mealType: MealType = actionPayload.mealType || 'lunch';

      useMealStore.getState().addMeal({
        mealType,
        items,
        totalNutrition,
        loggedAt: new Date().toISOString(),
        date: today,
      });

      return {
        type: 'log_meal',
        title: `Logged ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
        detail: `${items.map((i) => i.name).join(', ')} (${totalNutrition.calories} kcal)`,
      };
    } else if (actionPayload.action === 'update_profile') {
      const userStore = useUserStore.getState();
      if (actionPayload.goal) {
        userStore.updateGoal(actionPayload.goal);
      }
      if (actionPayload.weightKg || actionPayload.heightCm || actionPayload.activityLevel || actionPayload.dietaryRestrictions) {
        userStore.updateProfile({
          ...(actionPayload.weightKg ? { weightKg: actionPayload.weightKg } : {}),
          ...(actionPayload.heightCm ? { heightCm: actionPayload.heightCm } : {}),
          ...(actionPayload.activityLevel ? { activityLevel: actionPayload.activityLevel } : {}),
          ...(actionPayload.dietaryRestrictions ? { dietaryRestrictions: actionPayload.dietaryRestrictions } : {}),
        });
      }
      if (actionPayload.calorieTarget) {
        useUserStore.setState((state) => ({
          targets: {
            ...state.targets,
            calories: actionPayload.calorieTarget,
            ...(actionPayload.proteinTarget ? { protein: actionPayload.proteinTarget } : {}),
          },
        }));
      }

      return {
        type: 'update_profile',
        title: 'Updated Profile & Targets',
        detail: actionPayload.goal ? `Goal set to ${actionPayload.goal.toUpperCase()}` : 'Targets adjusted',
      };
    } else if (actionPayload.action === 'update_theme') {
      const userStore = useUserStore.getState();
      if (actionPayload.seedColor) {
        userStore.setSeedColor(actionPayload.seedColor);
      }
      if (typeof actionPayload.isDarkMode === 'boolean') {
        userStore.setDarkMode(actionPayload.isDarkMode);
      }
      return {
        type: 'update_theme',
        title: 'Updated UI Theme',
        detail: `Color: ${actionPayload.seedColor || 'Theme'}, Dark Mode: ${actionPayload.isDarkMode ? 'On' : 'Off'}`,
      };
    } else if (actionPayload.action === 'delete_meal') {
      const mealStore = useMealStore.getState();
      const dateMeals = mealStore.getMealsForDate(today);
      const targetMeal = dateMeals.find((m) => m.mealType === actionPayload.mealType) || dateMeals[dateMeals.length - 1];
      if (targetMeal) {
        mealStore.deleteMeal(targetMeal.id, today);
        return {
          type: 'delete_meal',
          title: 'Deleted Meal Log',
          detail: `Removed ${targetMeal.mealType} log`,
        };
      }
    } else if (actionPayload.action === 'clear_history') {
      useMealStore.getState().clearAllMeals();
      return {
        type: 'clear_history',
        title: 'Cleared History',
        detail: 'All logged meals reset',
      };
    }
  } catch (err) {
    console.error('Failed to parse or execute AI action:', err);
  }
  return null;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  currentStreamedText: '',

  sendMessage: async (content: string, context: ChatContext) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      currentStreamedText: '',
    }));

    try {
      const aiService = getAIService();

      // Stream the response
      const fullResponse = await aiService.streamChatResponse(
        content,
        context,
        (token) => {
          set((state) => ({
            currentStreamedText: state.currentStreamedText + token,
          }));
        }
      );

      // Execute any embedded Jarvis action
      const actionInfo = parseAndExecuteAction(fullResponse);

      // Remove the raw json:action block from the displayed assistant message
      const cleanResponse = fullResponse.replace(/```json:action\s*[\s\S]*?\s*```/g, '').trim();

      // Add complete assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date().toISOString(),
        ...(actionInfo ? { actionInfo } : {}),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
        currentStreamedText: '',
      }));
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ **Could not connect to NutriLens AI.** Please check if your `OPENAI_API_KEY` is configured in your environment variables, or try again later.',
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isTyping: false,
        currentStreamedText: '',
      }));
    }
  },

  clearHistory: () => {
    set({ messages: [], isTyping: false, currentStreamedText: '' });
  },

  addSystemMessage: (content: string) => {
    set((state) => {
      // Prevent duplicate system messages
      const isDuplicate = state.messages.some(
        (msg) => msg.role === 'assistant' && msg.content === content
      );
      if (isDuplicate) return state;

      const message: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      return { messages: [...state.messages, message] };
    });
  },
}));
