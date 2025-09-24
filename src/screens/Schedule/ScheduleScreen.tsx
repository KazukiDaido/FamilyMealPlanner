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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addSchedule, updateSchedule, deleteSchedule } from '../../store/slices/mealSlice';
import { MealSchedule } from '../../types';

const ScheduleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { schedules } = useSelector((state: RootState) => state.meals);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealSchedule | null>(null);

  // フォーム用の状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner',
    ingredients: '',
  });

  const [dateSchedules, setDateSchedules] = useState<MealSchedule[]>([]);

  useEffect(() => {
    const filteredSchedules = schedules.filter(schedule => schedule.date === selectedDate);
    setDateSchedules(filteredSchedules);
  }, [schedules, selectedDate]);

  const handleAddMeal = () => {
    if (!formData.title.trim()) {
      Alert.alert('エラー', '食事のタイトルを入力してください');
      return;
    }

    const newMeal: MealSchedule = {
      id: Date.now().toString(),
      date: selectedDate,
      mealType: formData.mealType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      ingredients: formData.ingredients.split(',').map(ingredient => ingredient.trim()).filter(Boolean),
      createdBy: currentUser?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(addSchedule(newMeal));
    resetForm();
    setIsAddModalVisible(false);
    Alert.alert('成功', '食事スケジュールを追加しました');
  };

  const handleEditMeal = () => {
    if (!editingMeal || !formData.title.trim()) {
      Alert.alert('エラー', '食事のタイトルを入力してください');
      return;
    }

    const updatedMeal: MealSchedule = {
      ...editingMeal,
      title: formData.title.trim(),
      description: formData.description.trim(),
      mealType: formData.mealType,
      ingredients: formData.ingredients.split(',').map(ingredient => ingredient.trim()).filter(Boolean),
      updatedAt: new Date(),
    };

    dispatch(updateSchedule(updatedMeal));
    resetForm();
    setIsEditModalVisible(false);
    setEditingMeal(null);
    Alert.alert('成功', '食事スケジュールを更新しました');
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      '確認',
      'この食事スケジュールを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteSchedule(mealId));
            Alert.alert('成功', '食事スケジュールを削除しました');
          },
        },
      ]
    );
  };

  const handleEditPress = (meal: MealSchedule) => {
    setEditingMeal(meal);
    setFormData({
      title: meal.title,
      description: meal.description || '',
      mealType: meal.mealType,
      ingredients: meal.ingredients.join(', '),
    });
    setIsEditModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      mealType: 'breakfast',
      ingredients: '',
    });
  };

  const getMealTypeText = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return mealType;
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FFD700';
      case 'lunch': return '#FFA500';
      case 'dinner': return '#FF6347';
      default: return '#007AFF';
    }
  };

  const renderMealItem = ({ item }: { item: MealSchedule }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(item.mealType) }]}>
          <Text style={styles.mealTypeText}>{getMealTypeText(item.mealType)}</Text>
        </View>
        <View style={styles.mealActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditPress(item)}
          >
            <Text style={styles.actionButtonText}>編集</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteMeal(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>削除</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.mealTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.mealDescription}>{item.description}</Text>
      )}
      {item.ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsLabel}>材料:</Text>
          <Text style={styles.ingredientsText}>
            {item.ingredients.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 日付選択 */}
      <View style={styles.dateSelector}>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ 追加</Text>
        </TouchableOpacity>
      </View>

      {/* 食事リスト */}
      <FlatList
        data={dateSchedules}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
        style={styles.mealsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedDate}の食事スケジュールはありません
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>食事を追加</Text>
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>食事を追加</Text>
            
            <TextInput
              style={styles.input}
              placeholder="食事のタイトル"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="説明（任意）"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            
            <View style={styles.mealTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'breakfast' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'breakfast' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'breakfast' && styles.mealTypeButtonTextActive
                ]}>朝食</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'lunch' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'lunch' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'lunch' && styles.mealTypeButtonTextActive
                ]}>昼食</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'dinner' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'dinner' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'dinner' && styles.mealTypeButtonTextActive
                ]}>夕食</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="材料（カンマ区切り）"
              value={formData.ingredients}
              onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
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
                onPress={handleAddMeal}
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
            <Text style={styles.modalTitle}>食事を編集</Text>
            
            <TextInput
              style={styles.input}
              placeholder="食事のタイトル"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="説明（任意）"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            
            <View style={styles.mealTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'breakfast' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'breakfast' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'breakfast' && styles.mealTypeButtonTextActive
                ]}>朝食</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'lunch' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'lunch' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'lunch' && styles.mealTypeButtonTextActive
                ]}>昼食</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mealTypeButton,
                  formData.mealType === 'dinner' && styles.mealTypeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, mealType: 'dinner' })}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  formData.mealType === 'dinner' && styles.mealTypeButtonTextActive
                ]}>夕食</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="材料（カンマ区切り）"
              value={formData.ingredients}
              onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setEditingMeal(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleEditMeal}
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
  dateSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mealsList: {
    flex: 1,
    padding: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  mealTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealActions: {
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
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientsLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  ingredientsText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
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
  mealTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  mealTypeButtonTextActive: {
    color: '#fff',
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

export default ScheduleScreen;

