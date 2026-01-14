import { RecurringTransactionScheduler } from '../../services/recurringScheduler';
import { Transaction } from '../../types';

// Mock the store
const mockStore = {
  transactions: [] as Transaction[],
  addTransaction: jest.fn(),
  user: { id: 'user-1' },
};

jest.mock('../../hooks/useFirebaseStore', () => ({
  useFirebaseStore: {
    getState: () => mockStore,
  },
}));

describe('RecurringTransactionScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.transactions = [];
    mockStore.addTransaction = jest.fn();
    mockStore.user = { id: 'user-1' };
    
    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    RecurringTransactionScheduler.stop();
  });

  describe('start', () => {
    it('should start scheduler on web platform', () => {
      const originalWindow = global.window;
      global.window = {} as any;

      RecurringTransactionScheduler.start();

      expect(setTimeout).toHaveBeenCalled();
      expect(setInterval).toHaveBeenCalled();

      global.window = originalWindow;
    });

    it('should not start scheduler on non-web platform', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      RecurringTransactionScheduler.start();

      expect(setTimeout).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('stop', () => {
    it('should stop scheduler and clear intervals', () => {
      RecurringTransactionScheduler.start();
      RecurringTransactionScheduler.stop();

      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('processRecurringTransactions', () => {
    it('should process recurring transactions correctly', () => {
      const recurringTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Monthly Rent',
        category: 'Bills',
        type: 'expense',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        recurring: {
          frequency: 'monthly',
          interval: 1,
          templateId: 'template-1',
        },
      };

      mockStore.transactions = [recurringTransaction];

      // Mock the private method by accessing it through the class
      const scheduler = RecurringTransactionScheduler as any;
      scheduler.processRecurringTransactions();

      expect(mockStore.addTransaction).toHaveBeenCalled();
    });

    it('should not create duplicate transactions for same period', () => {
      const recurringTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Monthly Rent',
        category: 'Bills',
        type: 'expense',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        recurring: {
          frequency: 'monthly',
          interval: 1,
          templateId: 'template-1',
        },
      };

      const existingTransaction: Transaction = {
        id: 'transaction-2',
        userId: 'user-1',
        amount: 100,
        description: 'Monthly Rent',
        category: 'Bills',
        type: 'expense',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        templateId: 'template-1',
        periodKey: '2024-01',
      };

      mockStore.transactions = [recurringTransaction, existingTransaction];

      const scheduler = RecurringTransactionScheduler as any;
      scheduler.processRecurringTransactions();

      expect(mockStore.addTransaction).not.toHaveBeenCalled();
    });

    it('should handle transactions without recurring data', () => {
      const regularTransaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'One-time Purchase',
        category: 'Shopping',
        type: 'expense',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockStore.transactions = [regularTransaction];

      const scheduler = RecurringTransactionScheduler as any;
      scheduler.processRecurringTransactions();

      expect(mockStore.addTransaction).not.toHaveBeenCalled();
    });

    it('should handle missing user', () => {
      mockStore.user = null;

      const scheduler = RecurringTransactionScheduler as any;
      scheduler.processRecurringTransactions();

      expect(mockStore.addTransaction).not.toHaveBeenCalled();
    });
  });

  describe('generatePeriodKey', () => {
    it('should generate correct period key for daily frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const date = new Date('2024-01-15');
      
      const result = scheduler.generatePeriodKey('daily', date);
      
      expect(result).toBe('2024-01-15');
    });

    it('should generate correct period key for weekly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const date = new Date('2024-01-15'); // Week 3 of January
      
      const result = scheduler.generatePeriodKey('weekly', date);
      
      expect(result).toMatch(/2024-W\d+/);
    });

    it('should generate correct period key for monthly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const date = new Date('2024-01-15');
      
      const result = scheduler.generatePeriodKey('monthly', date);
      
      expect(result).toBe('2024-01');
    });

    it('should generate correct period key for yearly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const date = new Date('2024-01-15');
      
      const result = scheduler.generatePeriodKey('yearly', date);
      
      expect(result).toBe('2024');
    });
  });

  describe('shouldCreateTransaction', () => {
    it('should return true for daily transaction that should be created', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const transaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Daily Task',
        category: 'Work',
        type: 'income',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const now = new Date('2024-01-02'); // Next day
      
      const result = scheduler.shouldCreateTransaction(transaction, now, 'daily', 1);
      
      expect(result).toBe(true);
    });

    it('should return false for daily transaction that should not be created yet', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const transaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Daily Task',
        category: 'Work',
        type: 'income',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const now = new Date('2024-01-01'); // Same day
      
      const result = scheduler.shouldCreateTransaction(transaction, now, 'daily', 1);
      
      expect(result).toBe(false);
    });

    it('should handle weekly frequency correctly', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const transaction: Transaction = {
        id: 'transaction-1',
        userId: 'user-1',
        amount: 100,
        description: 'Weekly Task',
        category: 'Work',
        type: 'income',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const now = new Date('2024-01-08'); // One week later
      
      const result = scheduler.shouldCreateTransaction(transaction, now, 'weekly', 1);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateNextDate', () => {
    it('should calculate next date for daily frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const lastDate = new Date('2024-01-01');
      
      const result = scheduler.calculateNextDate(lastDate, 'daily', 1);
      
      expect(result.getDate()).toBe(2);
    });

    it('should calculate next date for weekly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const lastDate = new Date('2024-01-01');
      
      const result = scheduler.calculateNextDate(lastDate, 'weekly', 1);
      
      expect(result.getDate()).toBe(8);
    });

    it('should calculate next date for monthly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const lastDate = new Date('2024-01-01');
      
      const result = scheduler.calculateNextDate(lastDate, 'monthly', 1);
      
      expect(result.getMonth()).toBe(1); // February
    });

    it('should calculate next date for yearly frequency', () => {
      const scheduler = RecurringTransactionScheduler as any;
      const lastDate = new Date('2024-01-01');
      
      const result = scheduler.calculateNextDate(lastDate, 'yearly', 1);
      
      expect(result.getFullYear()).toBe(2025);
    });
  });
});
