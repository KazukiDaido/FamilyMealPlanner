import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography } from '../../styles/designSystem';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  name = '?',
  imageUri,
  size = 'medium',
  backgroundColor,
  textColor,
  style,
}) => {
  const avatarStyle = [
    styles.base,
    styles[size],
    { backgroundColor: backgroundColor || colors.primary },
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    { color: textColor || colors.textDark },
  ];

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={avatarStyle}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text style={textStyle}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  // Sizes
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 64,
    height: 64,
  },
  xlarge: {
    width: 96,
    height: 96,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    ...typography.caption1,
  },
  mediumText: {
    ...typography.callout,
  },
  largeText: {
    ...typography.headline,
  },
  xlargeText: {
    ...typography.title2,
  },
  
  // Image
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
