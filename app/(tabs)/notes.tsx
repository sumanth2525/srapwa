import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { Note, FilterOptions } from '../../types';

export default function NotesScreen() {
  const { notes, deleteNote, isOffline } = useFirebaseStore();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNotes = notes.filter(note => {
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category && note.category !== filters.category) {
      return false;
    }
    return true;
  });

  const categories = ['Ideas', 'Meeting Notes', 'Personal', 'Work', 'Learning', 'Other'];

  const getNotePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
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

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Notes</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <Ionicons 
                name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
            <Link href="/add-note" asChild>
              <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Add Note</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Search and Filters */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-3 py-1 rounded-full ${filters.category === category ? 'bg-blue-100' : 'bg-gray-100'}`}
                  onPress={() => setFilters({ ...filters, category: filters.category === category ? undefined : category })}
                >
                  <Text className={`text-sm ${filters.category === category ? 'text-blue-700' : 'text-gray-700'}`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Notes Grid/List */}
        {filteredNotes.length > 0 ? (
          <View className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredNotes.map((note) => (
              <View 
                key={note.id} 
                className={`bg-white rounded-lg shadow-sm ${viewMode === 'grid' ? 'p-4' : 'p-4'}`}
                style={note.color ? { borderLeftColor: note.color, borderLeftWidth: 4 } : {}}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                    {note.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteNote(note.id)}
                    className="p-1"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-600 mb-3">
                  {viewMode === 'grid' ? getNotePreview(note.content) : note.content}
                </Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    {note.category && (
                      <View className="bg-blue-100 px-2 py-1 rounded-full">
                        <Text className="text-xs text-blue-700">{note.category}</Text>
                      </View>
                    )}
                    {note.tags && note.tags.length > 0 && (
                      <View className="flex-row gap-1">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <View key={index} className="bg-gray-100 px-2 py-1 rounded-full">
                            <Text className="text-xs text-gray-600">#{tag}</Text>
                          </View>
                        ))}
                        {note.tags.length > 2 && (
                          <Text className="text-xs text-gray-500">+{note.tags.length - 2}</Text>
                        )}
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-xs text-gray-500">
                    {formatDate(note.updatedAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Ionicons name="document-text-outline" size={48} color="#6B7280" />
            <Text className="text-gray-500 mt-4 text-center">
              {searchQuery || filters.category 
                ? 'No notes match your filters' 
                : 'No notes yet. Add your first note to get started!'}
            </Text>
            {!searchQuery && !filters.category && (
              <Link href="/add-note" asChild>
                <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg mt-4">
                  <Text className="text-white font-medium">Add Note</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        )}
      </ResponsiveContainer>
    </ScrollView>
  );
}
