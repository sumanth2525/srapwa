import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Transaction } from '../types';
import { categories } from '../constants/colors';

export default function AddTransactionScreen() {
  const { addTransaction, user } = useFirebaseStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const currentCategories = type === 'income' ? categories.transactions.income : categories.transactions.expense;

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsLoading(true);
    try {
      const transactionDate = date ? new Date(date) : new Date();
      
      const newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user?.id || 'mock-user-1',
        amount: Number(amount),
        description: description.trim(),
        category: category.trim(),
        type,
        date: transactionDate,
        recurring: isRecurring ? {
          frequency: recurringFrequency,
          interval: 1,
          templateId: `template-${Date.now()}`,
        } : undefined,
      };

      addTransaction({
        ...newTransaction,
        id: `transaction-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ResponsiveContainer>
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Add New Transaction</Text>

          {/* Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg border ${
                  type === 'income' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onPress={() => setType('income')}
              >
                <Text className={`text-center font-medium ${
                  type === 'income' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg border ${
                  type === 'expense' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onPress={() => setType('expense')}
              >
                <Text className={`text-center font-medium ${
                  type === 'expense' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Amount *</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-medium text-gray-700 mr-2">$</Text>
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter transaction description"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {currentCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`px-4 py-2 rounded-full ${
                      category === cat ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'
                    } border`}
                    onPress={() => setCategory(cat)}
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

          {/* Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Date</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="YYYY-MM-DD (defaults to today)"
              value={date}
              onChangeText={setDate}
            />
          </View>

          {/* Recurring */}
          <View className="mb-6">
            <TouchableOpacity
              className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <Text className="text-sm font-medium text-gray-700">Make this recurring</Text>
              <Ionicons 
                name={isRecurring ? "checkbox" : "square-outline"} 
                size={20} 
                color={isRecurring ? "#5B21B6" : "#6B7280"} 
              />
            </TouchableOpacity>

            {isRecurring && (
              <View className="mt-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">Frequency</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-lg border ${
                      recurringFrequency === 'weekly' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                    }`}
                    onPress={() => setRecurringFrequency('weekly')}
                  >
                    <Text className={`text-center font-medium ${
                      recurringFrequency === 'weekly' ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-lg border ${
                      recurringFrequency === 'monthly' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                    }`}
                    onPress={() => setRecurringFrequency('monthly')}
                  >
                    <Text className={`text-center font-medium ${
                      recurringFrequency === 'monthly' ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
              className={`flex-1 py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text className="text-center font-medium text-white">
                {isLoading ? 'Adding...' : 'Add Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}
