import { CSVExportService } from '../../services/csvExport';
import { Task, Note, Transaction } from '../../types';

describe('CSVExportService', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      userId: 'user-1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      priority: 'medium',
      category: 'Work',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  const mockNotes: Note[] = [
    {
      id: 'note-1',
      userId: 'user-1',
      title: 'Test Note',
      content: 'Test Content\nWith newlines',
      category: 'Personal',
      color: '#FF0000',
      tags: ['tag1', 'tag2'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'transaction-1',
      userId: 'user-1',
      amount: 100,
      description: 'Test Transaction',
      category: 'Food',
      type: 'expense',
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  describe('exportTasks', () => {
    it('should export tasks to CSV correctly', () => {
      const result = CSVExportService.exportTasks(mockTasks);

      expect(result).toContain('Title,Description,Completed,Priority,Category,Due Date,Created At');
      expect(result).toContain('Test Task');
      expect(result).toContain('Test Description');
      expect(result).toContain('No');
      expect(result).toContain('medium');
      expect(result).toContain('Work');
    });

    it('should handle empty tasks array', () => {
      const result = CSVExportService.exportTasks([]);

      expect(result).toContain('Title,Description,Completed,Priority,Category,Due Date,Created At');
      expect(result.split('\n')).toHaveLength(2); // Header + empty line
    });
  });

  describe('exportNotes', () => {
    it('should export notes to CSV correctly', () => {
      const result = CSVExportService.exportNotes(mockNotes);

      expect(result).toContain('Title,Content,Category,Color,Tags,Created At');
      expect(result).toContain('Test Note');
      expect(result).toContain('Test Content With newlines'); // Newlines replaced with spaces
      expect(result).toContain('Personal');
      expect(result).toContain('#FF0000');
      expect(result).toContain('tag1; tag2');
    });

    it('should handle notes without optional fields', () => {
      const noteWithoutOptional: Note = {
        id: 'note-2',
        userId: 'user-1',
        title: 'Simple Note',
        content: 'Simple Content',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      const result = CSVExportService.exportNotes([noteWithoutOptional]);

      expect(result).toContain('Simple Note');
      expect(result).toContain('Simple Content');
    });
  });

  describe('exportTransactions', () => {
    it('should export transactions to CSV correctly', () => {
      const result = CSVExportService.exportTransactions(mockTransactions);

      expect(result).toContain('Amount,Description,Category,Type,Date,Recurring,Created At');
      expect(result).toContain('100');
      expect(result).toContain('Test Transaction');
      expect(result).toContain('Food');
      expect(result).toContain('expense');
    });

    it('should handle transactions with recurring data', () => {
      const recurringTransaction: Transaction = {
        ...mockTransactions[0],
        recurring: {
          frequency: 'monthly',
          interval: 1,
          templateId: 'template-1',
        },
      };

      const result = CSVExportService.exportTransactions([recurringTransaction]);

      expect(result).toContain('monthly (1)');
    });
  });

  describe('exportToJSON', () => {
    it('should export data to JSON correctly', () => {
      const data = {
        tasks: mockTasks,
        notes: mockNotes,
        transactions: mockTransactions,
      };

      const result = CSVExportService.exportToJSON(data);

      const parsed = JSON.parse(result);
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.notes).toHaveLength(1);
      expect(parsed.transactions).toHaveLength(1);
      expect(parsed.tasks[0].title).toBe('Test Task');
    });

    it('should handle partial data', () => {
      const data = {
        tasks: mockTasks,
      };

      const result = CSVExportService.exportToJSON(data);

      const parsed = JSON.parse(result);
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.notes).toBeUndefined();
      expect(parsed.transactions).toBeUndefined();
    });
  });

  describe('downloadFile', () => {
    beforeEach(() => {
      // Mock DOM methods
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      global.document.createElement = jest.fn(() => ({
        href: '',
        download: '',
        click: jest.fn(),
      })) as any;
      global.document.body = {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      } as any;
    });

    it('should download CSV file', () => {
      CSVExportService.downloadFile('test,data', 'test.csv', 'text/csv');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.document.createElement).toHaveBeenCalledWith('a');
    });

    it('should download JSON file', () => {
      CSVExportService.downloadFile('{"test": "data"}', 'test.json', 'application/json');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.document.createElement).toHaveBeenCalledWith('a');
    });

    it('should handle non-web environment', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      CSVExportService.downloadFile('test,data', 'test.csv');

      expect(global.URL.createObjectURL).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('exportAll', () => {
    beforeEach(() => {
      // Mock downloadFile method
      jest.spyOn(CSVExportService, 'downloadFile').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should export all data types', () => {
      CSVExportService.exportAll(mockTasks, mockNotes, mockTransactions);

      expect(CSVExportService.downloadFile).toHaveBeenCalledWith(
        expect.stringContaining('tasks'),
        'rork-backup.json',
        'application/json'
      );
    });
  });
});
