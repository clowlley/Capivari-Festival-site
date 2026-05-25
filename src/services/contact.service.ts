import api from './api';
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3002/api');

export interface ContactMessage {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  lido: boolean;
  created_at: string;
}

export const contactService = {
  async submit(data: { nome: string; email: string; telefone?: string; assunto: string; mensagem: string }) {
    await axios.post(`${BASE}/contact`, data);
  },

  async getMessages(): Promise<ContactMessage[]> {
    const res = await api.get('/contact/admin');
    return res.data;
  },

  async markRead(id: number) {
    await api.patch(`/contact/admin/${id}/read`);
  },

  async deleteMessage(id: number) {
    await api.delete(`/contact/admin/${id}`);
  },
};
