export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  problemId?: string; // 문제은행의 특정 문제와 연관된 경우
  metadata?: {
    tokens?: number;
    model?: string;
    temperature?: number;
  };
}

export interface ChatHistory {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalTokens?: number;
    averageResponseTime?: number;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
      tokens?: number;
    };
  }>;
  model?: string;
  temperature?: number;
  problemId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: {
    responseTime: number;
    model: string;
  };
}

export interface GetChatHistoryRequest {
  page?: number;
  limit?: number;
  problemId?: string;
  startDate?: Date;
  endDate?: Date;
  role?: 'user' | 'assistant' | 'system';
}

export interface GetChatHistoryResponse {
  sessions: ChatSession[];
  hasMore: boolean;
  total: number;
} 