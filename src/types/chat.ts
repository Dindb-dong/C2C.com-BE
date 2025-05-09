export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  problemId?: string; // 문제은행의 특정 문제와 연관된 경우
}

export interface ChatHistory {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  messages: Omit<ChatMessage, 'id' | 'userId' | 'createdAt'>[];
  model?: string;
  temperature?: number;
  problemId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GetChatHistoryRequest {
  page?: number;
  limit?: number;
  problemId?: string;
}

export interface GetChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  total: number;
} 