import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// スライス（後で作成）
import userSlice from './slices/userSlice';
import familySlice from './slices/familySlice';
import mealSlice from './slices/mealSlice';
import shoppingSlice from './slices/shoppingSlice';

// Redux Persist設定
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'family'], // 永続化するスライス
};

// ルートリデューサー
const rootReducer = combineReducers({
  user: userSlice,
  family: familySlice,
  meals: mealSlice,
  shopping: shoppingSlice,
});

// 永続化されたリデューサー
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ストア設定
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

