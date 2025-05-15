import express, { Router, Request, Response } from 'express';
import supabase from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// 모든 멘토 조회
router.get('/mentors', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// 모든 멘티 조회
router.get('/mentees', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('mentees')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentees' });
  }
});

// 멘토링 요청 조회
router.get('/mentoring-requests', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('mentoring_requests')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentoring requests' });
  }
});

router.get('/protected', async (req: AuthRequest, res: Response) => {
  // ... existing code ...
});

export default router; 