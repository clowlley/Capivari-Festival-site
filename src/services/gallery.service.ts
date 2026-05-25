import api from './api';
import type { Album, GalleryImage } from '@/types/gallery.types';

export const galleryService = {
  // Álbuns
  async getAlbums(): Promise<Album[]> {
    const response = await api.get('/gallery/albums');
    return response.data;
  },

  async createAlbum(data: FormData): Promise<Album> {
    const response = await api.post('/gallery/admin/albums', data);
    return response.data;
  },

  async deleteAlbum(id: number): Promise<void> {
    await api.delete(`/gallery/admin/albums/${id}`);
  },

  async getImagesByAlbum(albumId: number): Promise<GalleryImage[]> {
    const response = await api.get(`/gallery/album/${albumId}`);
    return response.data;
  },

  // Imagens
  async getImages(): Promise<GalleryImage[]> {
    const response = await api.get('/gallery');
    return response.data;
  },

  async uploadImage(data: FormData): Promise<GalleryImage> {
    const response = await api.post('/gallery/admin', data);
    return response.data;
  },

  async bulkUploadImages(data: FormData): Promise<GalleryImage[]> {
    const response = await api.post('/gallery/admin/bulk', data);
    return response.data;
  },

  async deleteImage(id: number): Promise<void> {
    await api.delete(`/gallery/admin/${id}`);
  }
};