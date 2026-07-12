/**
 * Material Design 3 — Dynamic Color Theme System
 * 
 * Generates a full MD3 tonal palette from a single seed color
 * and applies it as CSS custom properties on the document root.
 * 
 * Uses @material/material-color-utilities for HCT color space calculations.
 */

import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

// Default seed color — Fresh Teal (health-forward, energetic)
export const DEFAULT_SEED_COLOR = '#4CAF88';

// Preset seed colors for the theme picker
export const SEED_COLOR_PRESETS = [
  { name: 'Fresh Teal', hex: '#4CAF88' },
  { name: 'Ocean Blue', hex: '#4A90D9' },
  { name: 'Sunset Orange', hex: '#E07C3E' },
  { name: 'Berry Purple', hex: '#9C5BB5' },
  { name: 'Rose Pink', hex: '#D4607A' },
  { name: 'Forest Green', hex: '#2E7D4F' },
] as const;

/**
 * Color roles used throughout the app mapped to CSS custom property names
 */
export const MD3_COLOR_ROLES = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'background',
  'onBackground',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'outline',
  'outlineVariant',
  'shadow',
  'scrim',
  'inverseSurface',
  'inverseOnSurface',
  'inversePrimary',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
] as const;

/**
 * Convert a camelCase MD3 role name to a CSS custom property name
 * e.g., "primaryContainer" → "--md-sys-color-primary-container"
 */
function roleToCssVar(role: string): string {
  const kebab = role.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--md-sys-color-${kebab}`;
}


/**
 * Apply the MD3 theme to the document root as CSS custom properties
 */
export function applyTheme(seedColorHex: string, isDark: boolean): void {
  if (typeof document === 'undefined') return;

  const sourceColor = argbFromHex(seedColorHex);
  const theme = themeFromSourceColor(sourceColor);
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

  const root = document.documentElement;

  // Apply all color roles as CSS custom properties
  for (const role of MD3_COLOR_ROLES) {
    const cssVar = roleToCssVar(role);
    const value = scheme[role as keyof typeof scheme];
    if (typeof value === 'number') {
      root.style.setProperty(cssVar, hexFromArgb(value));
    }
  }

  // Apply additional surface container colors from the palette
  const palettes = theme.palettes;
  const neutralTone = (tone: number) =>
    hexFromArgb(palettes.neutral.tone(tone));

  if (isDark) {
    root.style.setProperty('--md-sys-color-surface-dim', neutralTone(6));
    root.style.setProperty('--md-sys-color-surface-bright', neutralTone(24));
    root.style.setProperty('--md-sys-color-surface-container-lowest', neutralTone(4));
    root.style.setProperty('--md-sys-color-surface-container-low', neutralTone(10));
    root.style.setProperty('--md-sys-color-surface-container', neutralTone(12));
    root.style.setProperty('--md-sys-color-surface-container-high', neutralTone(17));
    root.style.setProperty('--md-sys-color-surface-container-highest', neutralTone(22));
  } else {
    root.style.setProperty('--md-sys-color-surface-dim', neutralTone(87));
    root.style.setProperty('--md-sys-color-surface-bright', neutralTone(98));
    root.style.setProperty('--md-sys-color-surface-container-lowest', neutralTone(100));
    root.style.setProperty('--md-sys-color-surface-container-low', neutralTone(96));
    root.style.setProperty('--md-sys-color-surface-container', neutralTone(94));
    root.style.setProperty('--md-sys-color-surface-container-high', neutralTone(92));
    root.style.setProperty('--md-sys-color-surface-container-highest', neutralTone(90));
  }

  // Set the data-theme attribute for conditional CSS
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      hexFromArgb(scheme.surface as number)
    );
  }
}

/**
 * Get the system dark mode preference
 */
export function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Listen for system dark mode changes
 */
export function onSystemDarkModeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
