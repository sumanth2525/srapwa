import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { Task } from '../../types';
import { priorities, categories } from '../../constants/colors';

export default function AddTaskScreen() {
  const { addTask, user } = useFirebaseStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsLoading(true);
    try {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user?.id || 'mock-user-1',
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        category: category || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      };

      addTask({
        ...newTask,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ResponsiveContainer>
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Add New Task</Text>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Priority */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Priority</Text>
            <View className="flex-row gap-2">
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  className={`flex-1 p-3 rounded-lg border ${
                    priority === p.value ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                  onPress={() => setPriority(p.value as 'low' | 'medium' | 'high')}
                >
                  <Text className={`text-center font-medium ${
                    priority === p.value ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.tasks.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`px-4 py-2 rounded-full ${
                      category === cat ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'
                    } border`}
                    onPress={() => setCategory(category === cat ? '' : cat)}
                  >
                    <Text className={`text-sm ${
                      category === cat ? 'text-blue-700 font-medium' : 'text-gray-700'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Due Date</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="YYYY-MM-DD (optional)"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-gray-200 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-center font-medium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-purple-600'}`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text className="text-center font-medium text-white">
                {isLoading ? 'Adding...' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}
