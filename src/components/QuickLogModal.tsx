'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMealStore } from '@/store/mealStore';
import { MealType, generateId, aggregateNutrition, FoodItem } from '@/lib/nutrition';
import { getLocalDateString } from '@/lib/dateUtils';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
}

const PRESET_FOODS = [
  { name: 'Whole Wheat Roti', quantity: 2, unit: 'pieces', nutrition: { calories: 170, protein: 6, carbs: 32, fat: 3.5, fiber: 4, sugar: 1 } },
  { name: 'Dal Tadka', quantity: 1, unit: 'bowl (200g)', nutrition: { calories: 198, protein: 12, carbs: 28, fat: 5, fiber: 6, sugar: 3 } },
  { name: 'Jeera Rice', quantity: 1, unit: 'serving (180g)', nutrition: { calories: 245, protein: 5, carbs: 48, fat: 4, fiber: 1, sugar: 0.5 } },
  { name: 'Scrambled Eggs', quantity: 2, unit: 'eggs', nutrition: { calories: 182, protein: 12, carbs: 2, fat: 14, fiber: 0, sugar: 1 } },
  { name: 'Grilled Chicken Salad', quantity: 1, unit: 'bowl (300g)', nutrition: { calories: 320, protein: 35, carbs: 12, fat: 15, fiber: 4, sugar: 5 } },
  { name: 'Whey Protein Shake', quantity: 1, unit: 'scoop (300ml)', nutrition: { calories: 150, protein: 25, carbs: 8, fat: 2, fiber: 1, sugar: 3 } },
  { name: 'Banana', quantity: 1, unit: 'medium', nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14 } },
  { name: 'Masala Chai', quantity: 1, unit: 'cup (200ml)', nutrition: { calories: 85, protein: 3, carbs: 12, fat: 3, fiber: 0, sugar: 10 } },
];

export default function QuickLogModal({ isOpen, onClose, defaultMealType = 'lunch' }: QuickLogModalProps) {
  const addMeal = useMealStore((s) => s.addMeal);

  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number>(200);
  const [protein, setProtein] = useState<number>(10);
  const [carbs, setCarbs] = useState<number>(25);
  const [fat, setFat] = useState<number>(6);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('serving');

  const handleSelectPreset = (preset: typeof PRESET_FOODS[0]) => {
    setFoodName(preset.name);
    setQuantity(preset.quantity);
    setUnit(preset.unit);
    setCalories(preset.nutrition.calories);
    setProtein(preset.nutrition.protein);
    setCarbs(preset.nutrition.carbs);
    setFat(preset.nutrition.fat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = foodName.trim() || 'Custom Meal';

    const foodItem: FoodItem = {
      id: generateId(),
      name,
      quantity,
      unit,
      portionMultiplier: 1.0,
      confidence: 1.0,
      nutrition: {
        calories,
        protein,
        carbs,
        fat,
        fiber: 2,
        sugar: 2,
      },
    };

    const today = getLocalDateString();
    addMeal({
      mealType,
      items: [foodItem],
      totalNutrition: aggregateNutrition([foodItem]),
      loggedAt: new Date().toISOString(),
      date: today,
    });

    onClose();
    setFoodName('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '460px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '24px',
            boxShadow: 'var(--md-sys-elevation-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="title-large" style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              ✍️ Quick Manual Log
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '8px' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PRESET_FOODS.map((food) => (
                <Chip
                  key={food.name}
                  label={`${food.name} (${food.nutrition.calories} kcal)`}
                  selected={foodName === food.name}
                  onSelect={() => handleSelectPreset(food)}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Meal Type */}
            <div>
              <label className="label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                Meal Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setMealType(type)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--md-sys-shape-corner-medium)',
                      border: mealType === type ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: mealType === type ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                      color: mealType === type ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type === 'breakfast' && '🌅 '}
                    {type === 'lunch' && '☀️ '}
                    {type === 'dinner' && '🌙 '}
                    {type === 'snack' && '🍿 '}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Name */}
            <div>
              <label className="label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                Food Item Name
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Oatmeal with berries"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Calories & Portion */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  min={0}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label className="label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                  Serving / Portion
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="bowl, slice, pcs"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Macros Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <label className="label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label className="label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label className="label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="outlined" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" variant="filled" fullWidth>
                Log Meal
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
