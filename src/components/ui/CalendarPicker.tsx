import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatYmd = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日
    const firstDay = new Date(year, month, 1);
    // 月の最後の日
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダーの最初の日（月曜日から始まる）
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // 月曜日を0にする
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    
    // カレンダーの最後の日（日曜日で終わる）
    const endDate = new Date(lastDay);
    const lastDayOfWeek = (lastDay.getDay() + 6) % 7;
    endDate.setDate(lastDay.getDate() + (6 - lastDayOfWeek));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatYmd(date) === formatYmd(today);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSelected = (date: Date) => {
    return selectedDate === formatYmd(date);
  };

  const getWeekdayColor = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return '#FF4444'; // 日曜日は赤
    if (dayOfWeek === 6) return '#4444FF'; // 土曜日は青
    return colors.text; // 平日は通常色
  };

  const isHoliday = (date: Date) => {
    // 簡単な祝日判定（実際のアプリでは祝日APIを使用）
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 一部の固定祝日のみ
    const holidays = [
      '1/1',   // 元旦
      '2/11',  // 建国記念の日
      '4/29',  // 昭和の日
      '5/3',   // 憲法記念日
      '5/4',   // みどりの日
      '5/5',   // こどもの日
      '8/11',  // 山の日
      '11/3',  // 文化の日
      '11/23', // 勤労感謝の日
      '12/23', // 天皇誕生日
    ];
    
    return holidays.includes(`${month}/${day}`);
  };

  const calendarDays = getCalendarDays();
  const monthYear = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthYear}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={[
                  styles.weekdayText,
                  index === 5 && { color: '#4444FF' }, // 土曜日
                  index === 6 && { color: '#FF4444' }, // 日曜日
                ]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      isToday(date) && styles.todayCell,
                      isSelected(date) && styles.selectedCell,
                      !isCurrentMonth(date) && styles.otherMonthCell
                    ]}
                    onPress={() => {
                      onDateSelect(formatYmd(date));
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: getWeekdayColor(date) },
                        isHoliday(date) && { color: '#FF4444' }, // 祝日は赤
                        isToday(date) && styles.todayText,
                        isSelected(date) && styles.selectedText,
                        !isCurrentMonth(date) && styles.otherMonthText
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    minWidth: 320,
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    ...typography.title2,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  monthTitle: {
    ...typography.title3,
    color: colors.text,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    marginBottom: spacing.lg,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    margin: 1,
  },
  todayCell: {
    backgroundColor: colors.primary,
  },
  selectedCell: {
    backgroundColor: colors.secondary,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayText: {
    ...typography.callout,
    color: colors.text,
  },
  todayText: {
    color: colors.textDark,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.textDark,
    fontWeight: '700',
  },
  otherMonthText: {
    color: colors.textTertiary,
  },
  closeButton: {
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '600',
  },
});

export default CalendarPicker;
