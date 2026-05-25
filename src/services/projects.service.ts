import api from './api';
import type { Project } from '@/types/project.types';

export const projectService = {
  async getPublicProjects(params?: Record<string, string | number>): Promise<{ data: Project[], total: number }> {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  async getAdminProjects(): Promise<Project[]> {
    const response = await api.get('/projects/admin');
    return response.data;
  },

  async createProject(data: FormData): Promise<Project> {
    const response = await api.post('/projects/admin', data);
    return response.data;
  },

  async updateProject(id: number, data: FormData): Promise<Project> {
    const response = await api.put(`/projects/admin/${id}`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/admin/${id}`);
  }
};