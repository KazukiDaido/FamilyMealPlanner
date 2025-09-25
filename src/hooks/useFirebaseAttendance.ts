import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAttendanceRecords, setLoading, setError } from '../store/slices/attendanceSlice';
import { firestoreService } from '../services/firestoreService';
import { FirebaseAttendanceRecord } from '../types/firebase';

export const useFirebaseAttendance = () => {
  const dispatch = useDispatch();
  const { firebaseUser } = useSelector((state: RootState) => state.user);
  const { records, isLoading } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    if (!firebaseUser?.familyId) return;

    dispatch(setLoading(true));
    
    // リアルタイム監視を開始
    const unsubscribe = firestoreService.onAttendanceRecordsChanged(
      firebaseUser.familyId,
      (firebaseRecords: FirebaseAttendanceRecord[]) => {
        // Firebase形式から内部形式に変換
        const convertedRecords = firebaseRecords.map(record => ({
          id: record.id,
          userId: record.userId,
          mealScheduleId: record.mealScheduleId || '',
          date: record.date,
          mealType: record.mealType,
          status: record.status,
          updatedAt: record.updatedAt, // 文字列のまま保存
        }));

        dispatch(setAttendanceRecords(convertedRecords));
        dispatch(setLoading(false));
      }
    );

    return unsubscribe;
  }, [firebaseUser?.familyId, dispatch]);

  const updateAttendance = async (
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    status: 'present' | 'absent' | 'unknown'
  ) => {
    if (!firebaseUser?.familyId || !firebaseUser.id) return;

    try {
      await firestoreService.setAttendanceRecord(firebaseUser.familyId, {
        userId: firebaseUser.id,
        date,
        mealType,
        status,
      });
    } catch (error) {
      console.error('Failed to update attendance:', error);
      dispatch(setError('出欠情報の更新に失敗しました'));
    }
  };

  return {
    records,
    isLoading,
    updateAttendance,
  };
};
