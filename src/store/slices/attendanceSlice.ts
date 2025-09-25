import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceRecord, AvailabilityStatus } from '../../types';

interface AttendanceState {
  records: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  isLoading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload;
      state.error = null;
    },
    addOrUpdateAttendance: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(
        (record) =>
          record.userId === action.payload.userId &&
          record.date === action.payload.date &&
          record.mealType === action.payload.mealType
      );
      if (index !== -1) {
        state.records[index] = action.payload;
      } else {
        state.records.push(action.payload);
      }
    },
    deleteAttendance: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter((record) => record.id !== action.payload);
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
    // 既存のtoggleAttendance関数も保持（互換性のため）
    toggleAttendance: (
      state,
      action: PayloadAction<{ date: string; userId: string }>
    ) => {
      const index = state.records.findIndex(
        (record) =>
          record.userId === action.payload.userId &&
          record.date === action.payload.date &&
          record.mealType === 'dinner'
      );
      
      if (index !== -1) {
        // 既存のレコードを更新
        const currentStatus = state.records[index].status;
        state.records[index] = {
          ...state.records[index],
          status: currentStatus === 'present' ? 'absent' : 'present',
          updatedAt: new Date().toISOString(),
        };
      } else {
        // 新しいレコードを作成
        state.records.push({
          id: `${action.payload.date}-${action.payload.userId}-dinner`,
          userId: action.payload.userId,
          mealScheduleId: '',
          date: action.payload.date,
          mealType: 'dinner',
          status: 'absent',
          updatedAt: new Date().toISOString(),
        });
      }
    },
  },
});

export const {
  setAttendanceRecords,
  addOrUpdateAttendance,
  deleteAttendance,
  setLoading,
  setError,
  clearError,
  toggleAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;