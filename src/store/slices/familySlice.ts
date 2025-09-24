import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Family, User } from '../../types';

interface FamilyState {
  currentFamily: Family | null;
  members: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FamilyState = {
  currentFamily: null,
  members: [],
  isLoading: false,
  error: null,
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily: (state, action: PayloadAction<Family>) => {
      state.currentFamily = action.payload;
      state.members = action.payload.members;
      state.error = null;
    },
    clearFamily: (state) => {
      state.currentFamily = null;
      state.members = [];
      state.error = null;
    },
    addMember: (state, action: PayloadAction<User>) => {
      state.members.push(action.payload);
      if (state.currentFamily) {
        state.currentFamily.members = state.members;
      }
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(member => member.id !== action.payload);
      if (state.currentFamily) {
        state.currentFamily.members = state.members;
      }
    },
    updateMember: (state, action: PayloadAction<User>) => {
      const index = state.members.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
        if (state.currentFamily) {
          state.currentFamily.members = state.members;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateSubscriptionPlan: (state, action: PayloadAction<'free' | 'family' | 'premium'>) => {
      if (state.currentFamily) {
        state.currentFamily.subscriptionPlan = action.payload;
      }
    },
  },
});

export const {
  setFamily,
  clearFamily,
  addMember,
  removeMember,
  updateMember,
  setLoading,
  setError,
  updateSubscriptionPlan,
} = familySlice.actions;
export default familySlice.reducer;

