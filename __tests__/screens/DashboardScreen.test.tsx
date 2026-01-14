import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import DashboardScreen from '../../app/(tabs)/index';

// Mock the store
jest.mock('../../hooks/useFirebaseStore');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('DashboardScreen', () => {
  const mockStore = {
    dashboardStats: {
      totalTasks: 10,
      completedTasks: 7,
      totalNotes: 5,
      totalIncome: 5000,
      totalExpenses: 3000,
      netWorth: 2000,
      monthlyIncome: 1000,
      monthlyExpenses: 800,
    },
    tasks: [
      {
        id: 'task-1',
        title: 'Test Task 1',
        completed: true,
        category: 'Work',
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        completed: false,
        category: 'Personal',
      },
    ],
    notes: [
      {
        id: 'note-1',
        title: 'Test Note 1',
        content: 'Test content',
        category: 'Work',
      },
    ],
    transactions: [
      {
        id: 'transaction-1',
        amount: 100,
        description: 'Test Transaction 1',
        category: 'Food',
        type: 'expense',
        date: new Date('2024-01-15'),
      },
      {
        id: 'transaction-2',
        amount: 500,
        description: 'Test Transaction 2',
        category: 'Salary',
        type: 'income',
        date: new Date('2024-01-01'),
      },
    ],
    isOffline: false,
    pendingWrites: 0,
  };

  beforeEach(() => {
    (useFirebaseStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders dashboard correctly', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Total Tasks')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('7 completed')).toBeTruthy();
    expect(screen.getByText('Notes')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('Net Worth')).toBeTruthy();
    expect(screen.getByText('$2,000')).toBeTruthy();
  });

  it('displays offline banner when offline', () => {
    const offlineStore = { ...mockStore, isOffline: true, pendingWrites: 3 };
    (useFirebaseStore as jest.Mock).mockReturnValue(offlineStore);

    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText(/You're offline/)).toBeTruthy();
    expect(screen.getByText(/3 changes pending sync/)).toBeTruthy();
  });

  it('displays recent tasks correctly', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Tasks')).toBeTruthy();
    expect(screen.getByText('Test Task 1')).toBeTruthy();
    expect(screen.getByText('Test Task 2')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Personal')).toBeTruthy();
  });

  it('displays recent transactions correctly', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Transactions')).toBeTruthy();
    expect(screen.getByText('Test Transaction 1')).toBeTruthy();
    expect(screen.getByText('Test Transaction 2')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Salary')).toBeTruthy();
  });

  it('renders quick action buttons', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Quick Actions')).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
    expect(screen.getByText('Add Note')).toBeTruthy();
    expect(screen.getByText('Add Transaction')).toBeTruthy();
    expect(screen.getByText('View Reports')).toBeTruthy();
  });

  it('handles empty data gracefully', () => {
    const emptyStore = {
      ...mockStore,
      tasks: [],
      notes: [],
      transactions: [],
      dashboardStats: null,
    };
    (useFirebaseStore as jest.Mock).mockReturnValue(emptyStore);

    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('No tasks yet')).toBeTruthy();
    expect(screen.getByText('No transactions yet')).toBeTruthy();
  });

  it('displays monthly income and expenses correctly', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Monthly Income')).toBeTruthy();
    expect(screen.getByText('$1,000')).toBeTruthy();
    expect(screen.getByText('Expenses: $800')).toBeTruthy();
  });

  it('shows net worth calculation', () => {
    render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('This month: $200')).toBeTruthy(); // 1000 - 800
  });
});
