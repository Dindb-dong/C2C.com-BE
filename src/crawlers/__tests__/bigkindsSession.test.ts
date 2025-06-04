import { BigKindsSessionCrawler } from '../bigkindsSession';

describe('BigKindsSessionCrawler', () => {
  let crawler: BigKindsSessionCrawler;

  beforeEach(() => {
    crawler = new BigKindsSessionCrawler();
  });

  it('should successfully login with valid credentials', async () => {
    try {
      // @ts-ignore - accessing private method for testing
      await crawler.login();

      // 간단한 검색 테스트로 로그인 상태 확인
      const results = await crawler.searchNews({
        query: '지역',
        startDate: '2024-03-01',
        endDate: '2024-03-20'
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      console.log('Login test successful, found articles:', results.length);
    } catch (error) {
      console.error('Login test failed:', error);
      throw error;
    }
  }, 30000); // 30초 타임아웃 설정
}); 