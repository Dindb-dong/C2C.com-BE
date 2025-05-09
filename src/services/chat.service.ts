import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { ChatMessage, ChatHistory, ChatRequest, GetChatHistoryRequest, GetChatHistoryResponse } from '../types/chat';
import openai from '../config/openai';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
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
    const completion = await openai.chat.completions.create({
      model: request.model || 'gpt-4o',
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: request.temperature || 0.7,
    });

    const message: ChatMessage = {
      id: uuidv4(),
      userId,
      content: completion.choices[0].message.content || '',
      role: 'assistant',
      createdAt: new Date(),
      problemId: request.problemId
    };

    // Redis에 메시지 저장
    const cacheKey = this.getCacheKey(userId, request.problemId);
    await redis.lpush(cacheKey, JSON.stringify(message));
    await redis.expire(cacheKey, CACHE_EXPIRY);

    return message;
  }

  // 채팅 기록 조회
  async getChatHistory(userId: string, request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    const { page = 1, limit = 20, problemId } = request;
    const cacheKey = this.getCacheKey(userId, problemId);

    // Redis에서 메시지 조회
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const messages = await redis.lrange(cacheKey, start, end);
    const total = await redis.llen(cacheKey);

    return {
      messages: messages.map(msg => JSON.parse(msg)),
      hasMore: total > end + 1,
      total
    };
  }

  // 채팅 기록 삭제
  async deleteChatHistory(userId: string, problemId?: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId, problemId);
    await redis.del(cacheKey);
  }

  private getCacheKey(userId: string, problemId?: string): string {
    return problemId ? `chat:${userId}:${problemId}` : `chat:${userId}`;
  }
} 