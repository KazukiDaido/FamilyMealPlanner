import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearUser, setUser, updateUser } from '../../store/slices/userSlice';
import { clearFamily } from '../../store/slices/familySlice';
import { clearShoppingList } from '../../store/slices/shoppingSlice';
import { setSchedules } from '../../store/slices/mealSlice';
import { StorageService } from '../../services/storageService';
import { SyncService } from '../../services/syncService';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentFamily } = useSelector((state: RootState) => state.family);

  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [importData, setImportData] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: () => {
            dispatch(clearUser());
            dispatch(clearFamily());
            dispatch(clearShoppingList());
            dispatch(setSchedules([]));
            Alert.alert('成功', 'ログアウトしました');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'データ削除',
      'すべてのデータを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              dispatch(clearUser());
              dispatch(clearFamily());
              dispatch(clearShoppingList());
              dispatch(setSchedules([]));
              Alert.alert('成功', 'すべてのデータを削除しました');
            } catch (error) {
              Alert.alert('エラー', 'データの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleGenerateQRCode = async () => {
    try {
      const qrData = await SyncService.generateFamilySyncQR();
      setQrCodeData(qrData);
      setIsQRModalVisible(true);
    } catch (error) {
      Alert.alert('エラー', 'QRコードの生成に失敗しました');
    }
  };

  const handleSyncFromQRCode = async () => {
    if (!qrCodeData.trim()) {
      Alert.alert('エラー', 'QRコードデータを入力してください');
      return;
    }

    try {
      await SyncService.syncFromQRCode(qrCodeData);
      setQrCodeData('');
      setIsQRModalVisible(false);
      Alert.alert('成功', 'データの同期が完了しました');
    } catch (error) {
      Alert.alert('エラー', 'データの同期に失敗しました');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportData();
      setImportData(data);
      setIsExportModalVisible(true);
    } catch (error) {
      Alert.alert('エラー', 'データのエクスポートに失敗しました');
    }
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      Alert.alert('エラー', 'インポートデータを入力してください');
      return;
    }

    try {
      await StorageService.importData(importData);
      setImportData('');
      setIsImportModalVisible(false);
      Alert.alert('成功', 'データのインポートが完了しました');
    } catch (error) {
      Alert.alert('エラー', 'データのインポートに失敗しました');
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ユーザー情報（名前の簡易編集） */}
      <View style={styles.userSection}>
        <Text style={styles.sectionTitle}>ユーザー情報</Text>
        <View style={styles.userCard}>
          <Text style={styles.userName}>{currentUser?.name || '未設定'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || '未設定'}</Text>
          <Text style={styles.userRole}>
            {currentUser?.role === 'admin' ? '管理者' : 'メンバー'}
          </Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
            onPress={() => {
              let nameDraft = currentUser?.name || '';
              Alert.prompt?.(
                '名前の設定',
                '通知メッセージに表示されます',
                [
                  {
                    text: 'キャンセル',
                    style: 'cancel',
                  },
                  {
                    text: '保存',
                    onPress: (text?: string) => {
                      const name = (text || '').trim();
                      if (!name) return;
                      if (currentUser) {
                        dispatch(updateUser({ name }));
                      } else {
                        dispatch(setUser({ id: 'local', name, email: '', role: 'member', createdAt: new Date() } as any));
                      }
                    },
                  },
                ],
                'plain-text',
                nameDraft
              );
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>名前を編集</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 家族情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>家族情報</Text>
        <View style={styles.familyCard}>
          <Text style={styles.familyName}>{currentFamily?.name || '未設定'}</Text>
          <Text style={styles.familyPlan}>
            {currentFamily?.subscriptionPlan === 'free' ? '無料プラン' :
             currentFamily?.subscriptionPlan === 'family' ? 'ファミリープラン' :
             'プレミアムプラン'}
          </Text>
          <Text style={styles.familyMembers}>
            メンバー数: {currentFamily?.members.length || 0}人
          </Text>
        </View>
      </View>

      {/* データ同期 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ同期</Text>
        {renderSettingItem(
          'QRコードで同期',
          'QRコードを使って家族間でデータを同期',
          () => setIsQRModalVisible(true)
        )}
        {renderSettingItem(
          'データをエクスポート',
          'データをファイルとして保存',
          handleExportData
        )}
        {renderSettingItem(
          'データをインポート',
          '保存したデータを読み込み',
          () => setIsImportModalVisible(true)
        )}
      </View>

      {/* アプリ設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ設定</Text>
        {renderSettingItem(
          '通知設定',
          'プッシュ通知の設定',
          () => Alert.alert('通知設定', '通知設定画面を開きます')
        )}
        {renderSettingItem(
          'テーマ設定',
          'アプリのテーマを変更',
          () => Alert.alert('テーマ設定', 'テーマ設定画面を開きます')
        )}
        {renderSettingItem(
          '言語設定',
          'アプリの言語を変更',
          () => Alert.alert('言語設定', '言語設定画面を開きます')
        )}
      </View>

      {/* 危険な操作 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>危険な操作</Text>
        {renderSettingItem(
          'ログアウト',
          'アプリからログアウト',
          handleLogout,
          true
        )}
        {renderSettingItem(
          'すべてのデータを削除',
          'アプリのすべてのデータを削除',
          handleClearAllData,
          true
        )}
      </View>

      {/* アプリ情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <View style={styles.appInfoCard}>
          <Text style={styles.appName}>家族食事スケジュール</Text>
          <Text style={styles.appVersion}>バージョン 1.0.0</Text>
          <Text style={styles.appDescription}>
            家族間で食事スケジュールを共有できるアプリです。
          </Text>
        </View>
      </View>

      {/* QRコード同期モーダル */}
      <Modal
        visible={isQRModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsQRModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QRコード同期</Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="QRコードデータを入力"
              value={qrCodeData}
              onChangeText={setQrCodeData}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsQRModalVisible(false);
                  setQrCodeData('');
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleSyncFromQRCode}
              >
                <Text style={styles.addButtonText}>同期</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* データエクスポートモーダル */}
      <Modal
        visible={isExportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>データエクスポート</Text>
            
            <Text style={styles.exportText}>
              以下のデータをコピーして保存してください：
            </Text>
            
            <TextInput
              style={styles.textArea}
              value={importData}
              onChangeText={setImportData}
              multiline
              editable={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsExportModalVisible(false);
                  setImportData('');
                }}
              >
                <Text style={styles.cancelButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* データインポートモーダル */}
      <Modal
        visible={isImportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>データインポート</Text>
            
            <Text style={styles.importText}>
              保存したデータを貼り付けてください：
            </Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="エクスポートしたデータを貼り付け"
              value={importData}
              onChangeText={setImportData}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsImportModalVisible(false);
                  setImportData('');
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleImportData}
              >
                <Text style={styles.addButtonText}>インポート</Text>
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
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  userSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  familyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  familyPlan: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  familyMembers: {
    fontSize: 12,
    color: '#666',
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  settingArrow: {
    fontSize: 20,
    color: '#666',
  },
  destructiveText: {
    color: '#ff4444',
  },
  appInfoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  exportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  importText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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

export default SettingsScreen;

