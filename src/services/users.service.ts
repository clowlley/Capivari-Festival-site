import api from './api';
import type { UserProfile, FollowResult } from '@/types/user.types';
import type { Topic } from '@/types/community.types';

export const usersService = {
  async getProfile(id: number | string): Promise<UserProfile> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async getUserTopics(id: number | string): Promise<Topic[]> {
    const { data } = await api.get(`/users/${id}/topics`);
    return data;
  },

  async toggleFollow(id: number | string): Promise<FollowResult> {
    const { data } = await api.post(`/users/${id}/follow`);
    return data;
  },
};
