import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleAttendance } from '../../store/slices/attendanceSlice';

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
  const members = useSelector((s: RootState) => s.family.members);
  const attendance = useSelector((s: RootState) => s.attendance.items);

  const days = useMemo(() => getWeek(), []);
  const ymds = days.map(formatYmd);

  const getStatus = (date: string, userId: string) =>
    attendance.find(a => a.date === date && a.userId === userId)?.status || 'need';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>今週の晩ごはん いる/いらない</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.headerCell]}>家族</Text>
        {ymds.map(d => (
          <Text key={d} style={[styles.cell, styles.headerCell]}>
            {Number(d.slice(8, 10))}
          </Text>
        ))}
      </View>

      {members.map(m => (
        <View key={m.id} style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
            {m.name}
          </Text>
          {ymds.map(d => {
            const status = getStatus(d, m.id);
            const isNeed = status === 'need';
            return (
              <TouchableOpacity
                key={d}
                style={[styles.cell, isNeed ? styles.need : styles.skip]}
                onPress={() => dispatch(toggleAttendance({ date: d, userId: m.id }))}
              >
                <Text style={styles.cellText}>{isNeed ? '◯' : '×'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {members.length === 0 && (
        <Text style={styles.help}>設定で家族メンバーを追加してください。</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 16 },
  headerRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  cell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderColor: '#eee',
  },
  headerCell: { backgroundColor: '#f7f8fa', fontWeight: 'bold' },
  nameCell: { width: 96, alignItems: 'flex-start', paddingLeft: 8 },
  need: { backgroundColor: '#e7fbe7' },
  skip: { backgroundColor: '#ffecec' },
  cellText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  help: { padding: 16, color: '#666' },
});

export default ScheduleScreen;

