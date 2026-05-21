export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
  month: number;
  year: number;
  transactionCount: number;
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percent: number;
  overBudget: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Insights {
  insights: string;
  generatedAt: string;
  source: 'openai' | 'fallback';
  model?: string;
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: Array<{ row: number; reason: string }>;
}
