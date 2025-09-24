import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Family, MealSchedule, ShoppingList } from '../types';

// ストレージキー定数
const STORAGE_KEYS = {
  USER: 'user',
  FAMILY: 'family',
  MEAL_SCHEDULES: 'meal_schedules',
  SHOPPING_LIST: 'shopping_list',
  APP_SETTINGS: 'app_settings',
} as const;

export class StorageService {
  // ユーザー情報の保存・取得
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  static async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Failed to remove user:', error);
      throw error;
    }
  }

  // 家族情報の保存・取得
  static async saveFamily(family: Family): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(family));
    } catch (error) {
      console.error('Failed to save family:', error);
      throw error;
    }
  }

  static async getFamily(): Promise<Family | null> {
    try {
      const familyData = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY);
      return familyData ? JSON.parse(familyData) : null;
    } catch (error) {
      console.error('Failed to get family:', error);
      return null;
    }
  }

  static async removeFamily(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FAMILY);
    } catch (error) {
      console.error('Failed to remove family:', error);
      throw error;
    }
  }

  // 食事スケジュールの保存・取得
  static async saveMealSchedules(schedules: MealSchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEAL_SCHEDULES, JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save meal schedules:', error);
      throw error;
    }
  }

  static async getMealSchedules(): Promise<MealSchedule[]> {
    try {
      const schedulesData = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_SCHEDULES);
      return schedulesData ? JSON.parse(schedulesData) : [];
    } catch (error) {
      console.error('Failed to get meal schedules:', error);
      return [];
    }
  }

  static async addMealSchedule(schedule: MealSchedule): Promise<void> {
    try {
      const existingSchedules = await this.getMealSchedules();
      const updatedSchedules = [...existingSchedules, schedule];
      await this.saveMealSchedules(updatedSchedules);
    } catch (error) {
      console.error('Failed to add meal schedule:', error);
      throw error;
    }
  }

  static async updateMealSchedule(schedule: MealSchedule): Promise<void> {
    try {
      const existingSchedules = await this.getMealSchedules();
      const updatedSchedules = existingSchedules.map(s => 
        s.id === schedule.id ? schedule : s
      );
      await this.saveMealSchedules(updatedSchedules);
    } catch (error) {
      console.error('Failed to update meal schedule:', error);
      throw error;
    }
  }

  static async deleteMealSchedule(scheduleId: string): Promise<void> {
    try {
      const existingSchedules = await this.getMealSchedules();
      const updatedSchedules = existingSchedules.filter(s => s.id !== scheduleId);
      await this.saveMealSchedules(updatedSchedules);
    } catch (error) {
      console.error('Failed to delete meal schedule:', error);
      throw error;
    }
  }

  // 買い物リストの保存・取得
  static async saveShoppingList(shoppingList: ShoppingList): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(shoppingList));
    } catch (error) {
      console.error('Failed to save shopping list:', error);
      throw error;
    }
  }

  static async getShoppingList(): Promise<ShoppingList | null> {
    try {
      const shoppingListData = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      return shoppingListData ? JSON.parse(shoppingListData) : null;
    } catch (error) {
      console.error('Failed to get shopping list:', error);
      return null;
    }
  }

  static async removeShoppingList(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST);
    } catch (error) {
      console.error('Failed to remove shopping list:', error);
      throw error;
    }
  }

  // アプリ設定の保存・取得
  static async saveAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save app settings:', error);
      throw error;
    }
  }

  static async getAppSettings(): Promise<any> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settingsData ? JSON.parse(settingsData) : {};
    } catch (error) {
      console.error('Failed to get app settings:', error);
      return {};
    }
  }

  // 全データのクリア
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.FAMILY,
        STORAGE_KEYS.MEAL_SCHEDULES,
        STORAGE_KEYS.SHOPPING_LIST,
        STORAGE_KEYS.APP_SETTINGS,
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  // データのエクスポート（JSON形式）
  static async exportData(): Promise<string> {
    try {
      const [user, family, schedules, shoppingList, settings] = await Promise.all([
        this.getUser(),
        this.getFamily(),
        this.getMealSchedules(),
        this.getShoppingList(),
        this.getAppSettings(),
      ]);

      const exportData = {
        user,
        family,
        schedules,
        shoppingList,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // データのインポート（JSON形式）
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.user) await this.saveUser(data.user);
      if (data.family) await this.saveFamily(data.family);
      if (data.schedules) await this.saveMealSchedules(data.schedules);
      if (data.shoppingList) await this.saveShoppingList(data.shoppingList);
      if (data.settings) await this.saveAppSettings(data.settings);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

