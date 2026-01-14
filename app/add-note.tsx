import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Note } from '../types';
import { categories } from '../constants/colors';

const colors = [
  { name: 'Purple', value: '#5B21B6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
];

export default function AddNoteScreen() {
  const { addNote, user } = useFirebaseStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a note title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    setIsLoading(true);
    try {
      const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user?.id || 'mock-user-1',
        title: title.trim(),
        content: content.trim(),
        category: category || undefined,
        color: color || undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      };

      addNote({
        ...newNote,
        id: `note-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ResponsiveContainer>
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Add New Note</Text>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter note title"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Content */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Content *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter your note content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.notes.map((cat) => (
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

          {/* Color */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Color</Text>
            <View className="flex-row gap-2 flex-wrap">
              {colors.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    color === c.value ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c.value }}
                  onPress={() => setColor(color === c.value ? '' : c.value)}
                >
                  {color === c.value && (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Tags</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter tags separated by commas (e.g., work, important)"
              value={tags}
              onChangeText={setTags}
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
              className={`flex-1 py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text className="text-center font-medium text-white">
                {isLoading ? 'Adding...' : 'Add Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}
