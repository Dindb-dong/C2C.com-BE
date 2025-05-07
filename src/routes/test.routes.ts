import express from 'express';
import supabase from '../config/supabase';

const router = express.Router();

// 모든 멘토 조회
router.get('/mentors', async (req, res) => {
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
router.get('/mentees', async (req, res) => {
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
router.get('/mentoring-requests', async (req, res) => {
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

export default router; 