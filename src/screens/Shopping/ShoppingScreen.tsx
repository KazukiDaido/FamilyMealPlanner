import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  CheckBox,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addItem, updateItem, deleteItem, toggleItemCompletion, clearCompletedItems } from '../../store/slices/shoppingSlice';
import { ShoppingItem } from '../../types';

const ShoppingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentList } = useSelector((state: RootState) => state.shopping);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // フォーム用の状態
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredItems = currentList?.items.filter(item => {
    switch (filter) {
      case 'pending': return !item.isCompleted;
      case 'completed': return item.isCompleted;
      default: return true;
    }
  }) || [];

  const handleAddItem = () => {
    if (!formData.name.trim()) {
      Alert.alert('エラー', 'アイテム名を入力してください');
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      quantity: formData.quantity.trim(),
      unit: formData.unit.trim(),
      isCompleted: false,
      addedBy: currentUser?.id || '',
      createdAt: new Date(),
    };

    dispatch(addItem(newItem));
    resetForm();
    setIsAddModalVisible(false);
    Alert.alert('成功', '買い物アイテムを追加しました');
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.name.trim()) {
      Alert.alert('エラー', 'アイテム名を入力してください');
      return;
    }

    const updatedItem: ShoppingItem = {
      ...editingItem,
      name: formData.name.trim(),
      quantity: formData.quantity.trim(),
      unit: formData.unit.trim(),
    };

    dispatch(updateItem(updatedItem));
    resetForm();
    setIsEditModalVisible(false);
    setEditingItem(null);
    Alert.alert('成功', '買い物アイテムを更新しました');
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      '確認',
      'このアイテムを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteItem(itemId));
            Alert.alert('成功', 'アイテムを削除しました');
          },
        },
      ]
    );
  };

  const handleEditPress = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    });
    setIsEditModalVisible(true);
  };

  const handleToggleCompletion = (itemId: string) => {
    dispatch(toggleItemCompletion(itemId));
  };

  const handleClearCompleted = () => {
    Alert.alert(
      '確認',
      '完了したアイテムをすべて削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCompletedItems());
            Alert.alert('成功', '完了したアイテムを削除しました');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
    });
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={[styles.itemCard, item.isCompleted && styles.completedItem]}>
      <View style={styles.itemContent}>
        <CheckBox
          value={item.isCompleted}
          onValueChange={() => handleToggleCompletion(item.id)}
          style={styles.checkbox}
        />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.isCompleted && styles.completedText]}>
            {item.name}
          </Text>
          {(item.quantity || item.unit) && (
            <Text style={styles.itemDetails}>
              {item.quantity} {item.unit}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPress(item)}
        >
          <Text style={styles.actionButtonText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!currentList) {
    return (
      <View style={styles.container}>
        <Text style={styles.noListText}>買い物リストが作成されていません</Text>
        <TouchableOpacity style={styles.createListButton}>
          <Text style={styles.createListButtonText}>買い物リストを作成</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* フィルター */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            すべて
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            未完了
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
            完了
          </Text>
        </TouchableOpacity>
      </View>

      {/* アクションボタン */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ アイテム追加</Text>
        </TouchableOpacity>
        {filter === 'completed' && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCompleted}
          >
            <Text style={styles.clearButtonText}>完了済み削除</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* アイテムリスト */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === 'all' ? '買い物アイテムはありません' :
               filter === 'pending' ? '未完了のアイテムはありません' :
               '完了したアイテムはありません'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Text style={styles.emptyStateButtonText}>アイテムを追加</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* 追加モーダル */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>アイテムを追加</Text>
            
            <TextInput
              style={styles.input}
              placeholder="アイテム名"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="数量（任意）"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="単位（任意）"
              value={formData.unit}
              onChangeText={(text) => setFormData({ ...formData, unit: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsAddModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 編集モーダル */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>アイテムを編集</Text>
            
            <TextInput
              style={styles.input}
              placeholder="アイテム名"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="数量（任意）"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="単位（任意）"
              value={formData.unit}
              onChangeText={(text) => setFormData({ ...formData, unit: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleEditItem}
              >
                <Text style={styles.addButtonText}>更新</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedItem: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
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
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createListButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  createListButtonText: {
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

export default ShoppingScreen;

