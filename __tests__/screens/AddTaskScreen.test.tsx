import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import AddTaskScreen from '../../app/add-task';

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

describe('AddTaskScreen', () => {
  const mockStore = {
    addTask: jest.fn(),
    user: { id: 'user-1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFirebaseStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders add task form correctly', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Add New Task')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter task title')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter task description')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy(); // Default priority
    expect(screen.getByText('Add Task')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('allows entering task title', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText('Enter task title');
    fireEvent.changeText(titleInput, 'Test Task Title');

    expect(titleInput.props.value).toBe('Test Task Title');
  });

  it('allows entering task description', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const descriptionInput = screen.getByPlaceholderText('Enter task description');
    fireEvent.changeText(descriptionInput, 'Test task description');

    expect(descriptionInput.props.value).toBe('Test task description');
  });

  it('allows selecting priority', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const highPriorityButton = screen.getByText('High');
    fireEvent.press(highPriorityButton);

    expect(highPriorityButton.props.className).toContain('border-purple-500');
  });

  it('allows selecting category', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const workCategoryButton = screen.getByText('Work');
    fireEvent.press(workCategoryButton);

    expect(workCategoryButton.props.className).toContain('bg-blue-100');
  });

  it('allows entering due date', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const dueDateInput = screen.getByPlaceholderText('YYYY-MM-DD (optional)');
    fireEvent.changeText(dueDateInput, '2024-12-31');

    expect(dueDateInput.props.value).toBe('2024-12-31');
  });

  it('submits task with valid data', async () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description');
    const submitButton = screen.getByText('Add Task');

    fireEvent.changeText(titleInput, 'Test Task');
    fireEvent.changeText(descriptionInput, 'Test Description');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockStore.addTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          priority: 'medium',
        })
      );
    });
  });

  it('shows error for empty title', async () => {
    // Mock Alert
    const mockAlert = jest.fn();
    global.alert = mockAlert;

    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Add Task');
    fireEvent.press(submitButton);

    expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter a task title');
  });

  it('handles form submission with loading state', async () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText('Enter task title');
    const submitButton = screen.getByText('Add Task');

    fireEvent.changeText(titleInput, 'Test Task');
    fireEvent.press(submitButton);

    // Should show loading state
    expect(screen.getByText('Adding...')).toBeTruthy();
  });

  it('allows canceling form submission', () => {
    // Mock router.back
    const mockRouter = require('expo-router');
    mockRouter.router.back = jest.fn();

    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockRouter.router.back).toHaveBeenCalled();
  });

  it('handles multiple category selections', () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const workCategoryButton = screen.getByText('Work');
    fireEvent.press(workCategoryButton);

    // Pressing again should deselect
    fireEvent.press(workCategoryButton);

    expect(workCategoryButton.props.className).not.toContain('bg-blue-100');
  });

  it('handles form with all fields filled', async () => {
    render(
      <TestWrapper>
        <AddTaskScreen />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText('Enter task title');
    const descriptionInput = screen.getByPlaceholderText('Enter task description');
    const dueDateInput = screen.getByPlaceholderText('YYYY-MM-DD (optional)');
    const highPriorityButton = screen.getByText('High');
    const workCategoryButton = screen.getByText('Work');
    const submitButton = screen.getByText('Add Task');

    fireEvent.changeText(titleInput, 'Complete Project');
    fireEvent.changeText(descriptionInput, 'Finish the project proposal');
    fireEvent.changeText(dueDateInput, '2024-12-31');
    fireEvent.press(highPriorityButton);
    fireEvent.press(workCategoryButton);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockStore.addTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete Project',
          description: 'Finish the project proposal',
          priority: 'high',
          category: 'Work',
          dueDate: new Date('2024-12-31'),
        })
      );
    });
  });
});
