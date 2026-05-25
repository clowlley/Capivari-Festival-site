export interface Album {
  id: number;
  title: string;
  event_id?: number | null;
  cover_image?: string;
  created_at?: string;
  event_title?: string;
}

export interface GalleryImage {
  id: number;
  title?: string;
  album_id?: number | null;
  image: string;
  created_at?: string;
  album_title?: string;
  event_title?: string;
}