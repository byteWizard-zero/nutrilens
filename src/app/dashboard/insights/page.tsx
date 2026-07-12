'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Card from '@/components/ui/Card';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import TrendChart from '@/components/TrendChart';
import { useUserStore } from '@/store/userStore';
import { useMealStore } from '@/store/mealStore';
import { DayTrendData } from '@/lib/nutrition';

export default function InsightsPage() {
  const targets = useUserStore((s) => s.targets);
  const getWeeklyData = useMealStore((s) => s.getWeeklyData);
  const getStreak = useMealStore((s) => s.getStreak);
  const meals = useMealStore((s) => s.meals);
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState<'calories' | 'macros'>('calories');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="shimmer" style={{ height: 250, borderRadius: 16 }} />
      </div>
    );
  }

  const weeklyTotals = getWeeklyData();
  const streak = getStreak();

  // Generate trend data for charts
  const trendData: DayTrendData[] = weeklyTotals.map((d) => {
    const date = new Date(d.date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      date: d.date,
      dayLabel: days[date.getDay()],
      calories: d.calories,
      protein: Math.round(d.protein),
      carbs: Math.round(d.carbs),
      fat: Math.round(d.fat),
      target: targets.calories,
    };
  });

  // Calendar heatmap data
  const heatmapData: Record<string, { calories: number; target: number }> = {};
  Object.entries(meals).forEach(([date, dateMeals]) => {
    const total = dateMeals.reduce((sum, m) => sum + m.totalNutrition.calories, 0);
    heatmapData[date] = { calories: total, target: targets.calories };
  });

  // Average calories this week
  const avgCalories = weeklyTotals.length > 0
    ? Math.round(weeklyTotals.reduce((sum, d) => sum + d.calories, 0) / (weeklyTotals.filter((d) => d.calories > 0).length || 1))
    : 0;

  // Best day
  const bestDay = weeklyTotals.reduce((best, d) => {
    const adherence = Math.abs(d.calories - targets.calories);
    const bestAdherence = Math.abs(best.calories - targets.calories);
    return adherence < bestAdherence ? d : best;
  }, weeklyTotals[0] || { date: '', calories: 0 });

  return (
    <div style={{ padding: '16px', paddingTop: '8px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="headline-medium"
        style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', paddingTop: '8px' }}
      >
        📊 Weekly Insights
      </motion.h1>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}
      >
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-primary-container)',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            padding: '14px 10px',
            textAlign: 'center',
          }}
        >
          <div className="title-medium" style={{ color: 'var(--md-sys-color-on-primary-container)', fontWeight: 700 }}>
            {avgCalories}
          </div>
          <div className="label-small" style={{ color: 'var(--md-sys-color-on-primary-container)', opacity: 0.8 }}>
            Avg kcal/day
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-tertiary-container)',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            padding: '14px 10px',
            textAlign: 'center',
          }}
        >
          <div className="title-medium" style={{ color: 'var(--md-sys-color-on-tertiary-container)', fontWeight: 700 }}>
            🔥 {streak}
          </div>
          <div className="label-small" style={{ color: 'var(--md-sys-color-on-tertiary-container)', opacity: 0.8 }}>
            Day Streak
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-secondary-container)',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            padding: '14px 10px',
            textAlign: 'center',
          }}
        >
          <div className="title-medium" style={{ color: 'var(--md-sys-color-on-secondary-container)', fontWeight: 700 }}>
            {bestDay.date ? new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A'}
          </div>
          <div className="label-small" style={{ color: 'var(--md-sys-color-on-secondary-container)', opacity: 0.8 }}>
            Best Day
          </div>
        </div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              {chartType === 'calories' ? 'Calorie Trend' : 'Macro Breakdown'}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['calories', 'macros'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    border: 'none',
                    backgroundColor: chartType === t
                      ? 'var(--md-sys-color-secondary-container)'
                      : 'transparent',
                    color: chartType === t
                      ? 'var(--md-sys-color-on-secondary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    outline: 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <TrendChart data={trendData} type={chartType} height={220} />
        </Card>
      </motion.div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: '20px' }}
      >
        <Card variant="elevated" padding="md">
          <span className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)', display: 'block', marginBottom: '12px' }}>
            Logging Calendar
          </span>
          <CalendarHeatmap data={heatmapData} />
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '12px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'No data', color: 'var(--md-sys-color-surface-container-low)' },
          { label: 'Under', color: '#FFF3CD' },
          { label: 'On track', color: 'var(--md-sys-color-primary-container)' },
          { label: 'Over', color: 'var(--md-sys-color-error-container)' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: item.color,
              }}
            />
            <span className="label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
