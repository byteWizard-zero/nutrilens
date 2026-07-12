/**
 * Chat Store — Zustand for AI Nutritionist Chat
 * 
 * Manages chat messages, typing state, and mock AI streaming.
 */

'use client';

import { create } from 'zustand';
import { getAIService, ChatContext } from '@/lib/aiService';
import { generateId, ChatMessage } from '@/lib/nutrition';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentStreamedText: string;

  // Actions
  sendMessage: (content: string, context: ChatContext) => Promise<void>;
  clearHistory: () => void;
  addSystemMessage: (content: string) => void;
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

      // Add complete assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
        currentStreamedText: '',
      }));
    } catch (error) {
      console.error('Chat error:', error);
      set({ isTyping: false, currentStreamedText: '' });
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
