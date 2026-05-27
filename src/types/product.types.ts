export interface ProductPhoto {
  id: number;
  image: string;
}

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
  photos?: ProductPhoto[];
  created_at?: string;
  updated_at?: string;
}
