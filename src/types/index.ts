// ユーザー情報
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: Date;
}

// 家族の食事設定
export interface FamilyMealSettings {
  enabledMealTypes: MealType[]; // 有効な食事タイプ
  customMealTypes: CustomMealType[]; // カスタム食事タイプ
  defaultMealTypes: MealType[]; // デフォルトで表示する食事タイプ
}

// 家族情報
export interface Family {
  id: string;
  name: string;
  members: User[];
  mealSettings: FamilyMealSettings;
  createdAt: Date;
  subscriptionPlan: 'free' | 'family' | 'premium';
}

// 食事の種類
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'bento' | 'custom';

// カスタム食事タイプ
export interface CustomMealType {
  id: string;
  name: string; // 例: "お弁当", "おやつ", "夜食"
  emoji: string; // 例: "🍱", "🍪", "🌙"
  order: number; // 表示順序
  isActive: boolean;
}

// 食事スケジュール
export interface MealSchedule {
  id: string;
  date: string; // YYYY-MM-DD形式
  mealType: MealType;
  customMealTypeId?: string; // カスタム食事の場合
  title: string;
  description?: string;
  ingredients: string[];
  createdBy: string; // ユーザーID
  createdAt: Date;
  updatedAt: Date;
}

// 出欠（いる/いらない）
export type AttendanceStatus = 'need' | 'skip';

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  customMealTypeId?: string; // カスタム食事の場合
  userId: string;
  status: AttendanceStatus;
  updatedAt: Date;
}

// 買い物リストアイテム
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isCompleted: boolean;
  addedBy: string; // ユーザーID
  createdAt: Date;
}

// 買い物リスト
export interface ShoppingList {
  id: string;
  familyId: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
}

// アプリの状態
export interface AppState {
  user: User | null;
  family: Family | null;
  mealSchedules: MealSchedule[];
  shoppingList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
}

// ナビゲーション用の型
export type RootStackParamList = {
  Home: undefined;
  Schedule: undefined;
  Family: undefined;
  Shopping: undefined;
  Settings: undefined;
  AddMeal: { date: string; mealType: string };
  EditMeal: { mealId: string };
  AddFamilyMember: undefined;
  QRCodeSync: undefined;
};

