export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'mentor' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'mentor' | 'admin';
}

export interface UserUpdateInput {
  email?: string;
  password?: string;
  name?: string;
  role?: 'user' | 'mentor' | 'admin';
} 