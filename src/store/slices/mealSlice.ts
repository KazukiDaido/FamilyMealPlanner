import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MealSchedule } from '../../types';

interface MealState {
  schedules: MealSchedule[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MealState = {
  schedules: [],
  isLoading: false,
  error: null,
};

const mealSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    setSchedules: (state, action: PayloadAction<MealSchedule[]>) => {
      state.schedules = action.payload;
      state.error = null;
    },
    addSchedule: (state, action: PayloadAction<MealSchedule>) => {
      state.schedules.push(action.payload);
    },
    updateSchedule: (state, action: PayloadAction<MealSchedule>) => {
      const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    deleteSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
    },
    getSchedulesByDate: (state, action: PayloadAction<string>) => {
      // このアクションは実際のフィルタリングはコンポーネント側で行う
      // ここでは単純にアクションを受け取るだけ
    },
    getSchedulesByDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      // このアクションは実際のフィルタリングはコンポーネント側で行う
      // ここでは単純にアクションを受け取るだけ
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
  setSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDate,
  getSchedulesByDateRange,
  setLoading,
  setError,
  clearError,
} = mealSlice.actions;
export default mealSlice.reducer;

