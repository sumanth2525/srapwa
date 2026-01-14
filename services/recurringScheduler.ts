import { Transaction } from '../types';
import { useFirebaseStore } from '../hooks/useFirebaseStore';

export class RecurringTransactionScheduler {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    // Only run on web
    if (typeof window === 'undefined') return;

    // Schedule daily check at midnight
    this.scheduleDailyCheck();
    
    // Also run immediately on app load
    this.processRecurringTransactions();
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private static scheduleDailyCheck() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    // Set timeout for midnight, then set interval for daily checks
    setTimeout(() => {
      this.processRecurringTransactions();
      this.intervalId = setInterval(() => {
        this.processRecurringTransactions();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);
  }

  private static processRecurringTransactions() {
    const { transactions, addTransaction, user } = useFirebaseStore.getState();
    
    if (!user) return;

    const now = new Date();
    const recurringTransactions = transactions.filter(t => t.recurring);

    recurringTransactions.forEach(transaction => {
      if (!transaction.recurring) return;

      const { frequency, interval, templateId } = transaction.recurring;
      const periodKey = this.generatePeriodKey(frequency, now);
      
      // Check if we already created a transaction for this period
      const existingTransaction = transactions.find(t => 
        t.templateId === templateId && 
        t.periodKey === periodKey
      );

      if (existingTransaction) return;

      // Check if we should create a new transaction based on frequency
      if (this.shouldCreateTransaction(transaction, now, frequency, interval)) {
        const newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: user.id,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: this.calculateNextDate(transaction.date, frequency, interval),
          templateId,
          periodKey,
        };

        addTransaction({
          ...newTransaction,
          id: `transaction-${Date.now()}-${Math.random()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  }

  private static generatePeriodKey(frequency: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const week = this.getWeekNumber(date);
    const day = String(date.getDate()).padStart(2, '0');

    switch (frequency) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'weekly':
        return `${year}-W${week}`;
      case 'monthly':
        return `${year}-${month}`;
      case 'yearly':
        return `${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private static shouldCreateTransaction(
    transaction: Transaction, 
    now: Date, 
    frequency: string, 
    interval: number
  ): boolean {
    const lastTransactionDate = transaction.date;
    const daysSinceLastTransaction = (now.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (frequency) {
      case 'daily':
        return daysSinceLastTransaction >= interval;
      case 'weekly':
        return daysSinceLastTransaction >= (interval * 7);
      case 'monthly':
        return daysSinceLastTransaction >= (interval * 30);
      case 'yearly':
        return daysSinceLastTransaction >= (interval * 365);
      default:
        return false;
    }
  }

  private static calculateNextDate(
    lastDate: Date, 
    frequency: string, 
    interval: number
  ): Date {
    const nextDate = new Date(lastDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }
}
