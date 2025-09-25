// Refined Design System - Natural & Sophisticated
export const colors = {
  // Primary - Sage Green
  primary: '#6B7C32',      // Natural sage
  primaryDark: '#4A5A1F',
  primaryLight: '#8FA047',
  
  // Secondary - Warm Brown
  secondary: '#8B6F47',    // Earthy brown
  secondaryLight: '#A6885B',
  secondaryDark: '#6B4E2F',
  
  // Accent - Soft Orange
  accent: '#D4A574',       // Warm beige
  accentLight: '#E6B882',
  accentDark: '#C1955F',
  
  // Semantic - Muted & Natural
  success: '#7BA05B',      // Forest green
  warning: '#D4A574',      // Warm beige
  error: '#B85450',        // Muted red
  
  // Neutral - Modern gradients
  background: '#F8F6F3',   // Fallback
  backgroundGradient: ['#FDFCFB', '#E2D1C3'], // Subtle warm gradient
  backgroundDark: '#2C2B28',
  
  surface: '#FFFFFF',
  surfaceDark: '#3A3834',
  
  // Text - Natural tones
  text: '#2C2B28',         // Dark brown-gray
  textSecondary: '#5A5956',
  textTertiary: '#8A8986',
  
  textDark: '#F8F6F3',
  textSecondaryDark: '#D4D2CF',
  textTertiaryDark: '#8A8986',
  
  // Attendance - Natural states
  attendance: {
    present: '#7BA05B',    // Forest green
    absent: '#B85450',     // Muted red
    unknown: '#8A8986',    // Warm gray
  },
  
  // Borders
  border: '#E0DED9',
  borderDark: '#4A4843',
  
  // Subtle overlays
  overlay: 'rgba(44, 43, 40, 0.1)',
  overlayDark: 'rgba(248, 246, 243, 0.1)',
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
