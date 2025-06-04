import axios from 'axios';
import { NewsArticle } from '@prisma/client';

export class BigKindsCrawler {
  private readonly baseUrl = 'https://www.bigkinds.or.kr';
  private readonly searchUrl = `${this.baseUrl}/api/news/search.do`;
  private readonly headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Origin': 'https://www.bigkinds.or.kr',
    'Referer': 'https://www.bigkinds.or.kr/'
  };

  async searchNews(params: {
    query: string;
    categoryCode?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<NewsArticle[]> {
    try {
      const formData = new URLSearchParams();
      formData.append('indexName', 'news');
      formData.append('searchFields', 'news_title,news_body');
      formData.append('searchMethod', 'exact');
      formData.append('query', params.query);
      formData.append('byLine', '');
      formData.append('searchScope', '1');
      formData.append('searchFtr', '1');
      formData.append('startDate', params.startDate || '2024-01-01');
      formData.append('endDate', params.endDate || '2024-03-20');
      formData.append('sortMethod', 'date');
      formData.append('sortOrder', 'desc');
      formData.append('startNo', '1');
      formData.append('resultNumber', '10');
      formData.append('isTmUsable', 'false');
      formData.append('isNotTmUsable', 'false');

      if (params.categoryCode) {
        formData.append('categoryCode', params.categoryCode);
      }

      console.log('Request URL:', this.searchUrl);
      console.log('Request Headers:', this.headers);
      console.log('Request Form Data:', formData.toString());

      const response = await axios.post(this.searchUrl, formData, {
        headers: this.headers,
        withCredentials: true
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);

      if (!response.data || !response.data.resultList) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      return response.data.resultList.map((article: any) => ({
        id: article.id || article.newsId,
        title: article.title || article.newsTitle,
        content: article.content || article.newsBody,
        url: article.url || article.newsUrl,
        source: article.source || article.providerName,
        publishedAt: new Date(article.publishedAt || article.publishDate),
        category: params.categoryCode || '10000000',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
    }
  }
} 