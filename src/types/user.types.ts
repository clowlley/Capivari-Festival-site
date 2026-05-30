export interface UserProfile {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'admin' | 'user';
  created_at: string;
  topic_count: number;
  reply_count: number;
  follower_count: number;
  following_count: number;
  interaction_count: number;
  is_following: boolean;
}

export type NotificationType = 'topic_like' | 'reply_like' | 'topic_reply' | 'follow';

export interface AppNotification {
  id: number;
  type: NotificationType;
  topic_id: number | null;
  reply_id: number | null;
  read: boolean;
  created_at: string;
  actor_id: number | null;
  actor_name: string | null;
  actor_avatar: string | null;
  topic_title: string | null;
}

export interface FollowResult {
  following: boolean;
  follower_count: number;
}

export interface UserSearchResult {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'admin' | 'user';
  follower_count: number;
  is_following: boolean;
}
