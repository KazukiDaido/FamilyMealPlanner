import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { authService } from './authService';
import { 
  FirebaseUser, 
  FirebaseFamily, 
  FirebaseAttendanceRecord,
  FirebaseMealSchedule 
} from '../types/firebase';

class FirestoreService {
  // ユーザー管理
  async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const user: FirebaseUser = {
      id: userId,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', userId), user);
    return userId;
  }

  async getUser(userId: string): Promise<FirebaseUser | null> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() as FirebaseUser : null;
  }

  async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'users', userId), updateData);
  }

  // 家族管理
  async createFamily(familyData: Omit<FirebaseFamily, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const family: Omit<FirebaseFamily, 'id'> = {
      ...familyData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'families'), family);
    return docRef.id;
  }

  async getFamily(familyId: string): Promise<FirebaseFamily | null> {
    const docSnap = await getDoc(doc(db, 'families', familyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseFamily;
    }
    return null;
  }

  async updateFamily(familyId: string, updates: Partial<FirebaseFamily>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'families', familyId), updateData);
  }

  async joinFamily(familyId: string, userId: string): Promise<void> {
    const family = await this.getFamily(familyId);
    if (!family) throw new Error('Family not found');

    if (!family.memberIds.includes(userId)) {
      const updatedMemberIds = [...family.memberIds, userId];
      await this.updateFamily(familyId, { memberIds: updatedMemberIds });
    }

    // ユーザーのfamilyIdも更新
    await this.updateUser(userId, { familyId });
  }

  // 出欠記録管理
  async setAttendanceRecord(
    familyId: string, 
    attendanceData: Omit<FirebaseAttendanceRecord, 'id' | 'updatedAt'>
  ): Promise<void> {
    const recordId = `${attendanceData.userId}_${attendanceData.date}_${attendanceData.mealType}`;
    const record: Omit<FirebaseAttendanceRecord, 'id'> = {
      ...attendanceData,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'families', familyId, 'attendanceRecords', recordId), record);
  }

  async getAttendanceRecords(familyId: string, startDate?: string, endDate?: string): Promise<FirebaseAttendanceRecord[]> {
    let q = query(
      collection(db, 'families', familyId, 'attendanceRecords'),
      orderBy('date', 'desc')
    );

    if (startDate && endDate) {
      q = query(q, where('date', '>=', startDate), where('date', '<=', endDate));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseAttendanceRecord));
  }

  // リアルタイム監視
  onAttendanceRecordsChanged(
    familyId: string, 
    callback: (records: FirebaseAttendanceRecord[]) => void
  ): () => void {
    const q = query(
      collection(db, 'families', familyId, 'attendanceRecords'),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseAttendanceRecord));
      callback(records);
    });
  }

  onFamilyChanged(familyId: string, callback: (family: FirebaseFamily | null) => void): () => void {
    return onSnapshot(doc(db, 'families', familyId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as FirebaseFamily);
      } else {
        callback(null);
      }
    });
  }

  // 家族メンバー取得
  async getFamilyMembers(memberIds: string[]): Promise<FirebaseUser[]> {
    if (memberIds.length === 0) return [];

    const members: FirebaseUser[] = [];
    for (const memberId of memberIds) {
      const member = await this.getUser(memberId);
      if (member) {
        members.push(member);
      }
    }
    return members;
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
