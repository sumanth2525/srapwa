import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';

export default function DashboardScreen() {
  const { dashboardStats, tasks, notes, transactions, isOffline, pendingWrites } = useFirebaseStore();

  const recentTasks = tasks.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ResponsiveContainer>
        {/* Offline Banner */}
        {isOffline && (
          <View style={{ backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#F59E0B', padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="warning-outline" size={20} color="#F59E0B" />
              <Text style={{ marginLeft: 8, color: '#92400E' }}>
                You're offline. {pendingWrites > 0 && `${pendingWrites} changes pending sync.`}
              </Text>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Total Tasks</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              {dashboardStats?.totalTasks || 0}
            </Text>
            <Text style={{ fontSize: 14, color: '#10B981' }}>
              {dashboardStats?.completedTasks || 0} completed
            </Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Notes</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              {dashboardStats?.totalNotes || 0}
            </Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Net Worth</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              ${dashboardStats?.netWorth?.toLocaleString() || 0}
            </Text>
            <Text style={{ fontSize: 14, color: '#3B82F6' }}>
              This month: ${((dashboardStats?.monthlyIncome || 0) - (dashboardStats?.monthlyExpenses || 0)).toLocaleString()}
            </Text>
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Monthly Income</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
              ${dashboardStats?.monthlyIncome?.toLocaleString() || 0}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Expenses: ${dashboardStats?.monthlyExpenses?.toLocaleString() || 0}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/add-task" asChild>
              <TouchableOpacity style={{ flex: 1, minWidth: 120, alignItems: 'center', padding: 16, backgroundColor: '#F3E8FF', borderRadius: 8 }}>
                <Ionicons name="add-circle-outline" size={24} color="#5B21B6" />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '500', color: '#7C3AED' }}>Add Task</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/add-note" asChild>
              <TouchableOpacity style={{ flex: 1, minWidth: 120, alignItems: 'center', padding: 16, backgroundColor: '#EFF6FF', borderRadius: 8 }}>
                <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '500', color: '#2563EB' }}>Add Note</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/add-transaction" asChild>
              <TouchableOpacity style={{ flex: 1, minWidth: 120, alignItems: 'center', padding: 16, backgroundColor: '#ECFDF5', borderRadius: 8 }}>
                <Ionicons name="wallet-outline" size={24} color="#10B981" />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '500', color: '#059669' }}>Add Transaction</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Recent Items */}
        <View style={{ gap: 24 }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Recent Tasks</Text>
              <Link href="/todos" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#7C3AED' }}>View All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {recentTasks.length > 0 ? (
              <View style={{ gap: 8 }}>
                {recentTasks.map((task) => (
                  <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '500', textDecorationLine: task.completed ? 'line-through' : 'none', color: task.completed ? '#6B7280' : '#111827' }}>
                        {task.title}
                      </Text>
                      {task.category && (
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{task.category}</Text>
                      )}
                    </View>
                    <Ionicons 
                      name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={task.completed ? "#10B981" : "#6B7280"} 
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#6B7280', textAlign: 'center', paddingVertical: 16 }}>No tasks yet</Text>
            )}
          </View>

          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Recent Transactions</Text>
              <Link href="/transactions" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#7C3AED' }}>View All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {recentTransactions.length > 0 ? (
              <View style={{ gap: 8 }}>
                {recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '500', color: '#111827' }}>{transaction.description}</Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>{transaction.category}</Text>
                    </View>
                    <Text style={{ fontWeight: '600', color: transaction.type === 'income' ? '#10B981' : '#EF4444' }}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#6B7280', textAlign: 'center', paddingVertical: 16 }}>No transactions yet</Text>
            )}
          </View>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}