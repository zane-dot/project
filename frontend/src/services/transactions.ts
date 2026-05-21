import { api } from './api';
import type {
  CsvImportResult,
  PagedTransactions,
  Summary,
  Transaction,
  TrendPoint,
} from '../types';

export interface TransactionQuery {
  page?: number;
  limit?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionInput {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description?: string;
  date: string; // ISO
}

export const transactionService = {
  async list(query: TransactionQuery = {}): Promise<PagedTransactions> {
    const { data } = await api.get<PagedTransactions>('/transactions', { params: query });
    return data;
  },

  async create(input: TransactionInput): Promise<Transaction> {
    const { data } = await api.post<Transaction>('/transactions', input);
    return data;
  },

  async update(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
    const { data } = await api.put<Transaction>(`/transactions/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async summary(month?: number, year?: number): Promise<Summary> {
    const { data } = await api.get<Summary>('/transactions/summary', {
      params: { month, year },
    });
    return data;
  },

  async trends(months = 6): Promise<TrendPoint[]> {
    const { data } = await api.get<{ trends: TrendPoint[] }>('/transactions/trends', {
      params: { months },
    });
    return data.trends;
  },

  async importCsv(file: File): Promise<CsvImportResult> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<CsvImportResult>('/transactions/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  exportCsvUrl(): string {
    // Direct download URL — caller should attach token via fetch+blob.
    return '/transactions/export';
  },

  async exportCsv(): Promise<Blob> {
    const { data } = await api.get('/transactions/export', { responseType: 'blob' });
    return data as Blob;
  },
};
