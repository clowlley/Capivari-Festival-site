import api from './api';
import type { AppNotification } from '@/types/user.types';

export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await api.get('/notifications');
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/count');
    return data.unread as number;
  },

  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};
