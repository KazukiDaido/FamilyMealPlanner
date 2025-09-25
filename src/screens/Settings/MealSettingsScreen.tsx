import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setMealSettings, addCustomMealType, updateCustomMealType, deleteCustomMealType } from '../../store/slices/mealSettingsSlice';
import { mealSettingsService } from '../../services/mealSettingsService';
import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';
import GradientBackground from '../../components/ui/GradientBackground';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { MealType, CustomMealType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const MealSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { settings } = useSelector((state: RootState) => state.mealSettings);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isCustomMealModalVisible, setIsCustomMealModalVisible] = useState(false);
  const [editingCustomMeal, setEditingCustomMeal] = useState<CustomMealType | null>(null);
  const [customMealName, setCustomMealName] = useState('');
  const [customMealEmoji, setCustomMealEmoji] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApplyPreset = (preset: 'dinnerOnly' | 'threeMeals' | 'threeMealsAndBento') => {
    const newSettings = mealSettingsService.applyPreset(preset);
    setLocalSettings(newSettings);
    dispatch(setMealSettings(newSettings));
  };

  const handleToggleMealType = (mealType: MealType) => {
    try {
      const newSettings = mealSettingsService.toggleMealType(localSettings, mealType);
      setLocalSettings(newSettings);
      dispatch(setMealSettings(newSettings));
    } catch (error: any) {
      Alert.alert('エラー', error.message);
    }
  };

  const handleAddCustomMeal = () => {
    if (!customMealName.trim() || !customMealEmoji.trim()) {
      Alert.alert('エラー', '名前と絵文字を入力してください。');
      return;
    }
    try {
      const newSettings = mealSettingsService.addCustomMealType(localSettings, customMealName.trim(), customMealEmoji.trim());
      setLocalSettings(newSettings);
      dispatch(setMealSettings(newSettings));
      setIsCustomMealModalVisible(false);
      setCustomMealName('');
      setCustomMealEmoji('');
    } catch (error: any) {
      Alert.alert('エラー', error.message);
    }
  };

  const handleUpdateCustomMeal = () => {
    if (!editingCustomMeal || !customMealName.trim() || !customMealEmoji.trim()) {
      Alert.alert('エラー', '名前と絵文字を入力してください。');
      return;
    }
    try {
      const updatedMeal = { ...editingCustomMeal, name: customMealName.trim(), emoji: customMealEmoji.trim() };
      const newSettings = mealSettingsService.updateCustomMealType(localSettings, updatedMeal);
      setLocalSettings(newSettings);
      dispatch(setMealSettings(newSettings));
      setIsCustomMealModalVisible(false);
      setEditingCustomMeal(null);
      setCustomMealName('');
      setCustomMealEmoji('');
    } catch (error: any) {
      Alert.alert('エラー', error.message);
    }
  };

  const handleDeleteCustomMeal = (mealId: string) => {
    Alert.alert(
      'カスタム食事を削除',
      'このカスタム食事タイプを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            try {
              const newSettings = mealSettingsService.deleteCustomMealType(localSettings, mealId);
              setLocalSettings(newSettings);
              dispatch(setMealSettings(newSettings));
            } catch (error: any) {
              Alert.alert('エラー', error.message);
            }
          },
        },
      ]
    );
  };

  const openEditCustomMealModal = (meal: CustomMealType) => {
    setEditingCustomMeal(meal);
    setCustomMealName(meal.name);
    setCustomMealEmoji(meal.emoji);
    setIsCustomMealModalVisible(true);
  };

  const mealTypeLabels: { [key in MealType]: string } = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: 'おやつ',
    bento: 'お弁当',
    custom: 'カスタム', // これは表示しないが型定義のため
  };

  const getMealTypeEmoji = (mealType: MealType | CustomMealType) => {
    if (typeof mealType === 'string') {
      switch (mealType) {
        case 'breakfast': return '🍳';
        case 'lunch': return '🥪';
        case 'dinner': return '🍜';
        case 'snack': return '🍪';
        case 'bento': return '🍱';
        default: return '🍽️';
      }
    }
    return mealType.emoji;
  };

  const getMealTypeName = (mealType: MealType | CustomMealType) => {
    if (typeof mealType === 'string') {
      return mealTypeLabels[mealType];
    }
    return mealType.name;
  };

  const orderedMealTypes = mealSettingsService.getOrderedMealTypes(localSettings);

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statusBar} />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>食事設定</Text>
        </View>

        <Card variant="elevated" padding="large" style={styles.card}>
          <Text style={styles.cardTitle}>クイック設定</Text>
          <Text style={styles.cardSubtitle}>よく使うパターンをワンタップで設定</Text>
          <View style={styles.presetButtons}>
            <Button
              title="夕食のみ"
              onPress={() => handleApplyPreset('dinnerOnly')}
              variant={localSettings.enabledMealTypes.length === 1 && localSettings.enabledMealTypes[0] === 'dinner' ? 'primary' : 'secondary'}
              size="small"
            />
            <Button
              title="3食管理"
              onPress={() => handleApplyPreset('threeMeals')}
              variant={localSettings.enabledMealTypes.includes('breakfast') && localSettings.enabledMealTypes.includes('lunch') && localSettings.enabledMealTypes.includes('dinner') && localSettings.enabledMealTypes.length === 3 ? 'primary' : 'secondary'}
              size="small"
            />
            <Button
              title="3食＋お弁当"
              onPress={() => handleApplyPreset('threeMealsAndBento')}
              variant={localSettings.enabledMealTypes.includes('bento') && localSettings.enabledMealTypes.length === 4 ? 'primary' : 'secondary'}
              size="small"
            />
          </View>
        </Card>

        <Card variant="default" padding="large" style={styles.card}>
          <Text style={styles.cardTitle}>個別設定</Text>
          <Text style={styles.cardSubtitle}>表示したい食事タイプを細かく設定</Text>
          {['breakfast', 'lunch', 'dinner', 'snack', 'bento'].map((type: MealType) => (
            <View key={type} style={styles.settingItem}>
              <Text style={styles.settingItemText}>{getMealTypeEmoji(type)} {mealTypeLabels[type]}</Text>
              <Switch
                value={localSettings.enabledMealTypes.includes(type)}
                onValueChange={() => handleToggleMealType(type)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={localSettings.enabledMealTypes.includes(type) ? colors.primary : colors.textTertiary}
              />
            </View>
          ))}
        </Card>

        <Card variant="default" padding="large" style={styles.card}>
          <Text style={styles.cardTitle}>カスタム食事タイプ</Text>
          <Text style={styles.cardSubtitle}>家族独自の食事タイプを追加できます</Text>
          {localSettings.customMealTypes.map(meal => (
            <View key={meal.id} style={styles.customMealItem}>
              <Text style={styles.settingItemText}>{meal.emoji} {meal.name}</Text>
              <View style={styles.customMealActions}>
                <TouchableOpacity onPress={() => openEditCustomMealModal(meal)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>編集</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCustomMeal(meal.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Button
            title="カスタム食事タイプを追加"
            onPress={() => {
              setEditingCustomMeal(null);
              setCustomMealName('');
              setCustomMealEmoji('');
              setIsCustomMealModalVisible(true);
            }}
            variant="secondary"
            size="small"
            style={styles.addCustomButton}
          />
        </Card>

        <Card variant="default" padding="large" style={styles.card}>
          <Text style={styles.cardTitle}>現在の設定サマリー</Text>
          <Text style={styles.cardSubtitle}>有効な食事タイプ</Text>
          <View style={styles.summaryList}>
            {orderedMealTypes.map((meal, index) => (
              <Text key={index} style={styles.summaryItemText}>
                {getMealTypeEmoji(meal)} {getMealTypeName(meal)}
              </Text>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Custom Meal Modal */}
      <Modal
        visible={isCustomMealModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCustomMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingCustomMeal ? 'カスタム食事を編集' : 'カスタム食事を追加'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="食事の名前 (例: 夜食)"
              value={customMealName}
              onChangeText={setCustomMealName}
            />
            <TextInput
              style={styles.textInput}
              placeholder="絵文字 (例: 🌙)"
              value={customMealEmoji}
              onChangeText={setCustomMealEmoji}
              maxLength={2} // 絵文字は通常1-2文字
            />
            <View style={styles.modalButtons}>
              <Button title="キャンセル" onPress={() => setIsCustomMealModalVisible(false)} variant="secondary" />
              <Button title={editingCustomMeal ? '保存' : '追加'} onPress={editingCustomMeal ? handleUpdateCustomMeal : handleAddCustomMeal} />
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120, // タブバーの高さを考慮
  },
  statusBar: {
    height: 44, // ステータスバーの高さ
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: spacing.xl, // 戻るボタン分のバランス調整
  },
  card: {
    marginHorizontal: spacing.lg,
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
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemText: {
    ...typography.body,
    color: colors.text,
  },
  customMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customMealActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...typography.caption1,
    color: colors.secondaryDark,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    ...typography.caption1,
    color: colors.textDark,
    fontWeight: '600',
  },
  addCustomButton: {
    marginTop: spacing.md,
  },
  summaryList: {
    gap: spacing.xs,
  },
  summaryItemText: {
    ...typography.body,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    ...typography.title3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

export default MealSettingsScreen;