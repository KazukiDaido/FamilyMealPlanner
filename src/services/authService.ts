import { auth } from '../config/firebase';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Firebase認証状態の監視
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
        };
      } else {
        this.currentUser = null;
      }
      
      // リスナーに通知
      this.authStateListeners.forEach(listener => listener(this.currentUser));
    });
  }

  // 匿名認証でサインイン
  async signInAnonymously(): Promise<AuthUser> {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      const authUser: AuthUser = {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
      };
      
      return authUser;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }

  // サインアウト
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // 現在のユーザー取得
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // 認証状態の監視
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // 初回実行
    callback(this.currentUser);
    
    // リスナー解除関数を返す
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // ユーザーがサインイン済みかチェック
  isSignedIn(): boolean {
    return this.currentUser !== null;
  }

  // ユーザーIDを取得（家族データの関連付け用）
  getUserId(): string | null {
    return this.currentUser?.uid || null;
  }
}

export const authService = new AuthService();
export default authService;
