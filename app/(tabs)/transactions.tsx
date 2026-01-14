import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { Chart } from '../../components/Chart';
import { Transaction, FilterOptions } from '../../types';

export default function TransactionsScreen() {
  const { transactions, deleteTransaction, isOffline } = useFirebaseStore();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  const filteredTransactions = transactions.filter(transaction => {
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    return true;
  });

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'],
  };

  const allCategories = [...categories.income, ...categories.expense];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Prepare chart data
  const monthlyData = transactions
    .filter(t => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return t.date >= sixMonthsAgo;
    })
    .reduce((acc, transaction) => {
      const month = transaction.date.toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    x: month,
    y: data.income - data.expense,
  }));

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    x: category,
    y: amount,
  }));

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
          <Text className="text-2xl font-bold text-gray-900">Transactions</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <Ionicons 
                name={viewMode === 'list' ? 'bar-chart-outline' : 'list-outline'} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
            <Link href="/add-transaction" asChild>
              <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Add Transaction</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-sm text-gray-600">Total Income</Text>
            <Text className="text-xl font-bold text-green-600">
              {formatAmount(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
            </Text>
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-sm text-gray-600">Total Expenses</Text>
            <Text className="text-xl font-bold text-red-600">
              {formatAmount(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
            </Text>
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-sm text-gray-600">Net Worth</Text>
            <Text className="text-xl font-bold text-gray-900">
              {formatAmount(
                transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
              )}
            </Text>
          </View>
        </View>

        {/* Charts View */}
        {viewMode === 'chart' && (
          <View className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Chart
              data={chartData}
              type="line"
              title="Monthly Net Worth Trend"
              yLabel="Net Worth ($)"
              color="#5B21B6"
            />
            <Chart
              data={pieData}
              type="pie"
              title="Expense Categories"
              colors={['#5B21B6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
            />
          </View>
        )}

        {/* Search and Filters */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${filters.type === 'income' ? 'bg-green-100' : 'bg-gray-100'}`}
                onPress={() => setFilters({ ...filters, type: filters.type === 'income' ? undefined : 'income' })}
              >
                <Text className={`text-sm ${filters.type === 'income' ? 'text-green-700' : 'text-gray-700'}`}>
                  Income
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${filters.type === 'expense' ? 'bg-red-100' : 'bg-gray-100'}`}
                onPress={() => setFilters({ ...filters, type: filters.type === 'expense' ? undefined : 'expense' })}
              >
                <Text className={`text-sm ${filters.type === 'expense' ? 'text-red-700' : 'text-gray-700'}`}>
                  Expense
                </Text>
              </TouchableOpacity>

              {allCategories.map((category) => (
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

        {/* Transactions List */}
        {viewMode === 'list' && (
          <View className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <View key={transaction.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-medium text-gray-900">
                        {transaction.description}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className={`px-2 py-1 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {transaction.category}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </Text>
                        {transaction.recurring && (
                          <View className="bg-blue-100 px-2 py-1 rounded-full">
                            <Text className="text-xs text-blue-700">Recurring</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <Text className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteTransaction(transaction.id)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Ionicons name="wallet-outline" size={48} color="#6B7280" />
                <Text className="text-gray-500 mt-4 text-center">
                  {searchQuery || filters.category || filters.type
                    ? 'No transactions match your filters' 
                    : 'No transactions yet. Add your first transaction to get started!'}
                </Text>
                {!searchQuery && !filters.category && !filters.type && (
                  <Link href="/add-transaction" asChild>
                    <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-lg mt-4">
                      <Text className="text-white font-medium">Add Transaction</Text>
                    </TouchableOpacity>
                  </Link>
                )}
              </View>
            )}
          </View>
        )}
      </ResponsiveContainer>
    </ScrollView>
  );
}
