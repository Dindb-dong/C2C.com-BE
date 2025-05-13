export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: ChatRole;
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

export interface ChatRequest {
  messages: Omit<ChatMessage, 'id' | 'userId' | 'createdAt' | 'metadata'>[];
  model?: string;
  temperature?: number;
  problemId?: string;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
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
  role?: ChatRole;
}

export interface GetChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  total: number;
  metadata?: {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
} 