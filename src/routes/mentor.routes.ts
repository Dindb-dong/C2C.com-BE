import { Router, Response } from 'express';
import { MentorService } from '../services/mentor.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { MentorCreateInput, MentorUpdateInput } from '../types/mentor.types';

const router = Router();
const mentorService = new MentorService();

// 멘토 프로필 조회
router.get('/profile/:id', async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[멘토 프로필 조회] id: ${req.params.id}`);
    const mentor = await mentorService.findMentorById(req.params.id);
    if (!mentor) {
      console.warn(`[멘토 프로필 조회] Not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Mentor not found' });
    }
    console.log(`[멘토 프로필 조회] Success:`, mentor);
    res.json(mentor);
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ error: 'Failed to get mentor information' });
  }
});

// 내 멘토 프로필 조회 (로그인 필요)
router.get('/my-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const mentor = await mentorService.findMentorByUserId(userId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }
    res.json(mentor);
  } catch (error) {
    console.error('Get my mentor profile error:', error);
    res.status(500).json({ error: 'Failed to get mentor profile' });
  }
});

// 멘토 프로필 생성 (인증된 사용자만)
router.post('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[멘토 프로필 생성] user: ${req.user?.id}, body:`, req.body);
    const mentorData: MentorCreateInput = {
      ...req.body,
      user_id: req.user?.id || '',
      recommend_mentor_id: req.user?.id || '' // 본인을 추천 멘토로 설정
    };

    const mentor = await mentorService.createMentor(mentorData);
    console.log(`[멘토 프로필 생성] Success:`, mentor);
    res.status(201).json(mentor);
  } catch (error) {
    console.error('Create mentor error:', error, 'body:', req.body);
    res.status(500).json({ error: 'Failed to create mentor profile' });
  }
});

// 멘토 프로필 수정 (인증된 사용자만)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[멘토 프로필 수정] user: ${req.user?.id}, body:`, req.body);
    const mentor = await mentorService.findMentorByUserId(req.user?.id || '');
    if (!mentor) {
      console.warn(`[멘토 프로필 수정] Mentor not found for user: ${req.user?.id}`);
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const updateData: MentorUpdateInput = req.body;
    const updatedMentor = await mentorService.updateMentor(mentor.id, updateData);
    console.log(`[멘토 프로필 수정] Success:`, updatedMentor);
    res.json(updatedMentor);
  } catch (error) {
    console.error('Update mentor error:', error, 'body:', req.body);
    res.status(500).json({ error: 'Failed to update mentor profile' });
  }
});

// 멘토 목록 조회 (페이지네이션)
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[멘토 목록 조회] page: ${req.query.page}, limit: ${req.query.limit}`);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await mentorService.findAllMentors(page, limit);
    console.log(`[멘토 목록 조회] Success, count: ${result.mentors.length}`);
    res.json(result);
  } catch (error) {
    console.error('Get mentors list error:', error);
    res.status(500).json({ error: 'Failed to get mentors list' });
  }
});

// 멘토 검색 (전문 분야로 검색)
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[멘토 검색] expertise: ${req.query.expertise}`);
    const expertise = req.query.expertise as string;
    if (!expertise) {
      console.warn(`[멘토 검색] Expertise parameter is required`);
      return res.status(400).json({ error: 'Expertise parameter is required' });
    }
    const mentors = await mentorService.findMentorsByExpertise(expertise);
    console.log(`[멘토 검색] Success, count: ${mentors.length}`);
    res.json(mentors);
  } catch (error) {
    console.error('Search mentors error:', error);
    res.status(500).json({ error: 'Failed to search mentors' });
  }
});

export default router; 