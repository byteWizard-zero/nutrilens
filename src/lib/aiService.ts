/**
 * AI Service — Mock implementation with streaming simulation
 * 
 * Defines a clean interface that can be swapped with real
 * Claude API calls. The mock version provides realistic delays
 * and contextual responses.
 */

import { FoodItem, NutritionData, aggregateNutrition } from './nutrition';
import { getRandomAnalysis, getMockChatResponse, MockAnalysisResult } from './mockData';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export class RealAIService implements AIService {
  async analyzeMealPhoto(imageBase64: string): Promise<MealAnalysis> {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!res.ok) throw new Error('Analysis failed');
    const data = await res.json();

    return {
      items: data.items.map((item: Omit<FoodItem, 'id' | 'portionMultiplier'>, i: number) => ({
        id: `item-${Date.now()}-${i}`,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        confidence: item.confidence,
        nutrition: item.nutrition,
        portionMultiplier: 1.0,
      })),
      totalNutrition: aggregateNutrition(data.items.map((item: Omit<FoodItem, 'id' | 'portionMultiplier'>) => ({
        ...item,
        id: '',
        portionMultiplier: 1.0,
      }))),
      overallConfidence: data.overallConfidence,
      suggestions: data.suggestions,
    };
  }

  async streamChatResponse(
    message: string,
    context: ChatContext,
    onToken: (token: string) => void
  ): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });

    if (!res.ok) throw new Error('Chat request failed');

    if (!res.body) throw new Error('No response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.token) {
            fullResponse += parsed.token;
            onToken(parsed.token);
          }
        } catch (e) {
          console.error('Failed to parse SSE token:', e);
        }
      }
    }

    return fullResponse;
  }
}

export interface MealAnalysis {
  items: FoodItem[];
  totalNutrition: NutritionData;
  overallConfidence: number;
  suggestions: string[];
}

export interface ChatContext {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieTarget: number;
  proteinTarget: number;
  mealCount: number;
  goal: string;
}

export interface AIService {
  analyzeMealPhoto(imageBase64: string): Promise<MealAnalysis>;
  streamChatResponse(
    message: string,
    context: ChatContext,
    onToken: (token: string) => void
  ): Promise<string>;
}

// ──────────────────────────────────────────────
// Mock AI Service Implementation
// ──────────────────────────────────────────────

/**
 * Simulates AI processing delay (1-3 seconds)
 */
function randomDelay(min = 1000, max = 3000): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulates token-by-token streaming of text
 */
async function streamText(
  text: string,
  onToken: (token: string) => void,
  baseDelay = 20
): Promise<void> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = i === 0 ? words[i] : ' ' + words[i];
    onToken(word);
    // Variable delay to simulate natural typing
    const delay = baseDelay + Math.random() * 30;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export class MockAIService implements AIService {
  /**
   * Analyze a meal photo (mock — returns random preset analysis)
   * Simulates 1.5-3s processing time
   */
  async analyzeMealPhoto(_imageBase64: string): Promise<MealAnalysis> {
    await randomDelay(1500, 3000);
    const analysis: MockAnalysisResult = getRandomAnalysis();
    return {
      items: analysis.items,
      totalNutrition: analysis.totalNutrition,
      overallConfidence: analysis.overallConfidence,
      suggestions: analysis.suggestions,
    };
  }

  /**
   * Stream a chat response token by token (mock — uses contextual responses)
   * Returns the full response text when done
   */
  async streamChatResponse(
    message: string,
    context: ChatContext,
    onToken: (token: string) => void
  ): Promise<string> {
    // Simulate thinking delay
    await randomDelay(500, 1500);

    const response = getMockChatResponse(message, context);
    await streamText(response, onToken);

    return response;
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    const useReal = process.env.NEXT_PUBLIC_USE_REAL_AI !== 'false';
    aiServiceInstance = useReal ? new RealAIService() : new MockAIService();
  }
  return aiServiceInstance;
}
