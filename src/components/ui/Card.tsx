import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, shadows } from '../../styles/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  
  // Variants
  default: {
    ...shadows.small,
  },
  elevated: {
    ...shadows.large,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  
  // Padding variants
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
});

export default Card;
