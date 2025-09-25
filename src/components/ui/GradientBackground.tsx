import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
  // Web環境ではCSS gradientを使用
  const webGradientStyle = Platform.OS === 'web' ? {
    background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
  } : {};

  return (
    <View
      style={[
        styles.container, 
        Platform.OS === 'web' ? webGradientStyle : { backgroundColor: gradientColors[0] },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
