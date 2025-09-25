import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../../services/authService';
import { firestoreService } from '../../services/firestoreService';
import { setAuthUser, setFirebaseUser, setLoading } from '../../store/slices/userSlice';
import { colors } from '../../styles/designSystem';
import { RootState } from '../../store';
import FamilySetupScreen from '../../screens/Family/FamilySetupScreen';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useDispatch();
  const { authUser, firebaseUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 匿名認証でサインイン
        if (!authService.isSignedIn()) {
          await authService.signInAnonymously();
        }
      } catch (error) {
        console.error('Failed to sign in anonymously:', error);
      }
    };

    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      dispatch(setAuthUser(authUser));

      if (authUser) {
        try {
          // Firebaseユーザー情報を取得
          const firebaseUser = await firestoreService.getUser(authUser.uid);
          dispatch(setFirebaseUser(firebaseUser));
        } catch (error) {
          console.error('Failed to load user data:', error);
          dispatch(setFirebaseUser(null));
        }
      } else {
        dispatch(setFirebaseUser(null));
      }

      setIsInitializing(false);
    });

    initializeAuth();
    return unsubscribe;
  }, [dispatch]);

  // 初期化中は読み込み画面を表示
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ユーザーが認証されていない場合
  if (!authUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ユーザー情報が未設定、または家族に属していない場合は設定画面を表示
  if (!firebaseUser || !firebaseUser.name || !firebaseUser.familyId) {
    return <FamilySetupScreen />;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AuthProvider;
