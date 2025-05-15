import { Router, Response } from 'express';
import { MentorService } from '../services/mentor.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { MentorCreateInput, MentorUpdateInput } from '../types/mentor.types';

const router = Router();
const mentorService = new MentorService();

// 멘토 프로필 조회
router.get('/profile/:id', async (req: AuthRequest, res: Response) => {
  try {
    const mentor = await mentorService.findMentorById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ error: 'Failed to get mentor information' });
  }
});

// 멘토 프로필 생성 (인증된 사용자만)
router.post('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const mentorData: MentorCreateInput = {
      ...req.body,
      user_id: req.user?.id || '',
      recommend_mentor_id: req.user?.id || '' // 본인을 추천 멘토로 설정
    };

    const mentor = await mentorService.createMentor(mentorData);
    res.status(201).json(mentor);
  } catch (error) {
    console.error('Create mentor error:', error);
    res.status(500).json({ error: 'Failed to create mentor profile' });
  }
});

// 멘토 프로필 수정 (인증된 사용자만)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const mentor = await mentorService.findMentorByUserId(req.user?.id || '');
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const updateData: MentorUpdateInput = req.body;
    const updatedMentor = await mentorService.updateMentor(mentor.id, updateData);
    res.json(updatedMentor);
  } catch (error) {
    console.error('Update mentor error:', error);
    res.status(500).json({ error: 'Failed to update mentor profile' });
  }
});

// 멘토 목록 조회 (페이지네이션)
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await mentorService.findAllMentors(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Get mentors list error:', error);
    res.status(500).json({ error: 'Failed to get mentors list' });
  }
});

// 멘토 검색 (전문 분야로 검색)
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const expertise = req.query.expertise as string;
    if (!expertise) {
      return res.status(400).json({ error: 'Expertise parameter is required' });
    }
    const mentors = await mentorService.findMentorsByExpertise(expertise);
    res.json(mentors);
  } catch (error) {
    console.error('Search mentors error:', error);
    res.status(500).json({ error: 'Failed to search mentors' });
  }
});

export default router; 