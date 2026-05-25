export interface Display {
  id: number;
  name: string;
  screen_code: string;
  youtube_url: string;
  loop: boolean;
  autoplay: boolean;
  fullscreen: boolean;
  last_seen?: string | null;
  online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DisplayFormState {
  name: string;
  screen_code: string;
  youtube_url: string;
  loop: boolean;
  autoplay: boolean;
  fullscreen: boolean;
}

export interface DisplayPublic {
  id: number;
  name: string;
  screen_code: string;
  youtube_url: string;
  loop: boolean;
  autoplay: boolean;
  fullscreen: boolean;
}
