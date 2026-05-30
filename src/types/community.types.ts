export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  topic_count: number;
}

export interface Topic {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  reply_count?: number;
  like_count: number;
  liked: boolean;
}

export interface Reply {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
  liked: boolean;
}

export interface TopicDetail extends Topic {
  replies: Reply[];
}

export interface PendingTopic {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  category_name: string;
  category_slug: string;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  author_email: string;
}

export interface LikeResult {
  liked: boolean;
  like_count: number;
}
