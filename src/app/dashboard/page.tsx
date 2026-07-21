'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '@/store/userStore';
import { useMealStore } from '@/store/mealStore';
import CalorieRing from '@/components/CalorieRing';
import MacroChart from '@/components/MacroChart';
import MealCard from '@/components/MealCard';
import Card from '@/components/ui/Card';
import { getLocalDateString } from '@/lib/dateUtils';

import QuickLogModal from '@/components/QuickLogModal';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const profile = useUserStore((s) => s.profile);
  const targets = useUserStore((s) => s.targets);
  const meals = useMealStore((s) => s.meals);
  const getDailyTotals = useMealStore((s) => s.getDailyTotals);
  const getStreak = useMealStore((s) => s.getStreak);
  const [mounted, setMounted] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = getLocalDateString();
  const todayMeals = meals[today] ?? [];
  const totals = getDailyTotals(today);
  const streak = getStreak();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const dateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (!mounted) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="shimmer" style={{ height: 220, width: 220, borderRadius: '50%', margin: '40px auto' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '24px', paddingTop: '8px' }}
      >
        <h1 className="headline-medium" style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          {greeting}, {profile?.name || 'there'} 👋
        </h1>
        <p className="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
          {dateDisplay}
        </p>
      </motion.div>

      {/* Calorie Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
      >
        <CalorieRing consumed={totals.calories} target={targets.calories} />
      </motion.div>

      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              backgroundColor: 'var(--md-sys-color-tertiary-container)',
              color: 'var(--md-sys-color-on-tertiary-container)',
            }}
          >
            <span style={{ fontSize: '18px' }}>🔥</span>
            <span className="label-large">{streak} day streak!</span>
          </div>
        </motion.div>
      )}

      {/* Macro Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '12px' }}>
            Macro Breakdown
          </div>
          <MacroChart
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            proteinTarget={targets.protein}
            carbsTarget={targets.carbs}
            fatTarget={targets.fat}
          />
        </Card>
      </motion.div>

      {/* Meal Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ marginTop: '24px', marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
            Today&apos;s Meals
          </h2>
          <Button
            variant="tonal"
            size="sm"
            onClick={() => setIsQuickLogOpen(true)}
          >
            ✍️ + Quick Log
          </Button>
        </div>

        {todayMeals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayMeals.map((meal, i) => (
              <MealCard key={meal.id} meal={meal} index={i} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-medium)',
            }}
          >
            <div className="animate-float" style={{ fontSize: '44px', marginBottom: '8px' }}>🥗</div>
            <p className="body-large" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '4px' }}>
              No meals logged yet today
            </p>
            <p className="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '16px' }}>
              Log with AI chat, photo camera, or manual entry
            </p>
            <div style={{ display: 'inline-flex', gap: '8px' }}>
              <Button variant="filled" size="sm" onClick={() => setIsQuickLogOpen(true)}>
                ✍️ Quick Manual Log
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Log Modal */}
      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
    </div>
  );
}
