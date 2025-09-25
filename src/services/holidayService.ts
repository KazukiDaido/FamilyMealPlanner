/**
 * 日本の祝日を取得するサービス
 * 内閣府の祝日APIを使用
 */

interface Holiday {
  date: string; // YYYY-MM-DD形式
  name: string;
}

class HolidayService {
  private holidays: Holiday[] = [];
  private lastFetchYear: number | null = null;

  /**
   * 指定年の祝日を取得（キャッシュ機能付き）
   */
  async getHolidays(year: number): Promise<Holiday[]> {
    // 同じ年のデータが既にキャッシュされている場合はそれを返す
    if (this.lastFetchYear === year && this.holidays.length > 0) {
      return this.holidays;
    }

    try {
      // 内閣府の祝日CSV APIを使用
      const response = await fetch(`https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv`);
      const csvText = await response.text();
      
      // CSVをパース
      const lines = csvText.split('\n');
      const holidays: Holiday[] = [];
      
      // ヘッダー行をスキップ
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [dateStr, nameStr] = line.split(',');
        if (dateStr && nameStr) {
          const date = dateStr.replace(/"/g, ''); // ダブルクォートを除去
          const name = nameStr.replace(/"/g, ''); // ダブルクォートを除去
          
          // 指定年の祝日のみフィルター
          if (date.startsWith(year.toString())) {
            holidays.push({ date, name });
          }
        }
      }
      
      this.holidays = holidays;
      this.lastFetchYear = year;
      
      console.log(`Fetched ${holidays.length} holidays for ${year}`);
      return holidays;
      
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      
      // フォールバック：基本的な祝日のみ返す
      return this.getFallbackHolidays(year);
    }
  }

  /**
   * 指定日が祝日かどうかを判定
   */
  async isHoliday(date: string): Promise<boolean> {
    const year = new Date(date).getFullYear();
    const holidays = await this.getHolidays(year);
    return holidays.some(holiday => holiday.date === date);
  }

  /**
   * 指定日の祝日名を取得
   */
  async getHolidayName(date: string): Promise<string | null> {
    const year = new Date(date).getFullYear();
    const holidays = await this.getHolidays(year);
    const holiday = holidays.find(holiday => holiday.date === date);
    return holiday ? holiday.name : null;
  }

  /**
   * APIが使用できない場合のフォールバック祝日
   */
  private getFallbackHolidays(year: number): Holiday[] {
    const fallbackHolidays = [
      { month: 1, day: 1, name: '元旦' },
      { month: 2, day: 11, name: '建国記念の日' },
      { month: 4, day: 29, name: '昭和の日' },
      { month: 5, day: 3, name: '憲法記念日' },
      { month: 5, day: 4, name: 'みどりの日' },
      { month: 5, day: 5, name: 'こどもの日' },
      { month: 8, day: 11, name: '山の日' },
      { month: 11, day: 3, name: '文化の日' },
      { month: 11, day: 23, name: '勤労感謝の日' },
      { month: 12, day: 23, name: '天皇誕生日' },
    ];

    return fallbackHolidays.map(({ month, day, name }) => ({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      name
    }));
  }

  /**
   * 複数年の祝日を一括取得（パフォーマンス向上のため）
   */
  async getHolidaysForRange(startYear: number, endYear: number): Promise<Holiday[]> {
    const allHolidays: Holiday[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = await this.getHolidays(year);
      allHolidays.push(...yearHolidays);
    }
    
    return allHolidays;
  }
}

export const holidayService = new HolidayService();
export type { Holiday };
