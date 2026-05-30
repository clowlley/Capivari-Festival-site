import api from './api';
import type { User, LoginResponse } from '@/types/auth.types';

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: { name: string; email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: FormData): Promise<User> {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
};
