import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addMember, removeMember, updateMember } from '../../store/slices/familySlice';
import { User } from '../../types';

const FamilyScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentFamily, members } = useSelector((state: RootState) => state.family);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      Alert.alert('エラー', '名前とメールアドレスを入力してください');
      return;
    }

    const newMember: User = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: 'member',
      createdAt: new Date(),
    };

    dispatch(addMember(newMember));
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddMemberModalVisible(false);
    Alert.alert('成功', '家族メンバーを追加しました');
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      '確認',
      'この家族メンバーを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            dispatch(removeMember(memberId));
            Alert.alert('成功', '家族メンバーを削除しました');
          },
        },
      ]
    );
  };

  const handleUpdateMemberRole = (memberId: string, newRole: 'admin' | 'member') => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const updatedMember = { ...member, role: newRole };
      dispatch(updateMember(updatedMember));
      Alert.alert('成功', 'メンバーの権限を更新しました');
    }
  };

  const renderMemberItem = ({ item }: { item: User }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberRole}>
          {item.role === 'admin' ? '管理者' : 'メンバー'}
        </Text>
      </View>
      <View style={styles.memberActions}>
        {item.id !== currentUser?.id && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateMemberRole(item.id, item.role === 'admin' ? 'member' : 'admin')}
            >
              <Text style={styles.actionButtonText}>
                {item.role === 'admin' ? '一般' : '管理者'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveMember(item.id)}
            >
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>削除</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (!currentFamily) {
    return (
      <View style={styles.container}>
        <Text style={styles.noFamilyText}>家族が登録されていません</Text>
        <TouchableOpacity style={styles.createFamilyButton}>
          <Text style={styles.createFamilyButtonText}>家族を作成</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.familyName}>{currentFamily.name}</Text>
        <Text style={styles.subscriptionPlan}>
          {currentFamily.subscriptionPlan === 'free' ? '無料プラン' : 
           currentFamily.subscriptionPlan === 'family' ? 'ファミリープラン' : 'プレミアムプラン'}
        </Text>
      </View>

      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>家族メンバー ({members.length}人)</Text>
        <TouchableOpacity
          style={styles.addMemberButton}
          onPress={() => setIsAddMemberModalVisible(true)}
        >
          <Text style={styles.addMemberButtonText}>+ メンバー追加</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        style={styles.membersList}
        showsVerticalScrollIndicator={false}
      />

      {/* メンバー追加モーダル */}
      <Modal
        visible={isAddMemberModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>家族メンバーを追加</Text>
            
            <TextInput
              style={styles.input}
              placeholder="名前"
              value={newMemberName}
              onChangeText={setNewMemberName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="メールアドレス"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddMemberModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddMember}
              >
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  familyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subscriptionPlan: {
    fontSize: 14,
    color: '#666',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addMemberButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMemberButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff4444',
  },
  removeButtonText: {
    color: '#fff',
  },
  noFamilyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createFamilyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  createFamilyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FamilyScreen;

