import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { Task, FilterOptions } from '../../types';
import { priorities } from '../../constants/colors';

export default function TodosScreen() {
  const { tasks, updateTask, deleteTask, isOffline } = useFirebaseStore();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.status === 'completed' && !task.completed) {
      return false;
    }
    if (filters.status === 'pending' && task.completed) {
      return false;
    }
    return true;
  });

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { completed: !task.completed });
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || '#6B7280';
  };

  const getDueDateStatus = (dueDate?: Date) => {
    if (!dueDate) return null;
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: '#EF4444' };
    if (diffDays === 0) return { text: 'Due Today', color: '#F59E0B' };
    if (diffDays <= 3) return { text: 'Due Soon', color: '#F59E0B' };
    return null;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ResponsiveContainer>
        {/* Offline Banner */}
        {isOffline && (
          <View className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="warning-outline" size={20} color="#F59E0B" />
              <Text className="ml-2 text-yellow-800">You're offline. Changes will sync when online.</Text>
            </View>
          </View>
        )}

        {/* Header with Add Button */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
          <Link href="/add-task" asChild>
            <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Add Task</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Search and Filters */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${filters.status === 'pending' ? 'bg-purple-100' : 'bg-gray-100'}`}
              onPress={() => setFilters({ ...filters, status: filters.status === 'pending' ? undefined : 'pending' })}
            >
              <Text className={`text-sm ${filters.status === 'pending' ? 'text-purple-700' : 'text-gray-700'}`}>
                Pending
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${filters.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}
              onPress={() => setFilters({ ...filters, status: filters.status === 'completed' ? undefined : 'completed' })}
            >
              <Text className={`text-sm ${filters.status === 'completed' ? 'text-green-700' : 'text-gray-700'}`}>
                Completed
              </Text>
            </TouchableOpacity>

            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                className={`px-3 py-1 rounded-full ${filters.priority === priority.value ? 'bg-gray-200' : 'bg-gray-100'}`}
                onPress={() => setFilters({ ...filters, priority: filters.priority === priority.value ? undefined : priority.value })}
              >
                <Text className={`text-sm ${filters.priority === priority.value ? 'text-gray-900' : 'text-gray-700'}`}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tasks List */}
        <View className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const dueDateStatus = getDueDateStatus(task.dueDate);
              return (
                <View key={task.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <TouchableOpacity
                          onPress={() => toggleTask(task.id)}
                          className="mr-3"
                        >
                          <Ionicons
                            name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={task.completed ? "#10B981" : "#6B7280"}
                          />
                        </TouchableOpacity>
                        
                        <View className="flex-1">
                          <Text className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text className="text-gray-600 mt-1">{task.description}</Text>
                          )}
                        </View>
                      </View>

                      <View className="flex-row items-center flex-wrap gap-2 ml-9">
                        {task.category && (
                          <View className="bg-blue-100 px-2 py-1 rounded-full">
                            <Text className="text-xs text-blue-700">{task.category}</Text>
                          </View>
                        )}
                        
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
                        >
                          <Text 
                            className="text-xs font-medium"
                            style={{ color: getPriorityColor(task.priority) }}
                          >
                            {priorities.find(p => p.value === task.priority)?.label}
                          </Text>
                        </View>

                        {dueDateStatus && (
                          <View 
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${dueDateStatus.color}20` }}
                          >
                            <Text 
                              className="text-xs font-medium"
                              style={{ color: dueDateStatus.color }}
                            >
                              {dueDateStatus.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => deleteTask(task.id)}
                      className="ml-2 p-1"
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-white p-8 rounded-lg shadow-sm text-center">
              <Ionicons name="checkmark-circle-outline" size={48} color="#6B7280" />
              <Text className="text-gray-500 mt-4 text-center">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'No tasks match your filters' 
                  : 'No tasks yet. Add your first task to get started!'}
              </Text>
              {!searchQuery && Object.keys(filters).length === 0 && (
                <Link href="/add-task" asChild>
                  <TouchableOpacity className="bg-purple-600 px-6 py-3 rounded-lg mt-4">
                    <Text className="text-white font-medium">Add Task</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          )}
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}
