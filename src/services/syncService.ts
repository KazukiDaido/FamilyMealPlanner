import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { StorageService } from './storageService';
import { User, Family, MealSchedule, ShoppingList } from '../types';

export class SyncService {
  // QRコード生成
  static generateQRCode(data: any): string {
    return JSON.stringify(data);
  }

  // QRコードからデータを読み取り
  static parseQRCode(qrData: string): any {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      console.error('Failed to parse QR code data:', error);
      throw new Error('Invalid QR code data');
    }
  }

  // 家族データの同期用QRコード生成
  static async generateFamilySyncQR(): Promise<string> {
    try {
      const [user, family, schedules, shoppingList] = await Promise.all([
        StorageService.getUser(),
        StorageService.getFamily(),
        StorageService.getMealSchedules(),
        StorageService.getShoppingList(),
      ]);

      const syncData = {
        type: 'family_sync',
        user,
        family,
        schedules,
        shoppingList,
        timestamp: new Date().toISOString(),
      };

      return this.generateQRCode(syncData);
    } catch (error) {
      console.error('Failed to generate family sync QR:', error);
      throw error;
    }
  }

  // 食事スケジュールの同期用QRコード生成
  static async generateScheduleSyncQR(dateRange?: { start: string; end: string }): Promise<string> {
    try {
      const schedules = await StorageService.getMealSchedules();
      let filteredSchedules = schedules;

      if (dateRange) {
        filteredSchedules = schedules.filter(schedule => 
          schedule.date >= dateRange.start && schedule.date <= dateRange.end
        );
      }

      const syncData = {
        type: 'schedule_sync',
        schedules: filteredSchedules,
        timestamp: new Date().toISOString(),
      };

      return this.generateQRCode(syncData);
    } catch (error) {
      console.error('Failed to generate schedule sync QR:', error);
      throw error;
    }
  }

  // 買い物リストの同期用QRコード生成
  static async generateShoppingListSyncQR(): Promise<string> {
    try {
      const shoppingList = await StorageService.getShoppingList();

      const syncData = {
        type: 'shopping_list_sync',
        shoppingList,
        timestamp: new Date().toISOString(),
      };

      return this.generateQRCode(syncData);
    } catch (error) {
      console.error('Failed to generate shopping list sync QR:', error);
      throw error;
    }
  }

  // QRコードからデータを同期
  static async syncFromQRCode(qrData: string): Promise<void> {
    try {
      const data = this.parseQRCode(qrData);

      switch (data.type) {
        case 'family_sync':
          await this.syncFamilyData(data);
          break;
        case 'schedule_sync':
          await this.syncScheduleData(data);
          break;
        case 'shopping_list_sync':
          await this.syncShoppingListData(data);
          break;
        default:
          throw new Error('Unknown sync type');
      }
    } catch (error) {
      console.error('Failed to sync from QR code:', error);
      throw error;
    }
  }

  // 家族データの同期
  private static async syncFamilyData(data: any): Promise<void> {
    try {
      if (data.family) {
        await StorageService.saveFamily(data.family);
      }
      if (data.schedules) {
        await StorageService.saveMealSchedules(data.schedules);
      }
      if (data.shoppingList) {
        await StorageService.saveShoppingList(data.shoppingList);
      }
    } catch (error) {
      console.error('Failed to sync family data:', error);
      throw error;
    }
  }

  // スケジュールデータの同期
  private static async syncScheduleData(data: any): Promise<void> {
    try {
      if (data.schedules) {
        const existingSchedules = await StorageService.getMealSchedules();
        const newSchedules = data.schedules.filter((newSchedule: MealSchedule) => 
          !existingSchedules.some(existing => existing.id === newSchedule.id)
        );
        
        if (newSchedules.length > 0) {
          const updatedSchedules = [...existingSchedules, ...newSchedules];
          await StorageService.saveMealSchedules(updatedSchedules);
        }
      }
    } catch (error) {
      console.error('Failed to sync schedule data:', error);
      throw error;
    }
  }

  // 買い物リストデータの同期
  private static async syncShoppingListData(data: any): Promise<void> {
    try {
      if (data.shoppingList) {
        await StorageService.saveShoppingList(data.shoppingList);
      }
    } catch (error) {
      console.error('Failed to sync shopping list data:', error);
      throw error;
    }
  }

  // ファイル共有でデータをエクスポート
  static async exportDataToFile(): Promise<void> {
    try {
      const data = await StorageService.exportData();
      const shareOptions = {
        title: '家族食事スケジュールデータ',
        message: '家族の食事スケジュールデータを共有します',
        url: `data:text/plain;base64,${Buffer.from(data).toString('base64')}`,
        type: 'text/plain',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Failed to export data to file:', error);
      throw error;
    }
  }

  // ファイルからデータをインポート
  static async importDataFromFile(filePath: string): Promise<void> {
    try {
      // ファイルの内容を読み取り
      const fs = require('react-native-fs');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      await StorageService.importData(fileContent);
    } catch (error) {
      console.error('Failed to import data from file:', error);
      throw error;
    }
  }

  // データの整合性チェック
  static async validateData(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];
      
      const [user, family, schedules, shoppingList] = await Promise.all([
        StorageService.getUser(),
        StorageService.getFamily(),
        StorageService.getMealSchedules(),
        StorageService.getShoppingList(),
      ]);

      // ユーザーデータの検証
      if (!user) {
        errors.push('ユーザーデータが見つかりません');
      }

      // 家族データの検証
      if (!family) {
        errors.push('家族データが見つかりません');
      } else if (!family.members || family.members.length === 0) {
        errors.push('家族メンバーが登録されていません');
      }

      // スケジュールデータの検証
      if (!schedules || schedules.length === 0) {
        errors.push('食事スケジュールが登録されていません');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error('Failed to validate data:', error);
      return {
        isValid: false,
        errors: ['データの検証中にエラーが発生しました'],
      };
    }
  }
}

