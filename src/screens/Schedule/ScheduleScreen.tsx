import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleAttendance } from '../../store/slices/attendanceSlice';
import { useFirebaseAttendance } from '../../hooks/useFirebaseAttendance';
import { firestoreService } from '../../services/firestoreService';
import { FirebaseUser } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import GradientBackground from '../../components/ui/GradientBackground';
import { CheckIcon, XIcon, CalendarIcon } from '../../components/ui/Icons';

function formatYmd(d: Date) { return d.toISOString().slice(0, 10); }

function getWeek(start?: Date) {
  const base = start ? new Date(start) : new Date();
  const day = base.getDay();
  const diffToMon = (day + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - diffToMon);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const ScheduleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { firebaseUser } = useSelector((state: RootState) => state.user);
  const { records: attendance, updateAttendance } = useFirebaseAttendance();
  const [familyMembers, setFamilyMembers] = useState<FirebaseUser[]>([]);

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

  const days = useMemo(() => getWeek(), []);
  const ymds = days.map(formatYmd);

  const getStatus = (date: string, userId: string) => {
    const record = attendance.find(a => a.date === date && a.userId === userId && a.mealType === 'dinner');
    return record?.status === 'present' ? 'need' : 'skip';
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return date === today;
  };

  const getWeekdayName = (date: string) => {
    const d = new Date(date);
    const weekdays = ['月', '火', '水', '木', '金', '土', '日'];
    return weekdays[d.getDay()];
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <View style={styles.statusBar} />
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <CalendarIcon size={28} color={colors.primary} />
              <Text style={styles.title}>今週の晩ごはん</Text>
            </View>
          </View>
        </View>

      {/* Week Overview Card */}
      <Card variant="elevated" padding="medium" style={styles.weekCard}>
        <Text style={styles.cardTitle}>週間スケジュール</Text>
        <Text style={styles.cardSubtitle}>タップで参加/不参加を切り替え</Text>
        
        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.memberColumn}>
              <Text style={styles.headerText}>家族</Text>
            </View>
            {ymds.map(d => (
              <View key={d} style={styles.dateColumn}>
                <Text style={[
                  styles.dateText,
                  isToday(d) && styles.todayDate
                ]}>
                  {Number(d.slice(8, 10))}
                </Text>
                <Text style={[
                  styles.weekdayText,
                  isToday(d) && styles.todayWeekday
                ]}>
                  {getWeekdayName(d)}
                </Text>
              </View>
            ))}
          </View>

          {/* Member Rows */}
          {familyMembers.map(m => (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberColumn}>
                <View style={styles.memberInfo}>
                  <Avatar name={m.name} size="small" />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {m.name}
                  </Text>
                </View>
              </View>
              {ymds.map(d => {
                const status = getStatus(d, m.id);
                const isNeed = status === 'need';
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.attendanceCell,
                      isNeed ? styles.attendancePresent : styles.attendanceAbsent,
                      isToday(d) && styles.todayCell
                    ]}
                    onPress={async () => {
                      const newStatus = isNeed ? 'absent' : 'present';
                      await updateAttendance(d, 'dinner', newStatus);
                    }}
                  >
                    {isNeed ? (
                      <CheckIcon size={16} color={colors.textDark} />
                    ) : (
                      <XIcon size={16} color={colors.textDark} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {familyMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>家族メンバーがいません</Text>
            <Text style={styles.emptySubtext}>設定から家族を追加してください</Text>
          </View>
        )}
      </Card>

      {/* Summary Card */}
      {familyMembers.length > 0 && (
        <Card variant="default" padding="medium" style={styles.summaryCard}>
          <Text style={styles.cardTitle}>今日の参加状況</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: colors.attendance.present }]} />
              <Text style={styles.summaryText}>
                {familyMembers.filter(m => getStatus(ymds[0], m.id) === 'need').length}人参加
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: colors.attendance.absent }]} />
              <Text style={styles.summaryText}>
                {familyMembers.filter(m => getStatus(ymds[0], m.id) === 'skip').length}人不参加
              </Text>
            </View>
          </View>
        </Card>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  
  // Modern Header
  modernHeader: {
    paddingTop: 0,
    paddingBottom: spacing.xl,
  },
  statusBar: {
    height: 44,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '700',
  },
  
  // Week Card
  weekCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  // Calendar Grid
  calendarContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberColumn: {
    width: 100,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  dateColumn: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  headerText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    ...typography.caption1,
    color: colors.text,
    fontWeight: '600',
  },
  todayDate: {
    color: colors.primary,
  },
  weekdayText: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: 2,
  },
  todayWeekday: {
    color: colors.primary,
  },
  
  // Member Rows
  memberRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  memberName: {
    ...typography.caption1,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  attendanceCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    minHeight: 48,
  },
  attendancePresent: {
    backgroundColor: colors.attendance.present,
  },
  attendanceAbsent: {
    backgroundColor: colors.attendance.absent,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
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
  
  // Summary Card
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  summaryText: {
    ...typography.callout,
    color: colors.text,
  },
});

export default ScheduleScreen;

