export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  hover: string;
  focus: string;
}

export interface Theme {
  name: string;
  id: string;
  colors: ThemeColors;
  description: string;
}

// Professional - Current default (Sky Blue)
export const professionalTheme: Theme = {
  name: 'Professional',
  id: 'professional',
  description: 'Clean, polished, official look',
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
};

// Gen Z - Trendy/Modern (Vibrant Purple, Hot Pink, Lime)
export const genZTheme: Theme = {
  name: 'Gen Z',
  id: 'gen-z',
  description: 'Modern, playful, trendy vibes',
  colors: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    secondary: '#ec4899',
    accent: '#84cc16',
    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b',
    info: '#06b6d4',
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    border: '#475569',
    hover: '#1e293b',
    focus: '#a855f7',
  },
};

// Gen Alpha - Bold/Neon (Electric Yellow, Magenta, Cyan)
export const genAlphaTheme: Theme = {
  name: 'Gen Alpha',
  id: 'gen-alpha',
  description: 'Bold, neon, high-contrast energy',
  colors: {
    primary: {
      50: '#fffacd',
      100: '#ffff99',
      200: '#ffff66',
      300: '#ffff33',
      400: '#ffff00',
      500: '#facc15',
      600: '#eab308',
      700: '#ca8a04',
      800: '#a16207',
      900: '#713f12',
    },
    secondary: '#ff00ff',
    accent: '#00ffff',
    success: '#00ff00',
    error: '#ff0055',
    warning: '#ffaa00',
    info: '#00aaff',
    background: {
      primary: '#000000',
      secondary: '#0a0a0a',
      tertiary: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffff00',
      tertiary: '#cccccc',
    },
    border: '#ffff00',
    hover: '#1a1a1a',
    focus: '#facc15',
  },
};

// Cyberpunk - Futuristic (Neon Pink, Blue, Purple)
export const cyberpunkTheme: Theme = {
  name: 'Cyberpunk',
  id: 'cyberpunk',
  description: 'Futuristic, tech-forward, dramatic',
  colors: {
    primary: {
      50: '#ffe0f3',
      100: '#ffc0e8',
      200: '#ff80d0',
      300: '#ff40b9',
      400: '#ff20b2',
      500: '#ff006e',
      600: '#d90055',
      700: '#a6003d',
      800: '#730027',
      900: '#40001a',
    },
    secondary: '#00d9ff',
    accent: '#b000ff',
    success: '#00ff88',
    error: '#ff0066',
    warning: '#ffaa00',
    info: '#00d9ff',
    background: {
      primary: '#0d0221',
      secondary: '#1a0033',
      tertiary: '#330066',
    },
    text: {
      primary: '#ff006e',
      secondary: '#00d9ff',
      tertiary: '#cccccc',
    },
    border: '#ff006e',
    hover: '#1a0033',
    focus: '#ff006e',
  },
};

export const themes: Theme[] = [
  professionalTheme,
  genZTheme,
  genAlphaTheme,
  cyberpunkTheme,
];

export const getThemeById = (id: string): Theme => {
  return themes.find(t => t.id === id) || professionalTheme;
};
