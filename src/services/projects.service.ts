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

  async createProject(data: FormData, onProgress?: (pct: number) => void): Promise<Project> {
    const response = await api.post('/projects/admin', data, {
      onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    });
    return response.data;
  },

  async updateProject(id: number, data: FormData, onProgress?: (pct: number) => void): Promise<Project> {
    const response = await api.put(`/projects/admin/${id}`, data, {
      onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    });
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/admin/${id}`);
  },

  async deletePhoto(photoId: number): Promise<void> {
    await api.delete(`/projects/admin/photos/${photoId}`);
  },

  async deleteVideo(videoId: number): Promise<void> {
    await api.delete(`/projects/admin/videos/${videoId}`);
  },

  async deleteTrack(trackId: number): Promise<void> {
    await api.delete(`/projects/admin/tracks/${trackId}`);
  }
};