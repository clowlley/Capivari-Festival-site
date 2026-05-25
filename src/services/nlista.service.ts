import api from './api';
import type { ListType, Registration } from '@/types/nlista.types';

export const nlistaService = {
  // Tipos de Lista
  async getListTypes(): Promise<ListType[]> {
    const response = await api.get('/admin/list-types');
    return response.data;
  },

  async createListType(name: string): Promise<ListType> {
    const response = await api.post('/admin/list-types', { name });
    return response.data;
  },

  async updateListType(id: number, name: string): Promise<ListType> {
    const response = await api.put(`/admin/list-types/${id}`, { name });
    return response.data;
  },

  async deleteListType(id: number): Promise<void> {
    await api.delete(`/admin/list-types/${id}`);
  },

  // Registros
  async getRegistrations(): Promise<Registration[]> {
    const response = await api.get('/admin/list-registrations');
    return response.data;
  },

  async createRegistration(data: Partial<Registration>): Promise<Registration> {
    const response = await api.post('/admin/list-registrations', data);
    return response.data;
  },

  async updateRegistration(id: number, data: Partial<Registration>): Promise<Registration> {
    const response = await api.put(`/admin/list-registrations/${id}`, data);
    return response.data;
  },

  async deleteRegistration(id: number): Promise<void> {
    await api.delete(`/admin/list-registrations/${id}`);
  }
};