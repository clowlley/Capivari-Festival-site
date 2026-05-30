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

  async createArtist(data: FormData, onProgress?: (pct: number) => void): Promise<Artist> {
    const res = await api.post('/artists/admin', data, {
      onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    });
    return res.data;
  },

  async updateArtist(id: number, data: FormData, onProgress?: (pct: number) => void): Promise<Artist> {
    const res = await api.put(`/artists/admin/${id}`, data, {
      onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    });
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
