import { Router } from 'express';
import { ChatService } from '../services/chat.service';
import { ChatRequest, GetChatHistoryRequest } from '../types/chat';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const chatService = ChatService.getInstance();

// 채팅 메시지 전송
router.post('/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const request: ChatRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const message = await chatService.createChatMessage(userId, request);
    res.json(message);
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 채팅 기록 조회
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const request: GetChatHistoryRequest = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      problemId: req.query.problemId as string,
    };

    const history = await chatService.getChatHistory(userId, request);
    res.json(history);
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 채팅 기록 삭제
router.delete('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const problemId = req.query.problemId as string;
    await chatService.deleteChatHistory(userId, problemId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete Chat History Error:', error);
    res.status(500).json({
      error: 'Failed to delete chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 