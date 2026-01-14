import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from '../providers/QueryProvider';
import { useFirebaseStore } from '../hooks/useFirebaseStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { RecurringTransactionScheduler } from '../services/recurringScheduler';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  const initializeMockData = useFirebaseStore((state) => state.initializeMockData);

  // Enable keyboard shortcuts on web
  useKeyboardShortcuts();

  useEffect(() => {
    // Initialize with mock data for demo
    initializeMockData();
    
    // Start recurring transaction scheduler on web
    if (Platform.OS === 'web') {
      RecurringTransactionScheduler.start();
    }

    // Cleanup on unmount
    return () => {
      if (Platform.OS === 'web') {
        RecurringTransactionScheduler.stop();
      }
    };
  }, [initializeMockData]);

  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#5B21B6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'Rork PWA'
          }} 
        />
        <Stack.Screen 
          name="add-task" 
          options={{ 
            title: 'Add Task',
            presentation: Platform.OS === 'web' ? 'modal' : 'card'
          }} 
        />
        <Stack.Screen 
          name="add-note" 
          options={{ 
            title: 'Add Note',
            presentation: Platform.OS === 'web' ? 'modal' : 'card'
          }} 
        />
        <Stack.Screen 
          name="add-transaction" 
          options={{ 
            title: 'Add Transaction',
            presentation: Platform.OS === 'web' ? 'modal' : 'card'
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </QueryProvider>
  );
}
