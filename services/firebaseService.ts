import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, Note, Transaction, FilterOptions } from '../types';

// Generic CRUD operations
export class FirebaseService {
  // Tasks
  static async getTasks(userId: string, filters?: FilterOptions, lastDoc?: DocumentSnapshot) {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters?.priority) {
      constraints.push(where('priority', '==', filters.priority));
    }

    if (filters?.status === 'completed') {
      constraints.push(where('completed', '==', true));
    } else if (filters?.status === 'pending') {
      constraints.push(where('completed', '==', false));
    }

    constraints.push(limit(20));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'tasks'), ...constraints);
    const snapshot = await getDocs(q);
    
    return {
      docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  }

  static async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async updateTask(id: string, updates: Partial<Task>) {
    await updateDoc(doc(db, 'tasks', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteTask(id: string) {
    await deleteDoc(doc(db, 'tasks', id));
  }

  // Notes
  static async getNotes(userId: string, filters?: FilterOptions, lastDoc?: DocumentSnapshot) {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
    ];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    constraints.push(limit(20));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'notes'), ...constraints);
    const snapshot = await getDocs(q);
    
    return {
      docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  }

  static async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async updateNote(id: string, updates: Partial<Note>) {
    await updateDoc(doc(db, 'notes', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteNote(id: string) {
    await deleteDoc(doc(db, 'notes', id));
  }

  // Transactions
  static async getTransactions(userId: string, filters?: FilterOptions, lastDoc?: DocumentSnapshot) {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('date', 'desc'),
    ];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters?.dateRange) {
      constraints.push(where('date', '>=', Timestamp.fromDate(filters.dateRange.start)));
      constraints.push(where('date', '<=', Timestamp.fromDate(filters.dateRange.end)));
    }

    constraints.push(limit(20));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'transactions'), ...constraints);
    const snapshot = await getDocs(q);
    
    return {
      docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>) {
    await updateDoc(doc(db, 'transactions', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteTransaction(id: string) {
    await deleteDoc(doc(db, 'transactions', id));
  }

  // Batch operations
  static async batchCreateTransactions(transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) {
    const batch = writeBatch(db);
    
    transactions.forEach(transaction => {
      const docRef = doc(collection(db, 'transactions'));
      batch.set(docRef, {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  // Dashboard stats
  static async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [tasksSnapshot, notesSnapshot, transactionsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'tasks'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'notes'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'transactions'), where('userId', '==', userId))),
    ]);

    const tasks = tasksSnapshot.docs.map(doc => doc.data() as Task);
    const notes = notesSnapshot.docs.map(doc => doc.data() as Note);
    const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);

    const completedTasks = tasks.filter(task => task.completed).length;
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && t.date >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && t.date >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalNotes: notes.length,
      totalIncome,
      totalExpenses,
      netWorth: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
    };
  }
}
