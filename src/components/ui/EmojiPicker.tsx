import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';

interface EmojiPickerProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

// 食事関連の絵文字セット
const MEAL_EMOJIS = [
  // 基本的な食事
  '🍽️', '🥄', '🍴', '🥢', '🍳', '🥚', '🧈', '🥞', '🧇', '🥓',
  
  // 朝食系
  '☕', '🥐', '🥯', '🍞', '🥖', '🧀', '🥛', '🍯', '🥣', '🥤',
  
  // 昼食・夕食系
  '🍜', '🍲', '🥘', '🍱', '🍙', '🍚', '🍛', '🍝', '🍕', '🌭',
  
  // おかず系
  '🥩', '🍖', '🍗', '🥚', '🍤', '🍣', '🍟', '🥗', '🥙', '🌮',
  
  // おやつ・デザート系
  '🍪', '🍰', '🧁', '🍩', '🍫', '🍬', '🍭', '🍮', '🍯', '🍎',
  
  // 飲み物系
  '🥤', '🧃', '☕', '🍵', '🧋', '🥛', '🍷', '🍺', '🥂', '🧊',
  
  // 時間・その他
  '🌅', '☀️', '🌙', '⭐', '🔥', '❄️', '💧', '🌿', '🎂', '🎉'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onEmojiSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>アイコンを選択</Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
      >
        {MEAL_EMOJIS.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.emojiButton,
              selectedEmoji === emoji && styles.selectedEmojiButton
            ]}
            onPress={() => onEmojiSelect(emoji)}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  scrollView: {
    maxHeight: 200, // 高さを制限してスクロール可能に
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2, // 少し余白を追加
  },
  selectedEmojiButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 20,
  },
});

export default EmojiPicker;
