import { v4 as uuidv4 } from 'uuid';
// import Redis from 'ioredis';
import { ChatMessage, ChatHistory, ChatRequest, GetChatHistoryRequest, GetChatHistoryResponse } from '../types/chat';
import prisma from '../prisma';

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

  // 채팅 메시지 저장
  async createChatMessage(userId: string, request: ChatRequest): Promise<ChatMessage> {
    try {
      if (!request.messages || request.messages.length === 0) {
        throw new Error('Messages cannot be empty');
      }

      // 세션 생성 또는 조회
      const session = await prisma.chatSession.upsert({
        where: {
          id: request.sessionId || uuidv4(),
        },
        create: {
          id: request.sessionId || uuidv4(),
          userId,
          problemId: request.problemId,
          title: request.title || 'New Chat',
          question: request.messages[0].content,
          answer: request.messages[1]?.content || '',
          metadata: {
            model: request.model,
            temperature: request.temperature
          }
        },
        update: {
          updatedAt: new Date(),
          title: request.title,
          question: request.messages[0].content,
          answer: request.messages[1]?.content || ''
        }
      });

      // 메시지 저장
      const message = await prisma.message.create({
        data: {
          sessionId: session.id,
          role: request.messages[0].role,
          content: request.messages[0].content,
          metadata: {
            tokens: request.messages[0].metadata?.tokens,
            model: request.model,
            temperature: request.temperature
          }
        }
      });

      return {
        id: message.id,
        userId,
        content: message.content,
        role: message.role as 'user' | 'assistant',
        createdAt: message.createdAt,
        problemId: session.problemId || undefined,
        metadata: message.metadata as any
      };
    } catch (error) {
      console.error('Error in createChatMessage:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat message');
    }
  }

  // 채팅 기록 조회
  async getChatHistory(userId: string, request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    try {
      const { page = 1, limit = 20, problemId } = request;
      const skip = (page - 1) * limit;

      // 세션 조회
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          ...(problemId && { problemId })
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      });

      const total = await prisma.chatSession.count({
        where: {
          userId,
          ...(problemId && { problemId })
        }
      });

      return {
        sessions: sessions.map(session => ({
          id: session.id,
          messages: session.messages.map(msg => ({
            id: msg.id,
            userId: session.userId,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            createdAt: msg.createdAt,
            metadata: msg.metadata as any
          }))
        })),
        hasMore: skip + sessions.length < total,
        total
      };
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get chat history');
    }
  }

  // 채팅 기록 삭제
  async deleteChatHistory(userId: string, problemId?: string): Promise<void> {
    try {
      await prisma.chatSession.deleteMany({
        where: {
          userId,
          ...(problemId && { problemId })
        }
      });
    } catch (error) {
      console.error('Error in deleteChatHistory:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete chat history');
    }
  }

  private getCacheKey(userId: string, problemId?: string): string {
    return problemId ? `chat:${userId}:${problemId}` : `chat:${userId}`;
  }
} 