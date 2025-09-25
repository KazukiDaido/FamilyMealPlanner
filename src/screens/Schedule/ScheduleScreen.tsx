import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleAttendance } from '../../store/slices/attendanceSlice';
import { useFirebaseAttendance } from '../../hooks/useFirebaseAttendance';
import { firestoreService } from '../../services/firestoreService';
import { FirebaseUser } from '../../types/firebase';
import { MealType } from '../../types';
import { MealSettingsService } from '../../services/mealSettingsService';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import GradientBackground from '../../components/ui/GradientBackground';
import { CheckIcon, XIcon, CalendarIcon, TodayIcon, DatePickerIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import CalendarPicker from '../../components/ui/CalendarPicker';
import { holidayService } from '../../services/holidayService';

function formatYmd(d: Date) { 
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getScheduleDays() {
  const today = new Date();
  const days = [];
  
  // 過去7日間
  for (let i = -7; i < 0; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  
  // 今日から未来14日間
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  
  return days;
}

const ScheduleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { firebaseUser } = useSelector((state: RootState) => state.user);
  const { settings: mealSettings } = useSelector((state: RootState) => state.mealSettings);
  const { records: attendance, updateAttendance } = useFirebaseAttendance();
  const [familyMembers, setFamilyMembers] = useState<FirebaseUser[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 家族メンバーを取得
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!firebaseUser?.familyId) return;

      try {
        const family = await firestoreService.getFamily(firebaseUser.familyId);
        if (family) {
          const members = await firestoreService.getFamilyMembers(family.memberIds);
          setFamilyMembers(members);
        }
      } catch (error) {
        console.error('Failed to load family members:', error);
      }
    };

    loadFamilyMembers();
  }, [firebaseUser?.familyId]);

  // 祝日データを取得
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const prevYear = currentYear - 1;
        
        // 前年、今年、来年の祝日を取得
        const allHolidays = await holidayService.getHolidaysForRange(prevYear, nextYear);
        const holidayDates = new Set(allHolidays.map(h => h.date));
        setHolidays(holidayDates);
      } catch (error) {
        console.error('Failed to load holidays:', error);
      }
    };

    loadHolidays();
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const days = useMemo(() => getScheduleDays(), []);
  const ymds = days.map(formatYmd);

  const getStatus = (date: string, userId: string, mealType: MealType) => {
    const record = attendance.find(a => a.date === date && a.userId === userId && a.mealType === mealType);
    return record?.status === 'present' ? 'need' : 'skip';
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return date === today;
  };

  const getWeekdayName = (date: string) => {
    const d = new Date(date);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[d.getDay()];
  };

  const getWeekdayColor = (date: string) => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    
    // 祝日は赤
    if (holidays.has(date)) return '#FF4444';
    // 日曜日は赤
    if (dayOfWeek === 0) return '#FF4444';
    // 土曜日は青
    if (dayOfWeek === 6) return '#4444FF';
    // 平日は通常色
    return colors.textSecondary;
  };

  const isPastDate = (date: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return date < today;
  };

  const getDateDisplay = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;

    if (date === formatYmd(today)) return `今日 ${dateStr}`;
    if (date === formatYmd(yesterday)) return `昨日 ${dateStr}`;
    if (date === formatYmd(tomorrow)) return `明日 ${dateStr}`;
    
    return dateStr;
  };

  const getAttendingMembers = (date: string, mealType: MealType) => {
    return familyMembers.filter(member => getStatus(date, member.id, mealType) === 'need');
  };

  const getAbsentMembers = (date: string, mealType: MealType) => {
    return familyMembers.filter(member => getStatus(date, member.id, mealType) === 'skip');
  };

  // 日付をハイライトする
  const highlightDate = (date: string) => {
    // 既存のタイムアウトをクリア
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // 選択された日付をハイライト
    setSelectedDate(date);
    
    // 3秒後にハイライトを削除
    highlightTimeoutRef.current = setTimeout(() => {
      setSelectedDate(null);
    }, 3000);
  };

  // 今日の日付に戻る
  const scrollToToday = () => {
    const todayDate = formatYmd(new Date());
    const todayIndex = ymds.findIndex(date => isToday(date));
    console.log('Today index:', todayIndex, 'Today date:', todayDate);
    console.log('All dates:', ymds.slice(0, 10)); // 最初の10日分をログ出力
    
    if (todayIndex !== -1 && scrollViewRef.current) {
      // 今日のカードまでスクロール
      const cardHeight = 120; // カードの実際の高さを調整
      const scrollPosition = todayIndex * cardHeight;
      
      console.log('Scroll position:', scrollPosition);
      
      scrollViewRef.current.scrollTo({
        y: Math.max(0, scrollPosition),
        animated: true
      });
      
      // 今日の日付をハイライト
      highlightDate(todayDate);
    }
  };

  // カレンダー表示
  const showDatePicker = () => {
    setShowCalendar(true);
  };

  // カレンダーから日付選択
  const handleDateSelect = (selectedDateString: string) => {
    const targetIndex = ymds.findIndex(date => date === selectedDateString);
    console.log('Selected date:', selectedDateString, 'Target index:', targetIndex);
    
    if (targetIndex !== -1 && scrollViewRef.current) {
      const cardHeight = 120;
      const scrollPosition = targetIndex * cardHeight;
      
      console.log('Calendar scroll position:', scrollPosition);
      
      scrollViewRef.current.scrollTo({
        y: Math.max(0, scrollPosition),
        animated: true
      });
      
      // 選択された日付をハイライト
      highlightDate(selectedDateString);
    }
  };


  return (
    <GradientBackground>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.statusBar} />
        <View style={styles.headerContent}>
                 <View style={styles.titleSection}>
                   <Text style={styles.title}>食事スケジュール</Text>
                 </View>
          
          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={scrollToToday}
            >
              <TodayIcon size={20} color={colors.primary} />
              <Text style={styles.navButtonText}>今日</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={showDatePicker}
            >
              <DatePickerIcon size={20} color={colors.primary} />
              <Text style={styles.navButtonText}>日付</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >

      {/* Daily Schedule Cards */}
      {familyMembers.length === 0 ? (
        <Card variant="elevated" padding="large" style={styles.emptyCard}>
          <Text style={styles.emptyText}>家族メンバーがいません</Text>
          <Text style={styles.emptySubtext}>設定から家族を追加してください</Text>
        </Card>
      ) : (
        ymds.map((date, index) => {
          const isToday_ = isToday(date);
          const isPast = isPastDate(date);
          const isSelected = selectedDate === date;

          return (
            <Card 
              key={date} 
              variant={isToday_ ? "elevated" : "default"} 
              padding="medium" 
              style={[
                styles.dayCard,
                isToday_ && styles.todayCard,
                isPast && styles.pastCard,
                isSelected && styles.selectedCard
              ]}
            >
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <View style={styles.dateInfo}>
                  <Text style={[
                    styles.dateTitle,
                    !isToday_ && !isPast && { color: getWeekdayColor(date) },
                    isToday_ && styles.todayText,
                    isPast && styles.pastText
                  ]}>
                    {getDateDisplay(date)}
                  </Text>
                  <Text style={[
                    styles.weekday,
                    !isToday_ && !isPast && { color: getWeekdayColor(date) },
                    isToday_ && styles.todayWeekdayText,
                    isPast && styles.pastText
                  ]}>
                    {getWeekdayName(date)}
                  </Text>
                </View>
                {isToday_ && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>今日</Text></View>}
              </View>

              {/* Meal Types */}
              <View style={styles.mealsContainer}>
                {mealSettings.enabledMealTypes.map((mealType) => {
                  const attendingMembers = getAttendingMembers(date, mealType);
                  const absentMembers = getAbsentMembers(date, mealType);
                  const mealName = MealSettingsService.getMealTypeName(mealType, mealSettings.customMealTypes);
                  const mealEmoji = MealSettingsService.getMealTypeEmoji(mealType, undefined, mealSettings.customMealTypes);

                  return (
                    <View key={mealType} style={styles.mealSection}>
                      <Text style={styles.mealTitle}>{mealEmoji} {mealName}</Text>
                      
                      {/* Attendance Status */}
                      <View style={styles.attendanceStatus}>
                        {/* Attending Members */}
                        {attendingMembers.length > 0 && (
                          <View style={styles.statusSection}>
                            <View style={styles.statusHeader}>
                              <CheckIcon size={14} color={colors.attendance.present} />
                              <Text style={styles.statusLabel}>参加 ({attendingMembers.length}人)</Text>
                            </View>
                            <View style={styles.membersList}>
                              {attendingMembers.map(member => (
                                <TouchableOpacity
                                  key={member.id}
                                  style={[styles.memberChip, styles.attendingChip]}
                                  onPress={async () => {
                                    await updateAttendance(date, mealType, 'absent');
                                  }}
                                >
                                  <Avatar name={member.name} size="small" />
                                  <Text style={styles.memberChipText}>{member.name}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Absent Members */}
                        {absentMembers.length > 0 && (
                          <View style={styles.statusSection}>
                            <View style={styles.statusHeader}>
                              <XIcon size={14} color={colors.attendance.absent} />
                              <Text style={styles.statusLabel}>不参加 ({absentMembers.length}人)</Text>
                            </View>
                            <View style={styles.membersList}>
                              {absentMembers.map(member => (
                                <TouchableOpacity
                                  key={member.id}
                                  style={[styles.memberChip, styles.absentChip]}
                                  onPress={async () => {
                                    await updateAttendance(date, mealType, 'present');
                                  }}
                                >
                                  <Avatar name={member.name} size="small" />
                                  <Text style={styles.memberChipText}>{member.name}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* No Status Members */}
                        {familyMembers.length > attendingMembers.length + absentMembers.length && (
                          <View style={styles.statusSection}>
                            <Text style={styles.noStatusText}>
                              未設定: {familyMembers.length - attendingMembers.length - absentMembers.length}人
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          );
        })
      )}
      </ScrollView>

      {/* Calendar Picker Modal */}
      <CalendarPicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedDate={formatYmd(new Date())}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 120, // ヘッダーの高さ分マージンを追加
  },
  contentContainer: {
    paddingBottom: 120,
    paddingTop: spacing.lg,
  },
  
  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    paddingBottom: spacing.md,
  },
  statusBar: {
    height: 44,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    fontWeight: '700',
  },
  
  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  navButtonText: {
    ...typography.caption1,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Daily Cards
  dayCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  todayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    opacity: 0.8,
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 3,
    borderColor: colors.secondary, // ラベンダー色でハイライト
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Date Header
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  dateTitle: {
    ...typography.title3,
    color: colors.text,
    fontWeight: '700',
  },
  todayText: {
    color: colors.primary,
  },
  pastText: {
    color: colors.textTertiary,
  },
  weekday: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  todayWeekdayText: {
    color: colors.primary,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  todayBadgeText: {
    ...typography.caption1,
    color: colors.textDark,
    fontWeight: '600',
  },
  
   // Meals Container
   mealsContainer: {
     gap: spacing.lg,
   },
   mealSection: {
     paddingBottom: spacing.md,
     borderBottomWidth: 1,
     borderBottomColor: colors.border,
   },
   mealTitle: {
     ...typography.callout,
     color: colors.text,
     fontWeight: '700',
     marginBottom: spacing.sm,
   },

   // Attendance Status
   attendanceStatus: {
     gap: spacing.md,
   },
  statusSection: {
    gap: spacing.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusLabel: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '600',
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  attendingChip: {
    backgroundColor: colors.attendance.present,
  },
  absentChip: {
    backgroundColor: colors.attendance.absent,
  },
  memberChipText: {
    ...typography.caption1,
    color: colors.textDark,
    fontWeight: '600',
  },
  noStatusText: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  
  // Empty State
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
});

export default ScheduleScreen;

