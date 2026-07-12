'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PortionSlider from '@/components/PortionSlider';
import ConfettiAnimation from '@/components/ConfettiAnimation';
import { useMealStore } from '@/store/mealStore';
import { getAIService } from '@/lib/aiService';
import { FoodItem, aggregateNutrition, MealType } from '@/lib/nutrition';
import { usePhotoStore } from '@/store/photoStore';
import { getLocalDateString } from '@/lib/dateUtils';

export default function AnalysisPage() {
  const router = useRouter();
  const addMeal = useMealStore((s) => s.addMeal);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logged, setLogged] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  });

  // Run analysis
  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const photo = usePhotoStore.getState().photo || '';
      if (!photo) {
        throw new Error('No meal photo was found. Please go back and take a photo of your meal.');
      }
      const aiService = getAIService();
      const result = await aiService.analyzeMealPhoto(photo);
      setItems(result.items || []);
      setSuggestions(result.suggestions || []);
      setConfidence(result.overallConfidence || 0);
    } catch (err) {
      console.error('Error during meal analysis:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to analyze your meal. Please check your connection and try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    analyze();
  }, [analyze]);

  const updatePortion = (itemId: string, multiplier: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, portionMultiplier: multiplier } : item
      )
    );
  };

  const totals = aggregateNutrition(items);

  const handleLogMeal = () => {
    if (items.length === 0) return;
    const today = getLocalDateString();
    addMeal({
      mealType: selectedMealType,
      items,
      totalNutrition: totals,
      loggedAt: new Date().toISOString(),
      date: today,
    });
    setShowConfetti(true);
    setLogged(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  // Error state
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 96px)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
        <h2 className="title-large" style={{ color: 'var(--md-sys-color-error)', marginBottom: '8px' }}>
          Analysis Failed
        </h2>
        <p className="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '24px', maxWidth: '320px' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '300px' }}>
          <Button variant="outlined" onClick={() => router.push('/dashboard/camera')} fullWidth>
            Go Back
          </Button>
          <Button variant="filled" onClick={analyze} fullWidth>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 96px)',
          padding: '24px',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: '64px', marginBottom: '24px' }}
        >
          🔍
        </motion.div>
        <h2 className="title-large" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
          Analyzing your meal...
        </h2>
        <p className="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          Identifying food items and calculating nutrition
        </p>
        <div style={{ marginTop: '24px', width: '200px' }}>
          <div className="shimmer" style={{ height: 4, borderRadius: 9999 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '120px' }}>
      <ConfettiAnimation active={showConfetti} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '16px', paddingTop: '8px' }}
      >
        <h1 className="headline-medium" style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          Meal Analysis
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <div
            className="label-medium"
            style={{
              backgroundColor: confidence > 0.85
                ? 'var(--md-sys-color-primary-container)'
                : 'var(--md-sys-color-tertiary-container)',
              color: confidence > 0.85
                ? 'var(--md-sys-color-on-primary-container)'
                : 'var(--md-sys-color-on-tertiary-container)',
              padding: '4px 10px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
            }}
          >
            {Math.round(confidence * 100)}% confidence
          </div>
        </div>
      </motion.div>

      {/* Food Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.2, 0, 0, 1] }}
          >
            <Card variant="outlined" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <div className="title-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {item.name}
                  </div>
                  <div className="body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <div
                  className="label-medium"
                  style={{
                    color: item.confidence > 0.9 ? '#4CAF88' : item.confidence > 0.7 ? '#FFB347' : '#FF6B8A',
                  }}
                >
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>

              <PortionSlider
                value={item.portionMultiplier}
                onChange={(v) => updatePortion(item.id, v)}
                baseCalories={item.nutrition.calories}
                baseProtein={item.nutrition.protein}
                baseCarbs={item.nutrition.carbs}
                baseFat={item.nutrition.fat}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '16px' }}
        >
          <Card variant="filled" padding="md">
            <div className="title-small" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
              💡 AI Suggestions
            </div>
            {suggestions.map((s, i) => (
              <p
                key={i}
                className="body-small"
                style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: i < suggestions.length - 1 ? '6px' : 0 }}
              >
                {s}
              </p>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Meal Type Selector */}
      <div style={{ marginBottom: '16px' }}>
        <span className="label-large" style={{ color: 'var(--md-sys-color-on-surface)', display: 'block', marginBottom: '8px' }}>
          Log as:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                border: selectedMealType === type
                  ? '2px solid var(--md-sys-color-primary)'
                  : '1px solid var(--md-sys-color-outline)',
                backgroundColor: selectedMealType === type
                  ? 'var(--md-sys-color-primary-container)'
                  : 'transparent',
                color: selectedMealType === type
                  ? 'var(--md-sys-color-on-primary-container)'
                  : 'var(--md-sys-color-on-surface)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                outline: 'none',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky footer - Total + Log button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: 0,
          right: 0,
          padding: '12px 16px',
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>Total</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="title-large" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>
              {totals.calories} kcal
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '10px' }}>
          <span className="label-medium" style={{ color: '#4ECDC4' }}>P: {Math.round(totals.protein)}g</span>
          <span className="label-medium" style={{ color: '#FFB347' }}>C: {Math.round(totals.carbs)}g</span>
          <span className="label-medium" style={{ color: '#FF6B8A' }}>F: {Math.round(totals.fat)}g</span>
        </div>

        <AnimatePresence mode="wait">
          {!logged ? (
            <motion.div key="log" exit={{ opacity: 0, scale: 0.9 }}>
              <Button variant="filled" onClick={handleLogMeal} fullWidth disabled={items.length === 0}>
                ✅ Log Meal
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--md-sys-color-primary)">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
                <span className="title-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
                  Meal logged! 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
