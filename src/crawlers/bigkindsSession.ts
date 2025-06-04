import { chromium, Browser, Page } from 'playwright';
import axios, { AxiosInstance } from 'axios';
import { NewsArticle } from '@prisma/client';

interface Topic {
  topic: string;
  topic_origin: string;
  topic_content: string;
  topic_keyword: string;
  news_cluster: string;
  SEARCH_QUERY: string;
  issue_category: string;
}

interface SearchPayload {
  byLine: string;
  categoryCodes: string[];
  dateCodes: string[];
  editorialIs: boolean;
  endDate: string;
  incidentCodes: string[];
  indexName: string;
  isNotTmUsable: boolean;
  isTmUsable: boolean;
  mainTodayPersonYn: string;
  networkNodeType: string;
  newsIds?: string[];
  providerCodes: string[];
  resultNumber: number;
  searchFilterType: string;
  searchKey: string;
  searchKeys: Array<Record<string, any>>;
  searchScopeType: string;
  searchSortType: string;
  sortMethod: string;
  startDate: string;
  startNo: number;
  topicOrigin: string;
}

export class BigKindsSessionCrawler {
  private readonly baseUrl = 'https://www.bigkinds.or.kr';
  private readonly loginUrl = `${this.baseUrl}/api/account/signin2023.do`;
  private readonly searchUrl = `${this.baseUrl}/api/news/search.do`;
  private readonly issueListUrl = `${this.baseUrl}/v2/home/issue/category/list.do`;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private axiosInstance: AxiosInstance;
  private cookies: string[] = [];
  private lastLoginTime: number = 0;
  private readonly COOKIE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Origin': this.baseUrl,
        'Referer': this.baseUrl
      },
      withCredentials: true
    });

    // Add response interceptor to handle cookies
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          this.cookies = Array.isArray(cookies) ? cookies : [cookies];
          this.axiosInstance.defaults.headers.Cookie = this.cookies.join('; ');
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private async initialize() {
    if (!this.browser) {
      try {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        });
        this.page = await this.browser.newPage();
      } catch (error) {
        console.error('Failed to launch browser:', error);
        // Fallback to default chromium installation
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
      }
    }
  }

  private async login() {
    const now = Date.now();
    // 쿠키가 있고 만료되지 않았다면 재로그인하지 않음
    if (this.cookies.length > 0 && (now - this.lastLoginTime) < this.COOKIE_EXPIRY) {
      console.log('Using existing cookies');
      return;
    }

    try {
      const loginPayload = {
        userId: process.env.BIGKINDS_ID || '',
        userPassword: process.env.BIGKINDS_PW || ''
      };

      const response = await this.axiosInstance.post(this.loginUrl, loginPayload);

      if (response.status === 200) {
        this.lastLoginTime = now;
        console.log('Login successful, cookies obtained');
      } else {
        throw new Error(`Login failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.cookies = []; // 로그인 실패 시 쿠키 초기화
      this.lastLoginTime = 0;
      throw error;
    }
  }

  async getTopTopics(category: string): Promise<Topic[]> {
    try {
      await this.initialize();
      await this.login();

      const formData = new URLSearchParams();
      formData.append('category', category);

      const response = await this.axiosInstance.post(this.issueListUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      return response.data.map((item: any) => ({
        topic: item.todayIssue.topic,
        topic_origin: item.todayIssue.topic_origin,
        topic_content: item.todayIssue.topic_content,
        topic_keyword: item.todayIssue.topic_keyword,
        news_cluster: item.todayIssue.news_cluster,
        SEARCH_QUERY: item.todayIssue.SEARCH_QUERY,
        issue_category: item.todayIssue.issue_category
      }));
    } catch (error) {
      console.error('Error fetching top topics:', error);
      return [];
    }
  }

  async searchNews(params: {
    query?: string;
    categoryCode?: string;
    startDate?: string;
    endDate?: string;
    topic?: Topic;
  }): Promise<NewsArticle[]> {
    try {
      await this.initialize();
      await this.login();

      // Set default date range to one month ago from current date
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      const searchPayload: SearchPayload = {
        byLine: '',
        categoryCodes: [],
        dateCodes: [],
        editorialIs: false,
        endDate: params.endDate || today.toISOString().split('T')[0],
        incidentCodes: [],
        indexName: 'news',
        isNotTmUsable: false,
        isTmUsable: false,
        mainTodayPersonYn: '',
        networkNodeType: '',
        newsIds: [],
        providerCodes: [],
        resultNumber: 10,
        searchFilterType: '1',
        searchKey: params.topic?.topic || params.query || '',
        searchKeys: [{}],
        searchScopeType: '1',
        searchSortType: 'date',
        sortMethod: 'date',
        startDate: params.startDate || oneMonthAgo.toISOString().split('T')[0],
        startNo: 1,
        topicOrigin: params.topic?.topic_origin || ''
      };

      if (params.topic?.news_cluster) {
        searchPayload.newsIds = params.topic.news_cluster.split(',');
      }

      if (params.categoryCode) {
        searchPayload.categoryCodes = [];
      }

      console.log('Request URL:', this.searchUrl);
      console.log('Request Headers:', this.axiosInstance.defaults.headers);
      console.log('Request Payload:', searchPayload);

      const response = await this.axiosInstance.post(this.searchUrl, searchPayload);

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);

      if (!response.data || !response.data.resultList) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      return response.data.resultList.map((article: any) => ({
        id: article.NEWS_ID,
        title: article.TITLE,
        content: article.CONTENT,
        url: article.PROVIDER_LINK_PAGE,
        source: article.PROVIDER,
        publishedAt: new Date(article.DATE.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
        categoryCode: params.categoryCode || '',
        summary: article.CONTENT.substring(0, 200),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // 인증 오류 발생 시 쿠키 초기화 후 재로그인
          this.cookies = [];
          this.lastLoginTime = 0;
          await this.login();
          // 재로그인 후 다시 API 호출
          return this.searchNews(params);
        }
        console.error('Axios error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      } else {
        console.error('Error fetching news:', error);
      }
      return [];
    } finally {
      // 브라우저 종료
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    }
  }
} 