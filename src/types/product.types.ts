export interface Product {
  id: number;
  title: string;
  description: string;
  full_content?: string;
  cover_image?: string;
  category?: string;
  price: number;
  stock: number;
  status: 'draft' | 'published';
  featured: boolean;
  whatsapp?: string;
  created_at?: string;
  updated_at?: string;
}
