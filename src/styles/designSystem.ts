// Modern Pastel Design System
export const colors = {
  // Primary - Soft Mint Green
  primary: '#A8E6CF',      // Pastel mint
  primaryDark: '#7DD3AE',
  primaryLight: '#C4F2E0',
  
  // Secondary - Lavender
  secondary: '#D4B5F7',    // Soft lavender
  secondaryLight: '#E6D0FF',
  secondaryDark: '#C19EE0',
  
  // Accent - Peach
  accent: '#FFB3BA',       // Soft peach
  accentLight: '#FFD1D6',
  accentDark: '#FF9BA5',
  
  // Semantic - Pastel versions
  success: '#A8E6CF',      // Mint green
  warning: '#FFD93D',      // Soft yellow
  error: '#FFB3BA',        // Soft pink/coral
  
  // Neutral - Clean pastels
  background: '#FEFEFE',   // Pure white
  backgroundGradient: ['#F8F9FF', '#F0F4FF'], // Soft blue-white gradient
  backgroundDark: '#2C2C2E',
  
  surface: '#FFFFFF',
  surfaceDark: '#1C1C1E',
  
  // Text - Soft but readable
  text: '#2C2C2E',         // Soft dark gray
  textSecondary: '#6C6C70',
  textTertiary: '#A1A1A6',
  
  textDark: '#FFFFFF',
  textSecondaryDark: '#E5E5E7',
  textTertiaryDark: '#A1A1A6',
  
  // Attendance - Pastel states
  attendance: {
    present: '#A8E6CF',    // Mint green
    absent: '#FFB3BA',     // Soft pink
    unknown: '#E8E8ED',    // Light gray
  },
  
  // Borders
  border: '#E5E5E7',
  borderDark: '#38383A',
  
  // Subtle overlays
  overlay: 'rgba(0, 0, 0, 0.05)',
  overlayDark: 'rgba(255, 255, 255, 0.1)',
};

export const typography = {
  // iOS Font System
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// iOS-style component styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.small,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
};

export const cardStyles = {
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.large,
  },
};
