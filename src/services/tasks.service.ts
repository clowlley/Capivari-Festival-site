import api from './api';
import type { Task } from '@/types/task.types';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/admin/tasks');
    return response.data;
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await api.post('/admin/tasks', data);
    return response.data;
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/admin/tasks/${id}`, data);
    return response.data;
  }
};