import express from 'express';
import { NewsService } from '../services/news.service';
import { BigKindsSessionCrawler } from '../crawlers/bigkindsSession';

const router = express.Router();
const crawler = new BigKindsSessionCrawler();
const newsService = new NewsService(crawler);

// 최신 뉴스 조회
router.get('/latest', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // 입력값 검증
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit value. Must be between 1 and 100.' });
    }

    const news = await newsService.getLatestNews(limit);
    res.json(news);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(500).json({ error: 'Failed to fetch latest news' });
  }
});

// 카테고리별 뉴스 조회
router.get('/category/:categoryCode', async (req, res) => {
  try {
    const { categoryCode } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // 입력값 검증
    if (!categoryCode || !/^\d{9}$/.test(categoryCode)) {
      return res.status(400).json({ error: 'Invalid category code. Must be 8 digits.' });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit value. Must be between 1 and 100.' });
    }
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ error: 'Invalid startDate format. Must be YYYY-MM-DD.' });
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({ error: 'Invalid endDate format. Must be YYYY-MM-DD.' });
    }

    const news = await newsService.getNewsByCategory(categoryCode, limit, startDate, endDate);
    res.json(news);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ error: 'Failed to fetch news by category' });
  }
});

// 카테고리별 핫 토픽 조회
router.get('/topics/:categoryCode', async (req, res) => {
  try {
    const { categoryCode } = req.params;
    const noSearch = req.query.noSearch === 'true';

    // 입력값 검증
    if (!categoryCode || !/^\d{9}$/.test(categoryCode)) {
      return res.status(400).json({ error: 'Invalid category code. Must be 8 digits.' });
    }

    const topicSummary = await newsService.getTopTopics(categoryCode, noSearch);
    res.json(topicSummary);
  } catch (error) {
    console.error('Error fetching top topics:', error);
    res.status(500).json({ error: 'Failed to fetch top topics' });
  }
});

// 수동으로 뉴스 가져오기
router.post('/fetch', async (req, res) => {
  try {
    const { query, categoryCode, startDate, endDate, topic } = req.body;

    // 입력값 검증
    if (!query && !topic) {
      return res.status(400).json({ error: 'Either query or topic is required.' });
    }
    if (query && typeof query !== 'string' || query?.trim().length === 0) {
      return res.status(400).json({ error: 'Query must be a non-empty string.' });
    }
    if (categoryCode && !/^\d{9}$/.test(categoryCode)) {
      return res.status(400).json({ error: 'Invalid category code. Must be 8 digits.' });
    }
    if (topic && typeof topic !== 'object') {
      return res.status(400).json({ error: 'Topic must be an object with required fields.' });
    }
    if (topic && (!topic.topic || !topic.topic_origin || !topic.news_cluster)) {
      return res.status(400).json({ error: 'Topic object must include topic, topic_origin, and news_cluster fields.' });
    }

    const news = await newsService.fetchAndStoreNews({
      query,
      categoryCode,
      startDate,
      endDate,
      topic
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router; 