import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/designSystem';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  style?: any;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  colors: gradientColors = colors.backgroundGradient,
  style 
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
