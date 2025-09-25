// Firebase Firestore データ構造

export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    allergies: string[];
    dislikes: string[];
    dietaryRestrictions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseFamily {
  id: string;
  name: string;
  ownerId: string; // 家族の作成者
  members: string[]; // ユーザーIDの配列
  settings: {
    timezone: string;
    mealTimes: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseAttendance {
  id: string;
  familyId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'dinner';
  status: 'present' | 'absent';
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseMealSchedule {
  id: string;
  familyId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  description?: string;
  ingredients: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// リアルタイム同期用のイベント
export interface FirebaseSyncEvent {
  type: 'attendance_updated' | 'schedule_updated' | 'member_joined' | 'member_left';
  familyId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

// プッシュ通知用
export interface FirebaseNotification {
  title: string;
  body: string;
  data: {
    type: 'meal_reminder' | 'attendance_update' | 'schedule_change';
    familyId: string;
    userId: string;
  };
}
