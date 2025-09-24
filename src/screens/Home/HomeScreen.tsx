import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Share from 'react-native-share';

const HomeScreen: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  const displayName = currentUser?.name?.trim() || '私';

  const buildMessage = (needDinner: boolean) => {
    const today = new Date();
    const dateText = `${today.getMonth() + 1}/${today.getDate()}`;
    return needDinner
      ? `${displayName}です。${dateText}の晩ごはん、必要です！`
      : `${displayName}です。${dateText}の晩ごはん、今日はいりません！`;
  };

  const sendShare = async (needDinner: boolean) => {
    try {
      const message = buildMessage(needDinner);
      await Share.open({ message });
    } catch (e) {
      // ユーザーがキャンセルした場合などは無視
    }
  };

  const showNameTip = () => {
    if (!currentUser?.name) {
      Alert.alert('名前を設定すると便利です', '設定タブから名前を登録できます。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今夜のごはん</Text>
      <Text style={styles.subtitle}>ワンタップで家族に連絡</Text>

      <TouchableOpacity
        style={[styles.actionButton, styles.noButton]}
        onPress={() => {
          showNameTip();
          sendShare(false);
        }}
      >
        <Text style={styles.actionText}>今日はいらない</Text>
        <Text style={styles.emoji}>🙅‍♂️</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.yesButton]}
        onPress={() => {
          showNameTip();
          sendShare(true);
        }}
      >
        <Text style={styles.actionText}>いるよ</Text>
        <Text style={styles.emoji}>🙋‍♀️</Text>
      </TouchableOpacity>

      <Text style={styles.helper}>設定で名前を登録すると、メッセージに名前が入ります。</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
    maxWidth: 420,
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  noButton: {
    backgroundColor: '#ffe7e7',
  },
  yesButton: {
    backgroundColor: '#e7f6ff',
  },
  actionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  emoji: {
    fontSize: 22,
  },
  helper: {
    marginTop: 24,
    color: '#888',
    fontSize: 12,
  },
});

export default HomeScreen;

