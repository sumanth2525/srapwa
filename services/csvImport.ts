import { Transaction } from '../types';

export interface CSVTransaction {
  amount: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export class CSVImportService {
  static parseCSV(csvText: string): CSVTransaction[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const transactions: CSVTransaction[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has incorrect number of columns`);
      }
      
      const transaction: any = {};
      headers.forEach((header, index) => {
        transaction[header] = values[index];
      });
      
      transactions.push(transaction as CSVTransaction);
    }
    
    return transactions;
  }

  static validateTransaction(transaction: CSVTransaction): string[] {
    const errors: string[] = [];
    
    if (!transaction.amount || isNaN(Number(transaction.amount))) {
      errors.push('Amount must be a valid number');
    }
    
    if (!transaction.description || transaction.description.trim() === '') {
      errors.push('Description is required');
    }
    
    if (!transaction.category || transaction.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      errors.push('Type must be either "income" or "expense"');
    }
    
    if (!transaction.date || isNaN(Date.parse(transaction.date))) {
      errors.push('Date must be a valid date');
    }
    
    return errors;
  }

  static convertToTransaction(csvTransaction: CSVTransaction, userId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId,
      amount: Number(csvTransaction.amount),
      description: csvTransaction.description.trim(),
      category: csvTransaction.category.trim(),
      type: csvTransaction.type,
      date: new Date(csvTransaction.date),
    };
  }

  static async importFromFile(file: File, userId: string): Promise<{
    success: Transaction[];
    errors: { row: number; errors: string[] }[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const csvTransactions = this.parseCSV(csvText);
          
          const success: Transaction[] = [];
          const errors: { row: number; errors: string[] }[] = [];
          
          csvTransactions.forEach((csvTransaction, index) => {
            const validationErrors = this.validateTransaction(csvTransaction);
            
            if (validationErrors.length > 0) {
              errors.push({ row: index + 2, errors: validationErrors }); // +2 because of header row and 0-based index
            } else {
              const transaction = this.convertToTransaction(csvTransaction, userId);
              success.push(transaction as Transaction);
            }
          });
          
          resolve({ success, errors });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
