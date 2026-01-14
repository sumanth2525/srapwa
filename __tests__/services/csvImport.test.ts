import { CSVImportService, CSVTransaction } from '../../services/csvImport';
import { Transaction } from '../../types';

describe('CSVImportService', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV correctly', () => {
      const csvText = `amount,description,category,type,date
100,Grocery Shopping,Food,expense,2024-01-15
500,Salary,Salary,income,2024-01-01`;

      const result = CSVImportService.parseCSV(csvText);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        amount: '100',
        description: 'Grocery Shopping',
        category: 'Food',
        type: 'expense',
        date: '2024-01-15',
      });
    });

    it('should handle empty CSV', () => {
      const csvText = `amount,description,category,type,date`;

      const result = CSVImportService.parseCSV(csvText);

      expect(result).toHaveLength(0);
    });

    it('should throw error for malformed CSV', () => {
      const csvText = `amount,description,category,type,date
100,Grocery Shopping,Food,expense
500,Salary,Salary,income,2024-01-01`;

      expect(() => CSVImportService.parseCSV(csvText)).toThrow();
    });
  });

  describe('validateTransaction', () => {
    it('should validate correct transaction', () => {
      const transaction: CSVTransaction = {
        amount: '100',
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: '2024-01-15',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toHaveLength(0);
    });

    it('should detect invalid amount', () => {
      const transaction: CSVTransaction = {
        amount: 'invalid',
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: '2024-01-15',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toContain('Amount must be a valid number');
    });

    it('should detect missing description', () => {
      const transaction: CSVTransaction = {
        amount: '100',
        description: '',
        category: 'Food',
        type: 'expense',
        date: '2024-01-15',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toContain('Description is required');
    });

    it('should detect missing category', () => {
      const transaction: CSVTransaction = {
        amount: '100',
        description: 'Test Transaction',
        category: '',
        type: 'expense',
        date: '2024-01-15',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toContain('Category is required');
    });

    it('should detect invalid type', () => {
      const transaction: CSVTransaction = {
        amount: '100',
        description: 'Test Transaction',
        category: 'Food',
        type: 'invalid',
        date: '2024-01-15',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toContain('Type must be either "income" or "expense"');
    });

    it('should detect invalid date', () => {
      const transaction: CSVTransaction = {
        amount: '100',
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: 'invalid-date',
      };

      const errors = CSVImportService.validateTransaction(transaction);

      expect(errors).toContain('Date must be a valid date');
    });
  });

  describe('convertToTransaction', () => {
    it('should convert CSV transaction to Transaction correctly', () => {
      const csvTransaction: CSVTransaction = {
        amount: '100',
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: '2024-01-15',
      };

      const result = CSVImportService.convertToTransaction(csvTransaction, 'user-1');

      expect(result).toEqual({
        userId: 'user-1',
        amount: 100,
        description: 'Test Transaction',
        category: 'Food',
        type: 'expense',
        date: new Date('2024-01-15'),
      });
    });
  });

  describe('importFromFile', () => {
    it('should import valid CSV file successfully', async () => {
      const csvContent = `amount,description,category,type,date
100,Grocery Shopping,Food,expense,2024-01-15
500,Salary,Salary,income,2024-01-01`;

      const mockFile = new File([csvContent], 'test.csv', { type: 'text/csv' });

      const result = await CSVImportService.importFromFile(mockFile, 'user-1');

      expect(result.success).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.success[0].amount).toBe(100);
      expect(result.success[1].amount).toBe(500);
    });

    it('should handle CSV with validation errors', async () => {
      const csvContent = `amount,description,category,type,date
invalid,Grocery Shopping,Food,expense,2024-01-15
500,Salary,Salary,income,2024-01-01`;

      const mockFile = new File([csvContent], 'test.csv', { type: 'text/csv' });

      const result = await CSVImportService.importFromFile(mockFile, 'user-1');

      expect(result.success).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].errors).toContain('Amount must be a valid number');
    });

    it('should handle file read errors', async () => {
      const mockFile = {
        ...new File([''], 'test.csv', { type: 'text/csv' }),
        // Mock FileReader to throw error
      };

      // Mock FileReader to simulate error
      const originalFileReader = window.FileReader;
      window.FileReader = jest.fn().mockImplementation(() => ({
        readAsText: jest.fn(),
        onload: null,
        onerror: null,
      }));

      await expect(CSVImportService.importFromFile(mockFile as any, 'user-1')).rejects.toThrow();

      window.FileReader = originalFileReader;
    });
  });
});
