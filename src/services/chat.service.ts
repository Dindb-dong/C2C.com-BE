import { v4 as uuidv4 } from 'uuid';
// import Redis from 'ioredis';
import { ChatMessage, ChatHistory, ChatRequest, GetChatHistoryRequest, GetChatHistoryResponse } from '../types/chat';
import openai from '../config/openai';

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const CACHE_EXPIRY = 60 * 60 * 24; // 24시간

export class ChatService {
  private static instance: ChatService;
  private constructor() { }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // 채팅 메시지 생성 및 저장
  async createChatMessage(userId: string, request: ChatRequest): Promise<ChatMessage> {
    try {
      if (!request.messages || request.messages.length === 0) {
        throw new Error('Messages cannot be empty');
      }

      const completion = await openai.chat.completions.create({
        model: request.model || 'gpt-4',
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: request.temperature || 0.7,
        max_tokens: 1000, // 응답 길이 제한
        presence_penalty: 0.6, // 반복 방지
        frequency_penalty: 0.3, // 단어 반복 방지
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('No response from OpenAI');
      }

      const message: ChatMessage = {
        id: uuidv4(),
        userId,
        content: completion.choices[0].message.content,
        role: 'assistant',
        createdAt: new Date(),
        problemId: request.problemId
      };

      // Redis에 메시지 저장
      // const cacheKey = this.getCacheKey(userId, request.problemId);
      // await redis.lpush(cacheKey, JSON.stringify(message));
      // await redis.expire(cacheKey, CACHE_EXPIRY);

      return message;
    } catch (error) {
      console.error('Error in createChatMessage:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat message');
    }
  }

  // 채팅 기록 조회
  async getChatHistory(userId: string, request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    try {
      const { page = 1, limit = 20, problemId } = request;

      // TODO: Implement database storage instead of Redis
      // For now, return empty response
      return {
        messages: [],
        hasMore: false,
        total: 0
      };
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get chat history');
    }
  }

  // 채팅 기록 삭제
  async deleteChatHistory(userId: string, problemId?: string): Promise<void> {
    try {
      // TODO: Implement database storage instead of Redis
    } catch (error) {
      console.error('Error in deleteChatHistory:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete chat history');
    }
  }

  private getCacheKey(userId: string, problemId?: string): string {
    return problemId ? `chat:${userId}:${problemId}` : `chat:${userId}`;
  }
} 