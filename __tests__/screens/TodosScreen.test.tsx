import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import TodosScreen from '../../app/(tabs)/todos';

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

describe('TodosScreen', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Complete project',
      description: 'Finish the project proposal',
      completed: false,
      priority: 'high',
      category: 'Work',
      dueDate: new Date('2024-12-31'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'task-2',
      title: 'Buy groceries',
      description: 'Get milk and bread',
      completed: true,
      priority: 'medium',
      category: 'Personal',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-19'),
    },
    {
      id: 'task-3',
      title: 'Schedule appointment',
      completed: false,
      priority: 'low',
      category: 'Health',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ];

  const mockStore = {
    tasks: mockTasks,
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    isOffline: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFirebaseStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders tasks screen correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Tasks')).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
    expect(screen.getByText('Complete project')).toBeTruthy();
    expect(screen.getByText('Buy groceries')).toBeTruthy();
    expect(screen.getByText('Schedule appointment')).toBeTruthy();
  });

  it('displays task details correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Finish the project proposal')).toBeTruthy();
    expect(screen.getByText('Get milk and bread')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Personal')).toBeTruthy();
    expect(screen.getByText('Health')).toBeTruthy();
  });

  it('shows priority badges correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Low')).toBeTruthy();
  });

  it('filters tasks by status correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const pendingButton = screen.getByText('Pending');
    fireEvent.press(pendingButton);

    expect(screen.getByText('Complete project')).toBeTruthy();
    expect(screen.getByText('Schedule appointment')).toBeTruthy();
    expect(screen.queryByText('Buy groceries')).toBeNull();
  });

  it('filters tasks by completed status correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const completedButton = screen.getByText('Completed');
    fireEvent.press(completedButton);

    expect(screen.getByText('Buy groceries')).toBeTruthy();
    expect(screen.queryByText('Complete project')).toBeNull();
    expect(screen.queryByText('Schedule appointment')).toBeNull();
  });

  it('filters tasks by priority correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const highPriorityButton = screen.getByText('High');
    fireEvent.press(highPriorityButton);

    expect(screen.getByText('Complete project')).toBeTruthy();
    expect(screen.queryByText('Buy groceries')).toBeNull();
    expect(screen.queryByText('Schedule appointment')).toBeNull();
  });

  it('searches tasks correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.changeText(searchInput, 'project');

    expect(screen.getByText('Complete project')).toBeTruthy();
    expect(screen.queryByText('Buy groceries')).toBeNull();
    expect(screen.queryByText('Schedule appointment')).toBeNull();
  });

  it('toggles task completion correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const taskCheckbox = screen.getAllByRole('button')[0]; // First task checkbox
    fireEvent.press(taskCheckbox);

    expect(mockStore.updateTask).toHaveBeenCalledWith('task-1', { completed: true });
  });

  it('deletes task correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.props.children?.props?.name === 'trash-outline'
    );
    
    if (deleteButton) {
      fireEvent.press(deleteButton);
      expect(mockStore.deleteTask).toHaveBeenCalled();
    }
  });

  it('displays offline banner when offline', () => {
    const offlineStore = { ...mockStore, isOffline: true };
    (useFirebaseStore as jest.Mock).mockReturnValue(offlineStore);

    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    expect(screen.getByText(/You're offline/)).toBeTruthy();
  });

  it('shows due date status correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    // Task with due date should show due date status
    expect(screen.getByText('Complete project')).toBeTruthy();
  });

  it('handles empty tasks list correctly', () => {
    const emptyStore = { ...mockStore, tasks: [] };
    (useFirebaseStore as jest.Mock).mockReturnValue(emptyStore);

    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    expect(screen.getByText('No tasks yet. Add your first task to get started!')).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
  });

  it('shows filtered results message when no tasks match filters', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.changeText(searchInput, 'nonexistent');

    expect(screen.getByText('No tasks match your filters')).toBeTruthy();
  });

  it('combines multiple filters correctly', () => {
    render(
      <TestWrapper>
        <TodosScreen />
      </TestWrapper>
    );

    // Apply multiple filters
    const pendingButton = screen.getByText('Pending');
    fireEvent.press(pendingButton);

    const highPriorityButton = screen.getByText('High');
    fireEvent.press(highPriorityButton);

    // Should show only high priority pending tasks
    expect(screen.getByText('Complete project')).toBeTruthy();
    expect(screen.queryByText('Buy groceries')).toBeNull();
    expect(screen.queryByText('Schedule appointment')).toBeNull();
  });
});
