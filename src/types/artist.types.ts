export interface ArtistPhoto {
  id: number;
  artist_id?: number;
  image: string;
}

export interface ArtistVideo {
  id: number;
  artist_id?: number;
  video_url: string;
}

export interface Artist {
  id: number;
  name: string;
  project_name?: string;
  age?: number;
  musical_styles?: string;
  presskit_url?: string;
  career_years?: number;
  cover_image?: string;
  profile_image?: string;
  biography?: string;
  status: 'draft' | 'published';
  featured: boolean;
  photos: ArtistPhoto[];
  videos?: ArtistVideo[];
  created_at?: string;
  updated_at?: string;
}
