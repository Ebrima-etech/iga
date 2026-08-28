import { Theme } from './definitions';
import { DesignTokens, getThemeTokens } from './designTokens';

export const generateCSSVariables = (theme: Theme): Record<string, string> => {
  const tokens = getThemeTokens(theme.id);

  return {
    // Primary colors
    '--color-primary-50': tokens.colors.primary[50],
    '--color-primary-100': tokens.colors.primary[100],
    '--color-primary-200': tokens.colors.primary[200],
    '--color-primary-300': tokens.colors.primary[300],
    '--color-primary-400': tokens.colors.primary[400],
    '--color-primary-500': tokens.colors.primary[500],
    '--color-primary-600': tokens.colors.primary[600],
    '--color-primary-700': tokens.colors.primary[700],
    '--color-primary-800': tokens.colors.primary[800],
    '--color-primary-900': tokens.colors.primary[900],

    // Secondary & Accent
    '--color-secondary': tokens.colors.secondary,
    '--color-accent': tokens.colors.accent,

    // Status colors
    '--color-success': tokens.colors.success,
    '--color-error': tokens.colors.error,
    '--color-warning': tokens.colors.warning,
    '--color-info': tokens.colors.info,

    // Background
    '--bg-primary': tokens.colors.background.primary,
    '--bg-secondary': tokens.colors.background.secondary,
    '--bg-tertiary': tokens.colors.background.tertiary,

    // Text
    '--text-primary': tokens.colors.text.primary,
    '--text-secondary': tokens.colors.text.secondary,
    '--text-tertiary': tokens.colors.text.tertiary,

    // UI
    '--border-color': tokens.colors.border,
    '--hover-bg': tokens.colors.hover,
    '--focus-color': tokens.colors.focus,

    // Typography
    '--font-family': tokens.typography.fontFamily,
    '--font-size-xs': tokens.typography.fontSize.xs,
    '--font-size-sm': tokens.typography.fontSize.sm,
    '--font-size-base': tokens.typography.fontSize.base,
    '--font-size-lg': tokens.typography.fontSize.lg,
    '--font-size-xl': tokens.typography.fontSize.xl,
    '--font-size-2xl': tokens.typography.fontSize['2xl'],
    '--font-size-3xl': tokens.typography.fontSize['3xl'],

    '--font-weight-light': tokens.typography.fontWeight.light.toString(),
    '--font-weight-normal': tokens.typography.fontWeight.normal.toString(),
    '--font-weight-medium': tokens.typography.fontWeight.medium.toString(),
    '--font-weight-semibold': tokens.typography.fontWeight.semibold.toString(),
    '--font-weight-bold': tokens.typography.fontWeight.bold.toString(),

    '--line-height-tight': tokens.typography.lineHeight.tight.toString(),
    '--line-height-normal': tokens.typography.lineHeight.normal.toString(),
    '--line-height-relaxed': tokens.typography.lineHeight.relaxed.toString(),

    // Spacing
    '--spacing-xs': tokens.spacing.xs,
    '--spacing-sm': tokens.spacing.sm,
    '--spacing-md': tokens.spacing.md,
    '--spacing-lg': tokens.spacing.lg,
    '--spacing-xl': tokens.spacing.xl,
    '--spacing-2xl': tokens.spacing['2xl'],

    // Border Radius
    '--radius-none': tokens.borderRadius.none,
    '--radius-sm': tokens.borderRadius.sm,
    '--radius-md': tokens.borderRadius.md,
    '--radius-lg': tokens.borderRadius.lg,
    '--radius-xl': tokens.borderRadius.xl,
    '--radius-full': tokens.borderRadius.full,

    // Shadows
    '--shadow-sm': tokens.shadow.sm,
    '--shadow-md': tokens.shadow.md,
    '--shadow-lg': tokens.shadow.lg,
    '--shadow-xl': tokens.shadow.xl,
    '--shadow-glow': tokens.shadow.glow,

    // Transitions
    '--transition-fast': tokens.transition.fast,
    '--transition-normal': tokens.transition.normal,
    '--transition-slow': tokens.transition.slow,

    // Component Styles
    '--button-radius': tokens.button.borderRadius,
    '--button-padding': tokens.button.padding,
    '--button-shadow': tokens.button.shadow,
    '--button-transition': tokens.button.transition,

    '--card-radius': tokens.card.borderRadius,
    '--card-padding': tokens.card.padding,
    '--card-shadow': tokens.card.shadow,
    '--card-border': tokens.card.border,

    '--input-radius': tokens.input.borderRadius,
    '--input-padding': tokens.input.padding,
    '--input-border': tokens.input.border,
    '--input-focus': tokens.input.focusRing,

    '--header-height': tokens.header.height,
    '--header-shadow': tokens.header.shadow,
    '--header-padding': tokens.header.padding,

    '--sidebar-width': tokens.sidebar.width,
    '--sidebar-padding': tokens.sidebar.padding,
    '--sidebar-item-spacing': tokens.sidebar.itemSpacing,
    '--sidebar-item-padding': tokens.sidebar.itemPadding,
    '--sidebar-item-radius': tokens.sidebar.itemBorderRadius,
  };
};

export const applyThemeToDocument = (theme: Theme): void => {
  const variables = generateCSSVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Set data-theme attribute for CSS selectors
  root.setAttribute('data-theme', theme.id);
};

export const getCSSVariableFallbacks = (): Record<string, string> => {
  // Professional theme as fallback
  return generateCSSVariables({
    name: 'Professional',
    id: 'professional',
    description: 'Default theme',
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c3d66',
      },
      secondary: '#06b6d4',
      accent: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
      },
      border: '#e5e7eb',
      hover: '#f3f4f6',
      focus: '#0ea5e9',
    },
  });
};
