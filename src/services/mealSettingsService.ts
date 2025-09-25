import { MealType, CustomMealType, FamilyMealSettings } from '../types';

/**
 * 食事設定を管理するサービス
 */

// デフォルトの食事タイプ設定
export const DEFAULT_MEAL_TYPES: { [key in MealType]: { name: string; emoji: string; order: number } } = {
  breakfast: { name: '朝食', emoji: '🌅', order: 1 },
  lunch: { name: '昼食', emoji: '☀️', order: 2 },
  dinner: { name: '夕食', emoji: '🌙', order: 3 },
  snack: { name: 'おやつ', emoji: '🍪', order: 4 },
  bento: { name: 'お弁当', emoji: '🍱', order: 5 },
  custom: { name: 'カスタム', emoji: '⭐', order: 6 },
};

// よく使われる食事タイプのプリセット
export const MEAL_TYPE_PRESETS = {
  dinnerOnly: {
    name: '夕食のみ',
    description: '夕食の準備だけを管理',
    enabledMealTypes: ['dinner'] as MealType[],
    defaultMealTypes: ['dinner'] as MealType[],
    customMealTypes: [] as CustomMealType[],
  },
  threeMeals: {
    name: '3食管理',
    description: '朝食・昼食・夕食を管理',
    enabledMealTypes: ['breakfast', 'lunch', 'dinner'] as MealType[],
    defaultMealTypes: ['breakfast', 'lunch', 'dinner'] as MealType[],
    customMealTypes: [] as CustomMealType[],
  },
  withBento: {
    name: '3食+お弁当',
    description: '3食とお弁当の準備を管理',
    enabledMealTypes: ['breakfast', 'lunch', 'dinner', 'bento'] as MealType[],
    defaultMealTypes: ['breakfast', 'lunch', 'dinner', 'bento'] as MealType[],
    customMealTypes: [] as CustomMealType[],
  },
  withSnack: {
    name: '3食+おやつ',
    description: '3食とおやつを管理',
    enabledMealTypes: ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[],
    defaultMealTypes: ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[],
    customMealTypes: [] as CustomMealType[],
  },
  full: {
    name: 'フル管理',
    description: 'すべての食事を管理',
    enabledMealTypes: ['breakfast', 'lunch', 'dinner', 'snack', 'bento'] as MealType[],
    defaultMealTypes: ['breakfast', 'lunch', 'dinner'] as MealType[],
    customMealTypes: [] as CustomMealType[],
  },
};

export class MealSettingsService {
  /**
   * デフォルトの食事設定を取得
   */
  static getDefaultSettings(): FamilyMealSettings {
    return MEAL_TYPE_PRESETS.dinnerOnly;
  }

  /**
   * 食事タイプの表示名を取得
   */
  static getMealTypeName(mealType: MealType, customMealTypes: CustomMealType[] = []): string {
    if (mealType === 'custom') {
      return 'カスタム';
    }
    return DEFAULT_MEAL_TYPES[mealType]?.name || mealType;
  }

  /**
   * 食事タイプの絵文字を取得
   */
  static getMealTypeEmoji(mealType: MealType, customMealTypeId?: string, customMealTypes: CustomMealType[] = []): string {
    if (mealType === 'custom' && customMealTypeId) {
      const customType = customMealTypes.find(ct => ct.id === customMealTypeId);
      return customType?.emoji || '⭐';
    }
    return DEFAULT_MEAL_TYPES[mealType]?.emoji || '🍽️';
  }

  /**
   * 食事タイプの順序を取得
   */
  static getMealTypeOrder(mealType: MealType, customMealTypeId?: string, customMealTypes: CustomMealType[] = []): number {
    if (mealType === 'custom' && customMealTypeId) {
      const customType = customMealTypes.find(ct => ct.id === customMealTypeId);
      return customType?.order || 999;
    }
    return DEFAULT_MEAL_TYPES[mealType]?.order || 999;
  }

  /**
   * 食事タイプをソート
   */
  static sortMealTypes(
    mealTypes: MealType[], 
    customMealTypes: CustomMealType[] = []
  ): MealType[] {
    return mealTypes.sort((a, b) => {
      const orderA = this.getMealTypeOrder(a, undefined, customMealTypes);
      const orderB = this.getMealTypeOrder(b, undefined, customMealTypes);
      return orderA - orderB;
    });
  }

