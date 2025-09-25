import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { FirebaseUser } from '../../types/firebase';
import { AuthUser } from '../../services/authService';

interface UserState {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  firebaseUser: null,
  authUser: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 既存のローカルユーザー管理
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    
    // Firebase認証ユーザー管理
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.authUser = action.payload;
      state.isAuthenticated = !!action.payload;
      if (!action.payload) {
        state.firebaseUser = null;
      }
    },
    setFirebaseUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.firebaseUser = action.payload;
    },
    
    // 状態管理
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // サインアウト
    signOut: (state) => {
      state.authUser = null;
      state.firebaseUser = null;
      state.isAuthenticated = false;
      state.currentUser = null;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  updateUser, 
  setAuthUser, 
  setFirebaseUser, 
  setLoading, 
  setError, 
  signOut 
} = userSlice.actions;
export default userSlice.reducer;

