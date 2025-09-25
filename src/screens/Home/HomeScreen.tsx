import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useFirebaseAttendance } from '../../hooks/useFirebaseAttendance';
import { firestoreService } from '../../services/firestoreService';
import { FirebaseUser } from '../../types/firebase';
// import Share from 'react-native-share'; // Web環境では使用不可
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import GradientBackground from '../../components/ui/GradientBackground';
import { XIcon, CheckIcon, ShareIcon } from '../../components/ui/Icons';

const HomeScreen: React.FC = () => {
  const { firebaseUser } = useSelector((state: RootState) => state.user);
  const { updateAttendance } = useFirebaseAttendance();
  const [familyMembers, setFamilyMembers] = useState<FirebaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const displayName = firebaseUser?.name?.trim() || '私';

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

  const buildMessage = (needDinner: boolean) => {
    const today = new Date();
    const dateText = `${today.getMonth() + 1}/${today.getDate()}`;
    return needDinner
      ? `${displayName}です。${dateText}の晩ごはん、必要です！`
      : `${displayName}です。${dateText}の晩ごはん、今日はいりません！`;
  };

  const handleAttendanceUpdate = async (needDinner: boolean) => {
    if (!firebaseUser?.id) return;

    setIsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const status = needDinner ? 'present' : 'absent';
      
      // Firebaseに出欠情報を保存
      await updateAttendance(today, 'dinner', status);
      
      // 共有メッセージも送信
      const message = buildMessage(needDinner);
      
      // Web環境での共有処理
      if (typeof window !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Family Meal Planner',
          text: message,
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          Alert.alert('更新完了', 'メッセージをクリップボードにコピーしました');
        } else {
          Alert.alert('更新完了', message);
        }
      }
    } catch (error) {
      console.error('Failed to update attendance:', error);
      Alert.alert('エラー', '出欠情報の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const showNameTip = () => {
    if (!firebaseUser?.name) {
      Alert.alert('名前を設定すると便利です', '設定タブから名前を登録できます。');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'おはよう';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <View style={styles.statusBar} />
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar name={displayName} size="large" />
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>{getGreeting()}、{displayName}さん</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('ja-JP', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

      {/* Quick Actions */}
      <Card variant="elevated" padding="large" style={styles.actionCard}>
        <Text style={styles.cardTitle}>今夜のごはん</Text>
        <Text style={styles.cardSubtitle}>ワンタップで家族に連絡</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="今日はいらない"
            onPress={() => {
              showNameTip();
              handleAttendanceUpdate(false);
            }}
            variant="secondary"
            size="large"
            style={styles.actionButton}
            icon={<XIcon size={20} color={colors.error} />}
            loading={isLoading}
            disabled={isLoading}
          />
          
          <Button
            title="いるよ"
            onPress={() => {
              showNameTip();
              handleAttendanceUpdate(true);
            }}
            variant="primary"
            size="large"
            style={styles.actionButton}
            icon={<CheckIcon size={20} color={colors.textDark} />}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </Card>

      {/* Family Status */}
      {familyMembers.length > 0 && (
        <Card variant="default" padding="medium" style={styles.familyCard}>
          <Text style={styles.cardTitle}>家族メンバー</Text>
          <View style={styles.memberList}>
            {familyMembers.slice(0, 4).map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Avatar name={member.name} size="small" />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
              </View>
            ))}
            {familyMembers.length > 4 && (
              <View style={styles.memberItem}>
                <Avatar name={`+${familyMembers.length - 4}`} size="small" backgroundColor={colors.textTertiary} />
                <Text style={styles.memberName}>他{familyMembers.length - 4}人</Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Help Text */}
        <Text style={styles.helpText}>
          設定で名前を登録すると、メッセージに名前が入ります。
        </Text>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120, // タブバーの高さを考慮
  },
  
  // Modern Header
  modernHeader: {
    paddingTop: 0,
    paddingBottom: spacing.xl,
  },
  statusBar: {
    height: 44, // ステータスバーの高さ
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    marginLeft: spacing.md,
    flex: 1,
  },
  greetingText: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  dateText: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // Action Card
  actionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
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
  buttonContainer: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonIcon: {
    fontSize: 20,
  },
  
  // Family Card
  familyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  memberItem: {
    alignItems: 'center',
    width: 80,
  },
  memberName: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Help Text
  helpText: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default HomeScreen;

