import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attendance } from '../../types';

interface AttendanceState {
  items: Attendance[];
}

const initialState: AttendanceState = {
  items: [],
};

function keyOf(a: { date: string; userId: string }) {
  return `${a.date}:${a.userId}`;
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceForDay: (state, action: PayloadAction<Attendance>) => {
      const idx = state.items.findIndex(
        item => keyOf(item) === keyOf(action.payload)
      );
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    toggleAttendance: (
      state,
      action: PayloadAction<{ date: string; userId: string }>
    ) => {
      const idx = state.items.findIndex(
        item => item.date === action.payload.date && item.userId === action.payload.userId
      );
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          status: state.items[idx].status === 'need' ? 'skip' : 'need',
          updatedAt: new Date(),
        } as Attendance;
      } else {
        state.items.push({
          id: `${action.payload.date}-${action.payload.userId}`,
          date: action.payload.date,
          mealType: 'dinner',
          userId: action.payload.userId,
          status: 'skip',
          updatedAt: new Date(),
        } as Attendance);
      }
    },
  },
});

export const { setAttendanceForDay, toggleAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;


