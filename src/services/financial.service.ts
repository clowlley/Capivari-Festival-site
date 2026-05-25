import api from './api';
import type { FinancialEntry } from '@/types/financial.types';

export const financialService = {
  async getEntries(): Promise<FinancialEntry[]> {
    const response = await api.get('/admin/financial');
    return response.data;
  },

  async createEntry(data: Partial<FinancialEntry>): Promise<FinancialEntry> {
    const response = await api.post('/admin/financial', data);
    return response.data;
  },

  async updateEntry(id: number, data: Partial<FinancialEntry>): Promise<FinancialEntry> {
    const response = await api.put(`/admin/financial/${id}`, data);
    return response.data;
  },

  async deleteEntry(id: number): Promise<void> {
    await api.delete(`/admin/financial/${id}`);
  }
};