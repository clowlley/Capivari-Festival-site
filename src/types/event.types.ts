export interface Event {
  id: number;
  title: string;
  description: string;
  full_content?: string;
  cover_image?: string;
  category?: string;
  location_name?: string;
  location_address?: string;
  starts_at: string;
  ends_at?: string;
  event_type?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  featured: boolean;
  registration_url?: string;
  max_attendees?: number;
  price?: number;
  created_at?: string;
  updated_at?: string;
  slug?: string;
}