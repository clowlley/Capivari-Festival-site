import api from './api';

export const settingsService = {
  async get(key: string): Promise<string | null> {
    const res = await api.get(`/settings/${key}`);
    return res.data.value;
  },

  async save(key: string, data: FormData): Promise<string | null> {
    const res = await api.put(`/settings/admin/${key}`, data);
    return res.data.value;
  },
};
