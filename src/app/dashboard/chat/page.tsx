'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ChatBubble from '@/components/ChatBubble';
import TypingIndicator from '@/components/TypingIndicator';
import Chip from '@/components/ui/Chip';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { useMealStore } from '@/store/mealStore';
import { getLocalDateString } from '@/lib/dateUtils';

const QUICK_ACTIONS = [
  'Was my lunch healthy?',
  'Suggest a protein snack',
  "How's my protein today?",
  'Am I on track?',
];

export default function ChatPage() {
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const currentStreamedText = useChatStore((s) => s.currentStreamedText);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);
  const targets = useUserStore((s) => s.targets);
  const profile = useUserStore((s) => s.profile);
  const meals = useMealStore((s) => s.meals);
  const getDailyTotals = useMealStore((s) => s.getDailyTotals);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const today = getLocalDateString();
  const totals = getDailyTotals(today);
  const todayMeals = meals[today] ?? [];
  const remaining = Math.max(0, targets.calories - totals.calories);

  // Initial greeting
  useEffect(() => {
    // Read directly from the store state synchronously to bypass React strict mode race conditions
    const currentMessages = useChatStore.getState().messages;
    if (currentMessages.length === 0) {
      addSystemMessage(
        `Hello! 👋 I'm your AI nutritionist. I can see you've logged ${todayMeals.length} meals today totaling ${totals.calories} kcal. You have ${remaining} kcal remaining.\n\nAsk me anything about your nutrition! I can analyze your meals, suggest snacks, or give tips for your ${profile?.goal ?? 'health'} goal.`
      );
    }
  }, [todayMeals.length, totals.calories, remaining, profile?.goal, addSystemMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamedText]);

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content || isTyping) return;
    setInput('');

    sendMessage(content, {
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      mealCount: todayMeals.length,
      goal: profile?.goal ?? 'maintain',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Context banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span className="label-large">Today: {totals.calories} kcal</span>
          <span className="body-small" style={{ marginLeft: '8px', opacity: 0.8 }}>
            ({remaining} remaining)
          </span>
        </div>
        <span className="label-medium">{todayMeals.length} meals</span>
      </motion.div>

      {/* Messages */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isTyping && currentStreamedText && (
          <ChatBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: currentStreamedText,
              timestamp: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Typing indicator */}
        {isTyping && !currentStreamedText && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && !isTyping && (
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 16px',
            overflow: 'auto',
          }}
        >
          {QUICK_ACTIONS.map((action) => (
            <Chip
              key={action}
              label={action}
              variant="suggestion"
              onSelect={() => handleSend(action)}
            />
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--md-sys-color-surface-container)',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your nutrition..."
          disabled={isTyping}
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--md-sys-shape-corner-large)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            backgroundColor: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            lineHeight: '20px',
            maxHeight: '100px',
          }}
        />
        <motion.button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: input.trim() && !isTyping
              ? 'var(--md-sys-color-primary)'
              : 'var(--md-sys-color-surface-container-highest)',
            color: input.trim() && !isTyping
              ? 'var(--md-sys-color-on-primary)'
              : 'var(--md-sys-color-on-surface-variant)',
            border: 'none',
            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
