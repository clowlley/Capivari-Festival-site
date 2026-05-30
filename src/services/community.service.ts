import api from './api';
import type { Category, Topic, TopicDetail, PendingTopic, LikeResult } from '@/types/community.types';

export const communityService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get('/community/categories');
    return data;
  },

  async getTopics(category?: string): Promise<Topic[]> {
    const { data } = await api.get('/community/topics', {
      params: category ? { category } : undefined,
    });
    return data;
  },

  async getTopic(id: number | string): Promise<TopicDetail> {
    const { data } = await api.get(`/community/topics/${id}`);
    return data;
  },

  async createTopic(form: FormData): Promise<{ id: number; status: string }> {
    const { data } = await api.post('/community/topics', form);
    return data;
  },

  async updateTopic(id: number, form: FormData): Promise<{ id: number }> {
    const { data } = await api.put(`/community/topics/${id}`, form);
    return data;
  },

  async deleteTopic(id: number): Promise<void> {
    await api.delete(`/community/topics/${id}`);
  },

  async likeTopic(id: number): Promise<LikeResult> {
    const { data } = await api.post(`/community/topics/${id}/like`);
    return data;
  },

  async createReply(topicId: number, form: FormData): Promise<{ id: number }> {
    const { data } = await api.post(`/community/topics/${topicId}/replies`, form);
    return data;
  },

  async updateReply(id: number, form: FormData): Promise<{ id: number }> {
    const { data } = await api.put(`/community/replies/${id}`, form);
    return data;
  },

  async deleteReply(id: number): Promise<void> {
    await api.delete(`/community/replies/${id}`);
  },

  async likeReply(id: number): Promise<LikeResult> {
    const { data } = await api.post(`/community/replies/${id}/like`);
    return data;
  },

  // ── Moderação (admin) ──
  async getModerationCount(): Promise<{ pending: number }> {
    const { data } = await api.get('/community/moderation/count');
    return data;
  },

  async getPendingTopics(): Promise<PendingTopic[]> {
    const { data } = await api.get('/community/moderation/topics');
    return data;
  },

  async approveTopic(id: number): Promise<void> {
    await api.post(`/community/moderation/topics/${id}/approve`);
  },

  async rejectTopic(id: number): Promise<void> {
    await api.post(`/community/moderation/topics/${id}/reject`);
  },
};
