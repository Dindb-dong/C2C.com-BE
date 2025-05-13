export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
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