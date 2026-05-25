import axios from 'axios';
import api from './api';
import type { Display, DisplayFormState, DisplayPublic } from '@/types/display.types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const displaysService = {
  // Admin
  async getDisplays(): Promise<Display[]> {
    const response = await api.get('/displays/admin');
    return response.data;
  },

  async createDisplay(data: DisplayFormState): Promise<Display> {
    const response = await api.post('/displays/admin', data);
    return response.data;
  },

  async updateDisplay(id: number, data: DisplayFormState): Promise<Display> {
    const response = await api.put(`/displays/admin/${id}`, data);
    return response.data;
  },

  async deleteDisplay(id: number): Promise<void> {
    await api.delete(`/displays/admin/${id}`);
  },

  // Público (sem auth — telão abre direto)
  async getByScreenCode(screenCode: string): Promise<DisplayPublic> {
    const response = await axios.get(`${BASE}/displays/by-code/${encodeURIComponent(screenCode)}`);
    return response.data;
  },

  // URL absoluta do stream SSE (usado pelo EventSource)
  streamUrl(screenCode: string): string {
    return `${BASE}/displays/stream/${encodeURIComponent(screenCode)}`;
  },
};
