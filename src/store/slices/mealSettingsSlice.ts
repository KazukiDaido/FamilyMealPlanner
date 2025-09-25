import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MealType, CustomMealType, FamilyMealSettings } from '../../types';
import { MealSettingsService } from '../../services/mealSettingsService';

interface MealSettingsState {
  settings: FamilyMealSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: MealSettingsState = {
  settings: MealSettingsService.getDefaultSettings(),
  isLoading: false,
  error: null,
};

const mealSettingsSlice = createSlice({
  name: 'mealSettings',
  initialState,
  reducers: {
    // 設定全体を更新
    setMealSettings: (state, action: PayloadAction<FamilyMealSettings>) => {
      state.settings = action.payload;
      state.error = null;
    },

    // 有効な食事タイプを更新
    setEnabledMealTypes: (state, action: PayloadAction<MealType[]>) => {
      state.settings.enabledMealTypes = action.payload;
      
      // デフォルト食事タイプから無効になったものを削除
      state.settings.defaultMealTypes = state.settings.defaultMealTypes.filter(
        mealType => action.payload.includes(mealType)
      );
    },

    // デフォルト食事タイプを更新
    setDefaultMealTypes: (state, action: PayloadAction<MealType[]>) => {
      // 有効な食事タイプの中からのみ選択可能
      state.settings.defaultMealTypes = action.payload.filter(
        mealType => state.settings.enabledMealTypes.includes(mealType)
      );
    },

    // 食事タイプを追加
    addMealType: (state, action: PayloadAction<MealType>) => {
      if (!state.settings.enabledMealTypes.includes(action.payload)) {
        state.settings.enabledMealTypes.push(action.payload);
      }
    },

    // 食事タイプを削除
    removeMealType: (state, action: PayloadAction<MealType>) => {
      state.settings.enabledMealTypes = state.settings.enabledMealTypes.filter(
        mealType => mealType !== action.payload
      );
      state.settings.defaultMealTypes = state.settings.defaultMealTypes.filter(
        mealType => mealType !== action.payload
      );
    },

    // カスタム食事タイプを追加
    addCustomMealType: (state, action: PayloadAction<CustomMealType>) => {
      state.settings.customMealTypes.push(action.payload);
      
      // カスタムタイプが追加されたら、customを有効にする
      if (!state.settings.enabledMealTypes.includes('custom')) {
        state.settings.enabledMealTypes.push('custom');
      }
    },

    // カスタム食事タイプを更新
    updateCustomMealType: (state, action: PayloadAction<CustomMealType>) => {
      const index = state.settings.customMealTypes.findIndex(
        ct => ct.id === action.payload.id
      );
      if (index !== -1) {
        state.settings.customMealTypes[index] = action.payload;
      }
    },

    // カスタム食事タイプを削除
    removeCustomMealType: (state, action: PayloadAction<string>) => {
      state.settings.customMealTypes = state.settings.customMealTypes.filter(
        ct => ct.id !== action.payload
      );
      
      // カスタムタイプがすべて削除されたら、customを無効にする
      if (state.settings.customMealTypes.length === 0) {
        state.settings.enabledMealTypes = state.settings.enabledMealTypes.filter(
          mealType => mealType !== 'custom'
        );
        state.settings.defaultMealTypes = state.settings.defaultMealTypes.filter(
          mealType => mealType !== 'custom'
        );
      }
    },

    // プリセットを適用
    applyPreset: (state, action: PayloadAction<keyof typeof import('../../services/mealSettingsService').MEAL_TYPE_PRESETS>) => {
      state.settings = MealSettingsService.applyPreset(action.payload);
    },

    // ローディング状態
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // エラー状態
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // 設定をリセット
    resetSettings: (state) => {
      state.settings = MealSettingsService.getDefaultSettings();
      state.error = null;
    },
  },
});

export const {
  setMealSettings,
  setEnabledMealTypes,
  setDefaultMealTypes,
  addMealType,
  removeMealType,
  addCustomMealType,
  updateCustomMealType,
  removeCustomMealType,
  applyPreset,
  setLoading,
  setError,
  clearError,
  resetSettings,
} = mealSettingsSlice.actions;

export default mealSettingsSlice.reducer;
