import { Router, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { ChatRequest, GetChatHistoryRequest } from '../types/chat';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const chatService = ChatService.getInstance();

// 채팅 메시지 전송
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const request: ChatRequest = req.body;

    // 입력 유효성 검사
    if (!request.messages || request.messages.length === 0) {
      return res.status(400).json({ error: 'Messages cannot be empty' });
    }

    // 온도값 범위 검사
    if (request.temperature && (request.temperature < 0 || request.temperature > 2)) {
      return res.status(400).json({ error: 'Temperature must be between 0 and 2' });
    }

    const message = await chatService.createChatMessage(userId, request);
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    const statusCode = error instanceof Error && error.message.includes('OpenAI') ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 채팅 기록 조회
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // 페이지네이션 파라미터 검증
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    if (page && (page < 1 || !Number.isInteger(page))) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    if (limit && (limit < 1 || limit > 100 || !Number.isInteger(limit))) {
      return res.status(400).json({ error: 'Invalid limit value (1-100)' });
    }

    const request: GetChatHistoryRequest = {
      page: page || 1,
      limit: limit || 20,
      problemId: req.query.problemId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      role: req.query.role as 'user' | 'assistant' | 'system'
    };

    const history = await chatService.getChatHistory(userId, request);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 채팅 기록 삭제
router.delete('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const problemId = req.query.problemId as string;
    await chatService.deleteChatHistory(userId, problemId);

    res.status(200).json({
      success: true,
      message: 'Chat history deleted successfully'
    });
  } catch (error) {
    console.error('Delete Chat History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 