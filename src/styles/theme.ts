import { createDarkTheme, createLightTheme, BrandVariants } from '@fluentui/react-components';

// Aurora Brand Colors - Unique & Premium
const auroraBrand: BrandVariants = {
  10: '#020205',
  20: '#0A0B14',
  30: '#111326',
  40: '#171A38',
  50: '#1E224B',
  60: '#252A5E',
  70: '#2D3372',
  80: '#353C86',
  90: '#3E469B',
  100: '#4850B0',
  110: '#535BC5',
  120: '#6067D6',
  130: '#7075E3',
  140: '#8285ED',
  150: '#9597F5',
  160: '#AAABFB',
};

// Custom Aurora Dark Theme
export const auroraTheme = createDarkTheme(auroraBrand);

// Override specific tokens for our unique look
auroraTheme.colorNeutralBackground1 = '#0A0B14'; // Deep space background
auroraTheme.colorNeutralBackground2 = '#111326'; // Card background
auroraTheme.colorNeutralBackground3 = '#171A38'; // Elevated surfaces
auroraTheme.colorNeutralBackground4 = '#1E224B'; // Hover states

// Brand colors
auroraTheme.colorBrandBackground = '#6067D6';
auroraTheme.colorBrandBackgroundHover = '#7075E3';
auroraTheme.colorBrandBackgroundPressed = '#535BC5';

// Text colors
auroraTheme.colorNeutralForeground1 = '#FFFFFF';
auroraTheme.colorNeutralForeground2 = 'rgba(255, 255, 255, 0.85)';
auroraTheme.colorNeutralForeground3 = 'rgba(255, 255, 255, 0.65)';
auroraTheme.colorNeutralForeground4 = 'rgba(255, 255, 255, 0.45)';

// Border & Stroke
auroraTheme.colorNeutralStroke1 = 'rgba(255, 255, 255, 0.1)';
auroraTheme.colorNeutralStroke2 = 'rgba(255, 255, 255, 0.06)';

// Shadows
auroraTheme.shadow2 = '0 2px 8px rgba(0, 0, 0, 0.3)';
auroraTheme.shadow4 = '0 4px 16px rgba(0, 0, 0, 0.4)';
auroraTheme.shadow8 = '0 8px 32px rgba(0, 0, 0, 0.5)';
auroraTheme.shadow16 = '0 16px 48px rgba(0, 0, 0, 0.6)';

// Light theme variant
export const auroraLightTheme = createLightTheme(auroraBrand);

// CSS Custom Properties for advanced styling
export const cssVariables = {
  // Gradients
  '--gradient-primary': 'linear-gradient(135deg, #6067D6 0%, #9597F5 100%)',
  '--gradient-aurora': 'linear-gradient(135deg, #6067D6 0%, #00D9FF 50%, #FF6B9D 100%)',
  '--gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',

  // Glow effects
  '--glow-primary': '0 0 20px rgba(96, 103, 214, 0.4)',
  '--glow-success': '0 0 20px rgba(34, 197, 94, 0.4)',
  '--glow-error': '0 0 20px rgba(239, 68, 68, 0.4)',

  // Platform colors
  '--color-youtube': '#FF0000',
  '--color-instagram': '#E4405F',
  '--color-tiktok': '#00F2EA',
  '--color-twitter': '#1DA1F2',
  '--color-facebook': '#1877F2',
  '--color-spotify': '#1DB954',
  '--color-soundcloud': '#FF5500',

  // Animation timing
  '--ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  '--ease-in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',

  // Border radius
  '--radius-sm': '8px',
  '--radius-md': '12px',
  '--radius-lg': '16px',
  '--radius-xl': '24px',
  '--radius-full': '9999px',
} as const;

// Export color palette for use in components
export const colors = {
  primary: {
    50: '#AAABFB',
    100: '#9597F5',
    200: '#8285ED',
    300: '#7075E3',
    400: '#6067D6',
    500: '#535BC5',
    600: '#4850B0',
    700: '#3E469B',
    800: '#353C86',
    900: '#2D3372',
  },
  success: {
    light: '#4ADE80',
    main: '#22C55E',
    dark: '#16A34A',
  },
  error: {
    light: '#F87171',
    main: '#EF4444',
    dark: '#DC2626',
  },
  warning: {
    light: '#FBBF24',
    main: '#F59E0B',
    dark: '#D97706',
  },
  background: {
    primary: '#0A0B14',
    secondary: '#111326',
    tertiary: '#171A38',
    elevated: '#1E224B',
  },
};
