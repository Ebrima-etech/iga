export interface DesignTokens {
  // Colors
  colors: {
    primary: Record<number, string>;
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
  };

  // Typography
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };

  // Border Radius
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  // Shadows
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };

  // Transitions
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };

  // Component Styles
  button: {
    borderRadius: string;
    padding: string;
    fontWeight: number;
    transition: string;
    shadow: string;
  };

  card: {
    borderRadius: string;
    padding: string;
    shadow: string;
    border: string;
  };

  input: {
    borderRadius: string;
    padding: string;
    border: string;
    focusRing: string;
  };

  header: {
    height: string;
    shadow: string;
    padding: string;
  };

  sidebar: {
    width: string;
    padding: string;
    itemSpacing: string;
    itemPadding: string;
    itemBorderRadius: string;
  };
}

// Professional Theme
export const professionalTokens: DesignTokens = {
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
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    glow: 'none',
  },
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  button: {
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 600,
    transition: '200ms ease-in-out',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  card: {
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  input: {
    borderRadius: '8px',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    focusRing: '2px solid #0ea5e9',
  },
  header: {
    height: '64px',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '0 24px',
  },
  sidebar: {
    width: '256px',
    padding: '24px',
    itemSpacing: '8px',
    itemPadding: '12px 16px',
    itemBorderRadius: '8px',
  },
};

// Gen Z Theme - Modern, Trendy
export const genZTokens: DesignTokens = {
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
  typography: {
    fontFamily: "'Inter', 'Poppins', system-ui, sans-serif",
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '19px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    md: '18px',
    lg: '28px',
    xl: '40px',
    '2xl': '56px',
  },
  borderRadius: {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },
  shadow: {
    sm: '0 4px 20px rgba(168, 85, 247, 0.15)',
    md: '0 8px 32px rgba(168, 85, 247, 0.2)',
    lg: '0 12px 48px rgba(168, 85, 247, 0.25)',
    xl: '0 20px 64px rgba(168, 85, 247, 0.3)',
    glow: '0 0 20px rgba(168, 85, 247, 0.4)',
  },
  transition: {
    fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  button: {
    borderRadius: '16px',
    padding: '12px 24px',
    fontWeight: 600,
    transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
  },
  card: {
    borderRadius: '20px',
    padding: '28px',
    shadow: '0 8px 32px rgba(168, 85, 247, 0.15)',
    border: 'none',
  },
  input: {
    borderRadius: '12px',
    padding: '12px 16px',
    border: 'none',
    focusRing: '0 0 0 3px rgba(168, 85, 247, 0.3)',
  },
  header: {
    height: '70px',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    padding: '0 32px',
  },
  sidebar: {
    width: '280px',
    padding: '28px',
    itemSpacing: '12px',
    itemPadding: '14px 18px',
    itemBorderRadius: '14px',
  },
};

// Gen Alpha - Bold, Neon, Geometric
export const genAlphaTokens: DesignTokens = {
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
  typography: {
    fontFamily: "'Space Mono', 'Courier New', monospace",
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '24px',
      '3xl': '36px',
    },
    fontWeight: {
      light: 400,
      normal: 400,
      medium: 700,
      semibold: 700,
      bold: 700,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '32px',
    '2xl': '64px',
  },
  borderRadius: {
    none: '0px',
    sm: '0px',
    md: '2px',
    lg: '4px',
    xl: '8px',
    full: '0px',
  },
  shadow: {
    sm: '2px 2px 0px #ffff00',
    md: '4px 4px 0px #ffff00',
    lg: '8px 8px 0px #ffff00',
    xl: '12px 12px 0px #ffff00',
    glow: '0 0 10px #ffff00, 0 0 20px #ff00ff',
  },
  transition: {
    fast: '50ms linear',
    normal: '100ms linear',
    slow: '200ms linear',
  },
  button: {
    borderRadius: '0px',
    padding: '10px 20px',
    fontWeight: 700,
    transition: '50ms linear',
    shadow: '3px 3px 0px #ffff00',
  },
  card: {
    borderRadius: '0px',
    padding: '20px',
    shadow: '4px 4px 0px #ffff00',
    border: '3px solid #ffff00',
  },
  input: {
    borderRadius: '0px',
    padding: '10px 12px',
    border: '2px solid #ffff00',
    focusRing: '0 0 0 3px #ffff00',
  },
  header: {
    height: '68px',
    shadow: '0 4px 0px #ffff00',
    padding: '0 20px',
  },
  sidebar: {
    width: '260px',
    padding: '20px',
    itemSpacing: '4px',
    itemPadding: '10px 12px',
    itemBorderRadius: '0px',
  },
};

// Cyberpunk - Futuristic, Neon, Grid
export const cyberpunkTokens: DesignTokens = {
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
  typography: {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      light: 400,
      normal: 400,
      medium: 600,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '25px',
    xl: '40px',
    '2xl': '60px',
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 0 10px rgba(255, 0, 110, 0.4), inset 0 0 10px rgba(0, 217, 255, 0.1)',
    md: '0 0 20px rgba(255, 0, 110, 0.5), inset 0 0 20px rgba(0, 217, 255, 0.2)',
    lg: '0 0 30px rgba(255, 0, 110, 0.6), inset 0 0 30px rgba(0, 217, 255, 0.3)',
    xl: '0 0 40px rgba(255, 0, 110, 0.7), inset 0 0 40px rgba(0, 217, 255, 0.4)',
    glow: '0 0 20px #ff006e, 0 0 40px #00d9ff, 0 0 60px #b000ff',
  },
  transition: {
    fast: '150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    normal: '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  button: {
    borderRadius: '4px',
    padding: '11px 22px',
    fontWeight: 600,
    transition: '200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    shadow: '0 0 15px rgba(255, 0, 110, 0.5)',
  },
  card: {
    borderRadius: '6px',
    padding: '25px',
    shadow: '0 0 20px rgba(255, 0, 110, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.1)',
    border: '1px solid #ff006e',
  },
  input: {
    borderRadius: '4px',
    padding: '11px 14px',
    border: '1px solid #ff006e',
    focusRing: '0 0 10px rgba(255, 0, 110, 0.6)',
  },
  header: {
    height: '66px',
    shadow: '0 0 20px rgba(255, 0, 110, 0.4)',
    padding: '0 28px',
  },
  sidebar: {
    width: '275px',
    padding: '25px',
    itemSpacing: '10px',
    itemPadding: '12px 16px',
    itemBorderRadius: '4px',
  },
};

export const themeTokens = {
  professional: professionalTokens,
  'gen-z': genZTokens,
  'gen-alpha': genAlphaTokens,
  cyberpunk: cyberpunkTokens,
};

export const getThemeTokens = (themeId: string): DesignTokens => {
  return themeTokens[themeId as keyof typeof themeTokens] || professionalTokens;
};
