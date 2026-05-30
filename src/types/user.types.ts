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
  is_following: boolean;
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
