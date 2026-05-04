// Theme constants for the Hate Speech Detection app

export const DarkColors = {
  background: '#121418',
  backgroundSecondary: '#1A1D23',
  backgroundTertiary: '#22262E',
  surface: '#252930',
  surfaceElevated: '#2A2F38',

  primary: '#7C6AEF',
  primaryLight: '#9B8DF5',
  primaryDark: '#6350D8',

  accent: '#4ECDC4',
  accentLight: '#6FE0D8',

  success: '#5CB985',
  successLight: '#78D09E',
  successBg: 'rgba(92, 185, 133, 0.10)',

  warning: '#E8A838',
  warningLight: '#F0BD5C',
  warningBg: 'rgba(232, 168, 56, 0.10)',

  danger: '#E06060',
  dangerLight: '#EB8585',
  dangerBg: 'rgba(224, 96, 96, 0.10)',

  safe: '#5CB985',
  lowRisk: '#78D09E',
  moderate: '#E8A838',
  high: '#E08A4A',
  severe: '#E06060',
  critical: '#CC4545',

  textPrimary: '#E8ECF1',
  textSecondary: '#9BA4B3',
  textTertiary: '#6B7385',
  textMuted: '#4D5566',

  border: '#2A2F38',
  borderLight: '#363C47',

  gradientPrimary: ['#7C6AEF', '#9B6AEF'] as const,
  gradientAccent: ['#4ECDC4', '#7C6AEF'] as const,
  gradientDanger: ['#E06060', '#E08A4A'] as const,
  gradientSafe: ['#5CB985', '#4ECDC4'] as const,
  gradientDark: ['#121418', '#1A1D23'] as const,

  overlay: 'rgba(0, 0, 0, 0.55)',
  glassBackground: 'rgba(37, 41, 48, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
};

export const LightColors: typeof DarkColors = {
  background: '#F5F6FA',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#EDF0F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  primary: '#7C6AEF',
  primaryLight: '#9B8DF5',
  primaryDark: '#6350D8',

  accent: '#4ECDC4',
  accentLight: '#6FE0D8',

  success: '#5CB985',
  successLight: '#78D09E',
  successBg: 'rgba(92, 185, 133, 0.08)',

  warning: '#E8A838',
  warningLight: '#F0BD5C',
  warningBg: 'rgba(232, 168, 56, 0.08)',

  danger: '#E06060',
  dangerLight: '#EB8585',
  dangerBg: 'rgba(224, 96, 96, 0.08)',

  safe: '#5CB985',
  lowRisk: '#78D09E',
  moderate: '#E8A838',
  high: '#E08A4A',
  severe: '#E06060',
  critical: '#CC4545',

  textPrimary: '#1A1D28',
  textSecondary: '#5A6378',
  textTertiary: '#8891A5',
  textMuted: '#B5BDD0',

  border: '#E4E8F1',
  borderLight: '#D0D6E3',

  gradientPrimary: ['#7C6AEF', '#9B6AEF'] as const,
  gradientAccent: ['#4ECDC4', '#7C6AEF'] as const,
  gradientDanger: ['#E06060', '#E08A4A'] as const,
  gradientSafe: ['#5CB985', '#4ECDC4'] as const,
  gradientDark: ['#F5F6FA', '#ffffffff'] as const,

  overlay: 'rgba(0, 0, 0, 0.25)',
  glassBackground: 'rgba(255, 255, 255, 0.80)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
};

export type ColorScheme = typeof DarkColors;

// Default export for static usage
export const Colors = DarkColors;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 80,
};

export const BorderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
};

export const FontSizes = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32, display: 40,
};

export const FontWeights = {
  regular: '400' as const, medium: '500' as const, semibold: '600' as const,
  bold: '700' as const, extrabold: '800' as const,
};

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 7 },
  glow: (color: string) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }),
};
