import api from './api';
import type { Product } from '@/types/product.types';

export const productService = {
  async getPublicProducts(params?: Record<string, string | number>): Promise<{ data: Product[]; total: number }> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/products/id/${id}`);
    return response.data;
  },

  async getAdminProducts(): Promise<Product[]> {
    const response = await api.get('/products/admin');
    return response.data;
  },

  async createProduct(data: FormData): Promise<Product> {
    const response = await api.post('/products/admin', data);
    return response.data;
  },

  async updateProduct(id: number, data: FormData): Promise<Product> {
    const response = await api.put(`/products/admin/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/admin/${id}`);
  },

  async deleteProductPhoto(photoId: number): Promise<void> {
    await api.delete(`/products/admin/photos/${photoId}`);
  },
};
