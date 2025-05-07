export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PostCreateInput {
  title: string;
  content: string;
  author_id: string;
  category: string;
  tags?: string[];
}

export interface PostUpdateInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommentCreateInput {
  content: string;
  post_id: string;
  author_id: string;
} 