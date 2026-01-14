export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    templateId: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
