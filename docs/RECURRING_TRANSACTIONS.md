# Recurring Transactions Implementation Guide

## Overview

This document explains how recurring transactions work in the Rork app, both for web (client-side) and production (server-side) implementations.

## Web Implementation (Current)

### How It Works
Recurring transactions are processed client-side using a scheduler that runs:
- On app load/initialization
- Daily at midnight (using setTimeout/setInterval)
- When manually triggered by user actions

### Key Components

#### 1. Transaction Model
```typescript
interface Transaction {
  // ... other fields
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    templateId: string;
  };
}
```

#### 2. Scheduler Service
```typescript
// services/recurringScheduler.ts
export class RecurringTransactionScheduler {
  static scheduleDailyCheck() {
    // Check for recurring transactions that need to be created
    // Run at midnight daily
  }
  
  static processRecurringTransactions() {
    // Find templates that need new instances
    // Create new transactions based on templates
    // Use templateId + periodKey for idempotency
  }
}
```

#### 3. Idempotency
To prevent duplicate transactions, we use a combination of:
- `templateId`: Unique identifier for the recurring template
- `periodKey`: String representing the time period (e.g., "2024-01", "2024-W03")

### Limitations
- Only works when the app is open
- Relies on client-side timing
- Not suitable for high-frequency recurring transactions

## Production Implementation (Cloud Functions)

### Recommended Architecture

#### 1. Cloud Function Trigger
```javascript
// functions/src/recurringTransactions.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.processRecurringTransactions = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight UTC
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    
    // Get all recurring transaction templates
    const templatesSnapshot = await db.collection('recurringTemplates')
      .where('isActive', '==', true)
      .get();
    
    for (const templateDoc of templatesSnapshot.docs) {
      const template = templateDoc.data();
      await processTemplate(template, now, db);
    }
  });
```

#### 2. Template Processing
```javascript
async function processTemplate(template, now, db) {
  const periodKey = generatePeriodKey(template.frequency, now);
  
  // Check if transaction already exists for this period
  const existingTransaction = await db.collection('transactions')
    .where('templateId', '==', template.id)
    .where('periodKey', '==', periodKey)
    .limit(1)
    .get();
  
  if (!existingTransaction.empty) {
    return; // Already processed
  }
  
  // Create new transaction
  const newTransaction = {
    ...template.transactionData,
    templateId: template.id,
    periodKey: periodKey,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('transactions').add(newTransaction);
}
```

#### 3. Database Schema

**Recurring Templates Collection:**
```typescript
interface RecurringTemplate {
  id: string;
  userId: string;
  isActive: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  startDate: Date;
  endDate?: Date;
  transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Transactions Collection (Enhanced):**
```typescript
interface Transaction {
  // ... existing fields
  templateId?: string;    // Reference to recurring template
  periodKey?: string;     // For idempotency (e.g., "2024-01", "2024-W03")
}
```

### Migration Strategy

#### Phase 1: Dual System
1. Keep current client-side implementation
2. Add Cloud Functions for server-side processing
3. Use feature flag to switch between implementations

#### Phase 2: Server-Side Only
1. Migrate all recurring transactions to templates
2. Remove client-side scheduler
3. Update UI to work with templates

### Benefits of Server-Side Implementation

1. **Reliability**: Runs regardless of app usage
2. **Scalability**: Handles thousands of users efficiently
3. **Accuracy**: Precise timing for recurring transactions
4. **Consistency**: Centralized processing logic
5. **Audit Trail**: Better tracking and debugging

### Implementation Steps

1. **Create Cloud Functions**
   ```bash
   firebase init functions
   npm install firebase-functions firebase-admin
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

3. **Update Client Code**
   - Remove client-side scheduler
   - Update UI to work with templates
   - Add template management screens

4. **Data Migration**
   - Convert existing recurring transactions to templates
   - Update transaction records with template references

### Monitoring and Debugging

#### Cloud Function Logs
```bash
firebase functions:log --only processRecurringTransactions
```

#### Error Handling
```javascript
exports.processRecurringTransactions = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    try {
      // Processing logic
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      // Send alert to monitoring system
    }
  });
```

### Testing

#### Unit Tests
```javascript
// functions/test/recurringTransactions.test.js
const test = require('firebase-functions-test')();

describe('Recurring Transactions', () => {
  it('should create monthly transaction', async () => {
    // Test logic
  });
});
```

#### Integration Tests
- Test with real Firestore database
- Verify idempotency
- Check timing accuracy

## Conclusion

The current web implementation provides basic recurring transaction functionality suitable for development and small-scale usage. For production, implementing Cloud Functions provides better reliability, scalability, and user experience.

The migration can be done gradually, starting with a dual-system approach and eventually moving to server-side only processing.
