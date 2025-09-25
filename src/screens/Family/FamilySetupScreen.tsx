import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setFirebaseUser } from '../../store/slices/userSlice';
import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { firestoreService } from '../../services/firestoreService';
import { authService } from '../../services/authService';
import { FirebaseFamily, FirebaseUser } from '../../types/firebase';

const FamilySetupScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { authUser, firebaseUser } = useSelector((state: RootState) => state.user);
  
  const [userName, setUserName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'name' | 'family'>('name');

  useEffect(() => {
    if (firebaseUser?.name) {
      setUserName(firebaseUser.name);
      setStep('family');
    }
  }, [firebaseUser]);

  const handleSaveName = async () => {
    if (!userName.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    if (!authUser?.uid) {
      Alert.alert('エラー', '認証エラーが発生しました');
      return;
    }

    setIsLoading(true);
    try {
      // ユーザー情報を更新または作成
      if (firebaseUser) {
        await firestoreService.updateUser(authUser.uid, { name: userName.trim() });
      } else {
        await firestoreService.createUser({
          name: userName.trim(),
          role: 'member',
        });
      }

      // 更新されたユーザー情報を取得
      const updatedUser = await firestoreService.getUser(authUser.uid);
      dispatch(setFirebaseUser(updatedUser));
      
      setStep('family');
    } catch (error) {
      console.error('Failed to save user name:', error);
      Alert.alert('エラー', '名前の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('エラー', '家族名を入力してください');
      return;
    }

    if (!authUser?.uid) return;

    setIsLoading(true);
    try {
      // 家族を作成
      const familyId = await firestoreService.createFamily({
        name: familyName.trim(),
        memberIds: [authUser.uid],
        adminId: authUser.uid,
        subscriptionPlan: 'free',
        inviteCode: generateInviteCode(),
      });

      // ユーザーのfamilyIdを更新
      await firestoreService.updateUser(authUser.uid, { 
        familyId,
        role: 'admin' 
      });

      // 更新されたユーザー情報を取得
      const updatedUser = await firestoreService.getUser(authUser.uid);
      dispatch(setFirebaseUser(updatedUser));

      Alert.alert('成功', '家族が作成されました！');
    } catch (error) {
      console.error('Failed to create family:', error);
      Alert.alert('エラー', '家族の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      Alert.alert('エラー', '招待コードを入力してください');
      return;
    }

    if (!authUser?.uid) return;

    setIsLoading(true);
    try {
      // 招待コードで家族を検索
      // TODO: 招待コードでの検索機能を実装
      Alert.alert('開発中', 'この機能は現在開発中です');
    } catch (error) {
      console.error('Failed to join family:', error);
      Alert.alert('エラー', '家族への参加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  if (step === 'name') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card variant="elevated" padding="large">
          <Text style={styles.title}>ようこそ！</Text>
          <Text style={styles.subtitle}>まず、あなたの名前を教えてください</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>お名前</Text>
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="山田太郎"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title="次へ"
            onPress={handleSaveName}
            loading={isLoading}
            disabled={!userName.trim()}
            size="large"
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card variant="elevated" padding="large" style={styles.card}>
        <Text style={styles.title}>家族の設定</Text>
        <Text style={styles.subtitle}>新しい家族を作成するか、既存の家族に参加してください</Text>
      </Card>

      <Card variant="default" padding="large" style={styles.card}>
        <Text style={styles.sectionTitle}>新しい家族を作成</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>家族名</Text>
          <TextInput
            style={styles.textInput}
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="山田家"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Button
          title="家族を作成"
          onPress={handleCreateFamily}
          loading={isLoading}
          disabled={!familyName.trim()}
          variant="primary"
          size="large"
        />
      </Card>

      <Card variant="default" padding="large" style={styles.card}>
        <Text style={styles.sectionTitle}>既存の家族に参加</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>招待コード</Text>
          <TextInput
            style={styles.textInput}
            value={familyCode}
            onChangeText={setFamilyCode}
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <Button
          title="家族に参加"
          onPress={handleJoinFamily}
          loading={isLoading}
          disabled={!familyCode.trim()}
          variant="secondary"
          size="large"
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
});

export default FamilySetupScreen;
