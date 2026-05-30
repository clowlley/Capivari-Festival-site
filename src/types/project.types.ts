export interface ProjectPhoto {
  id: number;
  project_id?: number;
  image: string;
}

export interface ProjectVideo {
  id: number;
  project_id?: number;
  video_url: string;
}

export interface ProjectTrack {
  id: number;
  project_id?: number;
  audio_url: string;
  title?: string;
}

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
  photos?: ProjectPhoto[];
  videos?: ProjectVideo[];
  tracks?: ProjectTrack[];
}
