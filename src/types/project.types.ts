export interface Project {
  id: number;
  title: string;
  description: string;
  full_content?: string;
  cover_image?: string;
  category?: string;
  status: 'draft' | 'published';
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  video_url?: string;
  slug?: string;
  tags?: string[];
}