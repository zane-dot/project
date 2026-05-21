import { api } from './api';
import type { Budget } from '../types';

export interface BudgetInput {
  category: string;
  limit: number;
  month: number;
  year: number;
}

export const budgetService = {
  async list(month?: number, year?: number): Promise<Budget[]> {
    const { data } = await api.get<Budget[]>('/budgets', { params: { month, year } });
    return data;
  },

  async upsert(input: BudgetInput): Promise<Budget> {
    const { data } = await api.post<Budget>('/budgets', input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
