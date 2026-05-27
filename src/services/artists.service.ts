import api from './api';
import type { Artist } from '@/types/artist.types';

export const artistsService = {
  async getPublicArtists(): Promise<Artist[]> {
    const res = await api.get('/artists');
    return res.data;
  },

  async getAdminArtists(): Promise<Artist[]> {
    const res = await api.get('/artists/admin');
    return res.data;
  },

  async createArtist(data: FormData): Promise<Artist> {
    const res = await api.post('/artists/admin', data);
    return res.data;
  },

  async updateArtist(id: number, data: FormData): Promise<Artist> {
    const res = await api.put(`/artists/admin/${id}`, data);
    return res.data;
  },

  async deleteArtist(id: number): Promise<void> {
    await api.delete(`/artists/admin/${id}`);
  },

  async deletePhoto(photoId: number): Promise<void> {
    await api.delete(`/artists/admin/photos/${photoId}`);
  },

  async deleteVideo(videoId: number): Promise<void> {
    await api.delete(`/artists/admin/videos/${videoId}`);
  },

  async deleteTrack(trackId: number): Promise<void> {
    await api.delete(`/artists/admin/tracks/${trackId}`);
  },
};
