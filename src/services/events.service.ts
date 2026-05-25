import api from './api';
import type { Event } from '@/types/event.types';

export const eventService = {
  // Público
  async getPublicEvents(params?: Record<string, string | number>): Promise<{ data: Event[], total: number }> {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getPublicEventBySlug(slug: string): Promise<{ data: Event }> {
    const response = await api.get(`/events/${slug}`);
    return response.data;
  },

  async getPublicEventById(id: string | number): Promise<{ data: Event }> {
    const response = await api.get(`/events/id/${id}`);
    return response.data;
  },

  // Admin
  async getAdminEvents(): Promise<Event[]> {
    const response = await api.get('/events/admin/list');
    return response.data;
  },

  async createEvent(data: FormData): Promise<Event> {
    const response = await api.post('/events/admin', data);
    return response.data;
  },

  async updateEvent(id: number, data: FormData): Promise<Event> {
    const response = await api.put(`/events/admin/${id}`, data);
    return response.data;
  },

  async completeEvent(id: number): Promise<Event> {
    const response = await api.patch(`/events/admin/${id}/complete`);
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/events/admin/${id}`);
  }
};