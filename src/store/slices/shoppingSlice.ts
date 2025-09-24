import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingList, ShoppingItem } from '../../types';

interface ShoppingState {
  currentList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShoppingState = {
  currentList: null,
  isLoading: false,
  error: null,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setShoppingList: (state, action: PayloadAction<ShoppingList>) => {
      state.currentList = action.payload;
      state.error = null;
    },
    clearShoppingList: (state) => {
      state.currentList = null;
      state.error = null;
    },
    addItem: (state, action: PayloadAction<ShoppingItem>) => {
      if (state.currentList) {
        state.currentList.items.push(action.payload);
        state.currentList.updatedAt = new Date();
      }
    },
    updateItem: (state, action: PayloadAction<ShoppingItem>) => {
      if (state.currentList) {
        const index = state.currentList.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.currentList.items[index] = action.payload;
          state.currentList.updatedAt = new Date();
        }
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      if (state.currentList) {
        state.currentList.items = state.currentList.items.filter(item => item.id !== action.payload);
        state.currentList.updatedAt = new Date();
      }
    },
    toggleItemCompletion: (state, action: PayloadAction<string>) => {
      if (state.currentList) {
        const item = state.currentList.items.find(item => item.id === action.payload);
        if (item) {
          item.isCompleted = !item.isCompleted;
          state.currentList.updatedAt = new Date();
        }
      }
    },
    clearCompletedItems: (state) => {
      if (state.currentList) {
        state.currentList.items = state.currentList.items.filter(item => !item.isCompleted);
        state.currentList.updatedAt = new Date();
      }
    },
    generateFromMealSchedules: (state, action: PayloadAction<string[]>) => {
      // 食事スケジュールから買い物リストを生成
      // この実装は後で詳細化
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setShoppingList,
  clearShoppingList,
  addItem,
  updateItem,
  deleteItem,
  toggleItemCompletion,
  clearCompletedItems,
  generateFromMealSchedules,
  setLoading,
  setError,
  clearError,
} = shoppingSlice.actions;
export default shoppingSlice.reducer;

