import { renderHook, act } from '@testing-library/react-hooks';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import { Task, Note, Transaction, User, DashboardStats } from '../../types';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('useFirebaseStore Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    act(() => {
      useFirebaseStore.getState().setTasks([]);
      useFirebaseStore.getState().setNotes([]);
      useFirebaseStore.getState().setTransactions([]);
      useFirebaseStore.getState().setUser(null);
    });
  });

  describe('User Management', () => {
    it('should set and get user correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should initialize mock data correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.initializeMockData();
      });

      expect(result.current.user).toBeTruthy();
      expect(result.current.tasks.length).toBeGreaterThan(0);
      expect(result.current.notes.length).toBeGreaterThan(0);
      expect(result.current.transactions.length).toBeGreaterThan(0);
      expect(result.current.dashboardStats).toBeTruthy();
    });
  });

  describe('Task Management', () => {
    it('should add task correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTask: Task = {
        id: 'task-1',
        userId: 'user-1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTask(mockTask);
      });

      expect(result.current.tasks).toContain(mockTask);
    });

    it('should update task correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTask: Task = {
        id: 'task-1',
        userId: 'user-1',
        title: 'Test Task',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTask(mockTask);
        result.current.updateTask('task-1', { completed: true });
      });

      const updatedTask = result.current.tasks.find(t => t.id === 'task-1');
      expect(updatedTask?.completed).toBe(true);
    });

    it('should delete task correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTask: Task = {
        id: 'task-1',
        userId: 'user-1',
        title: 'Test Task',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTask(mockTask);
        result.current.deleteTask('task-1');
      });

      expect(result.current.tasks).not.toContain(mockTask);
    });
  });

  describe('Note Management', () => {
    it('should add note correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockNote: Note = {
        id: 'note-1',
        userId: 'user-1',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addNote(mockNote);
      });

      expect(result.current.notes).toContain(mockNote);
    });

    it('should update note correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockNote: Note = {
        id: 'note-1',
        userId: 'user-1',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addNote(mockNote);
        result.current.updateNote('note-1', { title: 'Updated Note' });
      });

      const updatedNote = result.current.notes.find(n => n.id === 'note-1');
      expect(updatedNote?.title).toBe('Updated Note');
    });

    it('should delete note correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockNote: Note = {
        id: 'note-1',
        userId: 'user-1',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addNote(mockNote);
        result.current.deleteNote('note-1');
      });

      expect(result.current.notes).not.toContain(mockNote);
    });
  });

  describe('Transaction Management', () => {
    it('should add transaction correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTransaction(mockTransaction);
      });

      expect(result.current.transactions).toContain(mockTransaction);
    });

    it('should update transaction correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTransaction(mockTransaction);
        result.current.updateTransaction('transaction-1', { amount: 200 });
      });

      const updatedTransaction = result.current.transactions.find(t => t.id === 'transaction-1');
      expect(updatedTransaction?.amount).toBe(200);
    });

    it('should delete transaction correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());
      const mockTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addTransaction(mockTransaction);
        result.current.deleteTransaction('transaction-1');
      });

      expect(result.current.transactions).not.toContain(mockTransaction);
    });
  });

  describe('UI State Management', () => {
    it('should manage loading state correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setIsLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should manage error state correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });

    it('should manage offline state correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.setIsOffline(true);
      });

      expect(result.current.isOffline).toBe(true);

      act(() => {
        result.current.setIsOffline(false);
      });

      expect(result.current.isOffline).toBe(false);
    });

    it('should manage pending writes correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.setPendingWrites(5);
      });

      expect(result.current.pendingWrites).toBe(5);

      act(() => {
        result.current.setPendingWrites(0);
      });

      expect(result.current.pendingWrites).toBe(0);
    });
  });

  describe('Dashboard Stats', () => {
    it('should calculate dashboard stats correctly', () => {
      const { result } = renderHook(() => useFirebaseStore());

      act(() => {
        result.current.initializeMockData();
      });

      const stats = result.current.dashboardStats;
      expect(stats).toBeTruthy();
      expect(typeof stats?.totalTasks).toBe('number');
      expect(typeof stats?.completedTasks).toBe('number');
      expect(typeof stats?.totalNotes).toBe('number');
      expect(typeof stats?.totalIncome).toBe('number');
      expect(typeof stats?.totalExpenses).toBe('number');
      expect(typeof stats?.netWorth).toBe('number');
    });
  });
});
