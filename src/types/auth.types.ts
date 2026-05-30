export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string | null;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface LoginResponse {
  token: string;
  admin: User;
}
