import cron from 'node-cron';
import { NewsService } from '../services/news.service';
import { BigKindsSessionCrawler } from '../crawlers/bigkindsSession';

export class NewsScheduler {
  private newsService: NewsService;
  private crawler: BigKindsSessionCrawler;
  private readonly categories = [
    { name: '정치', code: '001000000' },
    { name: '경제', code: '002000000' },
    { name: '사회', code: '003000000' },
    { name: '문화', code: '004000000' },
    { name: '국제', code: '005000000' },
    { name: '지역', code: '006000000' },
    { name: '스포츠', code: '007000000' },
    { name: 'IT과학', code: '008000000' },
  ];
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor() {
    this.crawler = new BigKindsSessionCrawler();
    this.newsService = new NewsService(this.crawler);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchNewsWithRetry(category: { name: string; code: string }, retryCount = 0): Promise<void> {
    try {
      console.log(`Fetching news for category: ${category.name}`);
      await this.newsService.fetchAndStoreNews({
        query: category.name,
        categoryCode: category.code,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 hours ago
        endDate: new Date().toISOString().split('T')[0] // today
      });
      console.log(`Successfully fetched news for category: ${category.name}`);
    } catch (error) {
      console.error(`Error fetching news for category ${category.name}:`, error);

      if (retryCount < this.maxRetries) {
        console.log(`Retrying (${retryCount + 1}/${this.maxRetries}) after ${this.retryDelay}ms...`);
        await this.sleep(this.retryDelay);
        await this.fetchNewsWithRetry(category, retryCount + 1);
      } else {
        console.error(`Failed to fetch news for category ${category.name} after ${this.maxRetries} retries`);
      }
    }
  }

  start() {
    console.log('Starting news scheduler...');

    // 매일 자정에 실행
    cron.schedule('0 12 * * *', async () => {
      console.log('Starting news fetch job...');
      try {
        for (const category of this.categories) {
          await this.fetchNewsWithRetry(category);
        }
        console.log('News fetch job completed successfully');
      } catch (error) {
        console.error('Error in news fetch job:', error);
      }
    });
  }
} 