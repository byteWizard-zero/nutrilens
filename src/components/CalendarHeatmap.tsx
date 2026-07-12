'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getLocalDateString } from '@/lib/dateUtils';

interface CalendarHeatmapProps {
  data: Record<string, { calories: number; target: number }>;
  month?: Date;
  onDayClick?: (date: string) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Pad with empty days for the start of the week
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0)); // placeholder
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

function getDateStr(date: Date): string {
  return getLocalDateString(date);
}

function getCellColor(calories: number, target: number): string {
  if (calories === 0) return 'var(--md-sys-color-surface-container-low)';
  const pct = (calories / target) * 100;
  if (pct < 80) return '#FFF3CD'; // under — amber light
  if (pct <= 110) return 'var(--md-sys-color-primary-container)'; // on track
  return 'var(--md-sys-color-error-container)'; // over
}

function getCellOpacity(calories: number, target: number): number {
  if (calories === 0) return 0.4;
  const pct = (calories / target) * 100;
  return Math.min(0.4 + (pct / 100) * 0.6, 1);
}

export default function CalendarHeatmap({
  data,
  month: initialMonth,
  onDayClick,
}: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  const days = getDaysInMonth(currentMonth);
  const today = getDateStr(new Date());

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  return (
    <div>
      {/* Month navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '20px',
            padding: '8px',
          }}
        >
          ‹
        </button>
        <span className="title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '20px',
            padding: '8px',
          }}
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="label-small"
            style={{
              textAlign: 'center',
              color: 'var(--md-sys-color-on-surface-variant)',
              padding: '4px',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((day, i) => {
          const isPlaceholder = day.getTime() === 0;
          if (isPlaceholder) {
            return <div key={`placeholder-${i}`} />;
          }

          const dateStr = getDateStr(day);
          const dayData = data[dateStr];
          const calories = dayData?.calories ?? 0;
          const target = dayData?.target ?? 2000;
          const isToday = dateStr === today;

          return (
            <motion.button
              key={dateStr}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01, duration: 0.2 }}
              onClick={() => onDayClick?.(dateStr)}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                backgroundColor: getCellColor(calories, target),
                opacity: getCellOpacity(calories, target),
                border: isToday ? '2px solid var(--md-sys-color-primary)' : 'none',
                cursor: onDayClick ? 'pointer' : 'default',
                outline: 'none',
                padding: 0,
              }}
            >
              <span
                className="label-small"
                style={{
                  color: isToday ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day.getDate()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
