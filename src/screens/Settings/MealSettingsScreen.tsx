import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setEnabledMealTypes, 
  setDefaultMealTypes, 
  addCustomMealType, 
  removeCustomMealType,
  applyPreset 
} from '../../store/slices/mealSettingsSlice';
import { MealType, CustomMealType } from '../../types';
import { MealSettingsService, MEAL_TYPE_PRESETS, DEFAULT_MEAL_TYPES } from '../../services/mealSettingsService';
import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientBackground from '../../components/ui/GradientBackground';
import { CheckIcon, XIcon } from '../../components/ui/Icons';

const MealSettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state: RootState) => state.mealSettings);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍽️');

  const toggleMealType = (mealType: MealType) => {
    const isEnabled = settings.enabledMealTypes.includes(mealType);
    
    if (isEnabled) {
      // 最低1つは残す必要がある
      if (settings.enabledMealTypes.length <= 1) {
        Alert.alert('エラー', '最低1つの食事タイプを有効にしてください。');
        return;
      }
      
      const newEnabledTypes = settings.enabledMealTypes.filter(mt => mt !== mealType);
      dispatch(setEnabledMealTypes(newEnabledTypes));
    } else {
      const newEnabledTypes = [...settings.enabledMealTypes, mealType];
      dispatch(setEnabledMealTypes(newEnabledTypes));
    }
  };

  const toggleDefaultMealType = (mealType: MealType) => {
    const isDefault = settings.defaultMealTypes.includes(mealType);
    
    if (isDefault) {
      const newDefaultTypes = settings.defaultMealTypes.filter(mt => mt !== mealType);
      dispatch(setDefaultMealTypes(newDefaultTypes));
    } else {
      const newDefaultTypes = [...settings.defaultMealTypes, mealType];
      dispatch(setDefaultMealTypes(newDefaultTypes));
    }
  };

  const handleAddCustomMealType = () => {
    if (!customName.trim()) {
      Alert.alert('エラー', '食事名を入力してください。');
      return;
    }

    const newCustomType = MealSettingsService.createCustomMealType(
      customName.trim(),
      customEmoji,
      undefined,
      settings.customMealTypes
    );

    dispatch(addCustomMealType(newCustomType));
    setCustomName('');
    setCustomEmoji('🍽️');
    setShowCustomForm(false);
  };

  const handleRemoveCustomMealType = (customTypeId: string) => {
    Alert.alert(
      '確認',
      'このカスタム食事タイプを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => dispatch(removeCustomMealType(customTypeId))
        }
      ]
    );
  };

  const handleApplyPreset = (presetKey: keyof typeof MEAL_TYPE_PRESETS) => {
    const preset = MEAL_TYPE_PRESETS[presetKey];
    Alert.alert(
      '確認',
      `「${preset.name}」プリセットを適用しますか？現在の設定は上書きされます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '適用', 
          onPress: () => dispatch(applyPreset(presetKey))
        }
      ]
    );
  };

  const getMealTypeDisplayName = (mealType: MealType): string => {
    return MealSettingsService.getMealTypeName(mealType, settings.customMealTypes);
  };

  const getMealTypeDisplayEmoji = (mealType: MealType): string => {
    return MealSettingsService.getMealTypeEmoji(mealType, undefined, settings.customMealTypes);
  };

  // 表示用にソートされた食事タイプ
  const sortedMealTypes = MealSettingsService.sortMealTypes(
    Object.keys(DEFAULT_MEAL_TYPES) as MealType[],
    settings.customMealTypes
  ).filter(mt => mt !== 'custom' || settings.customMealTypes.length > 0);

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>食事設定</Text>
          <Text style={styles.subtitle}>管理したい食事の種類を選択してください</Text>
        </View>

        {/* Quick Presets */}
        <Card variant="elevated" padding="medium" style={styles.card}>
          <Text style={styles.cardTitle}>クイック設定</Text>
          <Text style={styles.cardSubtitle}>よく使われる設定を選択できます</Text>
          
          <View style={styles.presetGrid}>
            {Object.entries(MEAL_TYPE_PRESETS).map(([key, preset]) => (
              <TouchableOpacity
                key={key}
                style={styles.presetButton}
                onPress={() => handleApplyPreset(key as keyof typeof MEAL_TYPE_PRESETS)}
              >
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetDescription}>{preset.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Meal Type Selection */}
        <Card variant="default" padding="medium" style={styles.card}>
          <Text style={styles.cardTitle}>食事タイプの選択</Text>
          <Text style={styles.cardSubtitle}>チェックを入れた食事タイプが有効になります</Text>
          
          <View style={styles.mealTypeList}>
            {sortedMealTypes.map(mealType => (
              <View key={mealType} style={styles.mealTypeItem}>
                <TouchableOpacity
                  style={styles.mealTypeButton}
                  onPress={() => toggleMealType(mealType)}
                >
                  <View style={styles.mealTypeInfo}>
                    <Text style={styles.mealTypeEmoji}>
                      {getMealTypeDisplayEmoji(mealType)}
                    </Text>
                    <Text style={styles.mealTypeName}>
                      {getMealTypeDisplayName(mealType)}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.checkbox,
                    settings.enabledMealTypes.includes(mealType) && styles.checkboxChecked
                  ]}>
                    {settings.enabledMealTypes.includes(mealType) && (
                      <CheckIcon size={16} color={colors.textDark} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Default toggle */}
                {settings.enabledMealTypes.includes(mealType) && (
                  <TouchableOpacity
                    style={styles.defaultToggle}
                    onPress={() => toggleDefaultMealType(mealType)}
                  >
                    <Text style={[
                      styles.defaultToggleText,
                      settings.defaultMealTypes.includes(mealType) && styles.defaultToggleTextActive
                    ]}>
                      {settings.defaultMealTypes.includes(mealType) ? 'デフォルト表示' : 'デフォルト非表示'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Custom Meal Types */}
        <Card variant="default" padding="medium" style={styles.card}>
          <Text style={styles.cardTitle}>カスタム食事タイプ</Text>
          <Text style={styles.cardSubtitle}>独自の食事タイプを追加できます</Text>
          
          {settings.customMealTypes.map(customType => (
            <View key={customType.id} style={styles.customTypeItem}>
              <View style={styles.customTypeInfo}>
                <Text style={styles.customTypeEmoji}>{customType.emoji}</Text>
                <Text style={styles.customTypeName}>{customType.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveCustomMealType(customType.id)}
              >
                <XIcon size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {showCustomForm ? (
            <View style={styles.customForm}>
              <View style={styles.formRow}>
                <TextInput
                  style={styles.emojiInput}
                  value={customEmoji}
                  onChangeText={setCustomEmoji}
                  placeholder="🍽️"
                  maxLength={2}
                />
                <TextInput
                  style={styles.nameInput}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="食事名を入力"
                  returnKeyType="done"
                  onSubmitEditing={handleAddCustomMealType}
                />
              </View>
              <View style={styles.formButtons}>
                <Button
                  title="キャンセル"
                  onPress={() => {
                    setShowCustomForm(false);
                    setCustomName('');
                    setCustomEmoji('🍽️');
                  }}
                  variant="secondary"
                  size="small"
                />
                <Button
                  title="追加"
                  onPress={handleAddCustomMealType}
                  variant="primary"
                  size="small"
                />
              </View>
            </View>
          ) : (
            <Button
              title="カスタム食事タイプを追加"
              onPress={() => setShowCustomForm(true)}
              variant="secondary"
              fullWidth
            />
          )}
        </Card>

        {/* Current Settings Summary */}
        <Card variant="default" padding="medium" style={styles.card}>
          <Text style={styles.cardTitle}>現在の設定</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>有効な食事タイプ:</Text>
            <Text style={styles.summaryValue}>{settings.enabledMealTypes.length}個</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>デフォルト表示:</Text>
            <Text style={styles.summaryValue}>{settings.defaultMealTypes.length}個</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>カスタムタイプ:</Text>
            <Text style={styles.summaryValue}>{settings.customMealTypes.length}個</Text>
          </View>
        </Card>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  presetGrid: {
    gap: spacing.sm,
  },
  presetButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  presetDescription: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  mealTypeList: {
    gap: spacing.sm,
  },
  mealTypeItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  mealTypeName: {
    ...typography.callout,
    color: colors.text,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  defaultToggle: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xl,
  },
  defaultToggleText: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  defaultToggleTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  customTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  customTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customTypeEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  customTypeName: {
    ...typography.callout,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  customForm: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  emojiInput: {
    width: 60,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    ...typography.callout,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '600',
  },
});

export default MealSettingsScreen;
