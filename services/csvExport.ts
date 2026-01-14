import { Task, Note, Transaction } from '../types';

export class CSVExportService {
  static exportTasks(tasks: Task[]): string {
    const headers = ['Title', 'Description', 'Completed', 'Priority', 'Category', 'Due Date', 'Created At'];
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.completed ? 'Yes' : 'No',
      task.priority,
      task.category || '',
      task.dueDate ? task.dueDate.toLocaleDateString() : '',
      task.createdAt.toLocaleDateString(),
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  static exportNotes(notes: Note[]): string {
    const headers = ['Title', 'Content', 'Category', 'Color', 'Tags', 'Created At'];
    const rows = notes.map(note => [
      note.title,
      note.content.replace(/\n/g, ' '), // Replace newlines with spaces
      note.category || '',
      note.color || '',
      note.tags?.join('; ') || '',
      note.createdAt.toLocaleDateString(),
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  static exportTransactions(transactions: Transaction[]): string {
    const headers = ['Amount', 'Description', 'Category', 'Type', 'Date', 'Recurring', 'Created At'];
    const rows = transactions.map(transaction => [
      transaction.amount.toString(),
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.date.toLocaleDateString(),
      transaction.recurring ? `${transaction.recurring.frequency} (${transaction.recurring.interval})` : '',
      transaction.createdAt.toLocaleDateString(),
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  static exportToJSON(data: { tasks?: Task[]; notes?: Note[]; transactions?: Transaction[] }): string {
    return JSON.stringify(data, null, 2);
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
    if (typeof window === 'undefined') return;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static exportAll(tasks: Task[], notes: Note[], transactions: Transaction[]): void {
    const data = { tasks, notes, transactions };
    const jsonContent = this.exportToJSON(data);
    this.downloadFile(jsonContent, 'rork-backup.json', 'application/json');
  }
}