  /**
   * カスタム食事タイプを作成
   */
  static createCustomMealType(
    name: string, 
    emoji: string, 
    order?: number,
    existingCustomTypes: CustomMealType[] = []
  ): CustomMealType {
    const maxOrder = existingCustomTypes.reduce((max, ct) => Math.max(max, ct.order), 10);
    
    return {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      emoji,
      order: order || (maxOrder + 1),
      isActive: true,
    };
  }

  /**
   * プリセットから設定を適用
   */
  static applyPreset(presetKey: keyof typeof MEAL_TYPE_PRESETS): FamilyMealSettings {
    const preset = MEAL_TYPE_PRESETS[presetKey];
    return {
      enabledMealTypes: [...preset.enabledMealTypes],
      defaultMealTypes: [...preset.defaultMealTypes],
      customMealTypes: [...preset.customMealTypes],
    };
  }

  /**
   * 食事タイプの有効/無効を切り替える
   */
  static toggleMealType(currentSettings: FamilyMealSettings, mealType: MealType): FamilyMealSettings {
    const newEnabled = currentSettings.enabledMealTypes.includes(mealType)
      ? currentSettings.enabledMealTypes.filter(m => m !== mealType)
      : [...currentSettings.enabledMealTypes, mealType];

    if (newEnabled.length === 0) {
      throw new Error('少なくとも1つの食事タイプを有効にする必要があります。');
    }

    return { ...currentSettings, enabledMealTypes: newEnabled };
  }

  /**
   * カスタム食事タイプを追加
   */
  static addCustomMealType(currentSettings: FamilyMealSettings, name: string, emoji: string): FamilyMealSettings {
    const newCustomMeal: CustomMealType = {
      id: `custom_${Date.now()}`,
      name,
      emoji,
      order: currentSettings.customMealTypes.length + 100,
      isActive: true,
    };
    return {
      ...currentSettings,
      customMealTypes: [...currentSettings.customMealTypes, newCustomMeal],
      enabledMealTypes: [...currentSettings.enabledMealTypes, 'custom'],
    };
  }

  /**
   * カスタム食事タイプを更新
   */
  static updateCustomMealType(currentSettings: FamilyMealSettings, updatedMeal: CustomMealType): FamilyMealSettings {
    const updatedCustoms = currentSettings.customMealTypes.map(meal =>
      meal.id === updatedMeal.id ? updatedMeal : meal
    );
    return { ...currentSettings, customMealTypes: updatedCustoms };
  }

  /**
   * カスタム食事タイプを削除
   */
  static deleteCustomMealType(currentSettings: FamilyMealSettings, mealId: string): FamilyMealSettings {
    const filteredCustoms = currentSettings.customMealTypes.filter(meal => meal.id !== mealId);
    return {
      ...currentSettings,
      customMealTypes: filteredCustoms,
    };
  }

  /**
   * 有効な食事タイプを順序付きで取得
   */
  static getOrderedMealTypes(settings: FamilyMealSettings): Array<{ id: string; name: string; emoji: string; order: number; isActive: boolean }> {
    const standardMeals = [
      { id: 'breakfast', name: '朝食', emoji: '🍳', order: 1, isActive: true },
      { id: 'lunch', name: '昼食', emoji: '🥪', order: 2, isActive: true },
      { id: 'dinner', name: '夕食', emoji: '🍜', order: 3, isActive: true },
      { id: 'snack', name: 'おやつ', emoji: '🍪', order: 4, isActive: true },
      { id: 'bento', name: 'お弁当', emoji: '🍱', order: 5, isActive: true },
    ].filter(meal => settings.enabledMealTypes.includes(meal.id as MealType));

    const customMeals = settings.customMealTypes.filter(meal => meal.isActive);

    return [...standardMeals, ...customMeals].sort((a, b) => a.order - b.order);
  }

  /**
   * 設定の妥当性をチェック
   */
  static validateSettings(settings: FamilyMealSettings): boolean {
    // 最低1つの食事タイプが有効である必要がある
    if (settings.enabledMealTypes.length === 0) {
      return false;
    }

    // デフォルト食事タイプは有効な食事タイプの中から選ばれている必要がある
    const invalidDefaults = settings.defaultMealTypes.filter(
      dt => !settings.enabledMealTypes.includes(dt)
    );
    if (invalidDefaults.length > 0) {
      return false;
    }

    return true;
  }
}

export { MealSettingsService as mealSettingsService };
