export interface User {
  id: string;
  displayName: string;
  email: string;
  picture: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  confidence?: number;
}

export interface ParsedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
  date: Date;
}

export interface SpendingInsight {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}