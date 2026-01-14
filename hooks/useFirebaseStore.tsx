import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, Note, Transaction, DashboardStats } from '../types';
import { mockUser, mockTasks, mockNotes, mockTransactions } from '../mocks/data';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats | null) => void;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Offline state
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingWrites: number;
  setPendingWrites: (count: number) => void;
  
  // Initialize with mock data
  initializeMockData: () => void;
}

const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (name: string) => {
        try {
          return localStorage.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: (name: string, value: string) => {
        try {
          localStorage.setItem(name, value);
        } catch {
          // Storage quota exceeded or other error
        }
      },
      removeItem: (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch {
          // Error removing item
        }
      },
    };
  }
  return AsyncStorage;
};

export const useFirebaseStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      
      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id)
      })),
      
      // Transactions
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [...state.transactions, transaction] 
      })),
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(transaction => 
          transaction.id === id ? { ...transaction, ...updates, updatedAt: new Date() } : transaction
        )
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(transaction => transaction.id !== id)
      })),
      
      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      
      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      
      // Offline state
      isOffline: false,
      setIsOffline: (offline) => set({ isOffline: offline }),
      pendingWrites: 0,
      setPendingWrites: (count) => set({ pendingWrites: count }),
      
      // Initialize with mock data
      initializeMockData: () => set({
        user: mockUser,
        tasks: mockTasks,
        notes: mockNotes,
        transactions: mockTransactions,
        dashboardStats: {
          totalTasks: mockTasks.length,
          completedTasks: mockTasks.filter(t => t.completed).length,
          totalNotes: mockNotes.length,
          totalIncome: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
          netWorth: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                   mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
          monthlyIncome: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          monthlyExpenses: mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        }
      }),
    }),
    {
      name: 'rork-app-storage',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        user: state.user,
        tasks: state.tasks,
        notes: state.notes,
        transactions: state.transactions,
        dashboardStats: state.dashboardStats,
      }),
    }
  )
);
