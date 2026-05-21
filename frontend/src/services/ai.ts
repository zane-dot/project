import { api } from './api';
import type { Insights } from '../types';

export const aiService = {
  async insights(): Promise<Insights> {
    const { data } = await api.get<Insights>('/ai/insights');
    return data;
  },
};
