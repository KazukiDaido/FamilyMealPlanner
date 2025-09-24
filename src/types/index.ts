// ユーザー情報
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: Date;
}

// 家族情報
export interface Family {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
  subscriptionPlan: 'free' | 'family' | 'premium';
}

// 食事スケジュール
export interface MealSchedule {
  id: string;
  date: string; // YYYY-MM-DD形式
  mealType: 'breakfast' | 'lunch' | 'dinner';
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
  mealType: 'dinner';
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

