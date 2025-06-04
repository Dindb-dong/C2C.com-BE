import { PrismaClient, NewsArticle } from '@prisma/client';
import { BigKindsSessionCrawler } from '../crawlers/bigkindsSession';

export class NewsService {
  private prisma: PrismaClient;
  private crawler: BigKindsSessionCrawler;

  constructor() {
    this.prisma = new PrismaClient();
    this.crawler = new BigKindsSessionCrawler();
  }

  private async hasFetchedToday(categoryCode: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestArticle = await this.prisma.newsArticle.findFirst({
      where: {
        categoryCode,
        createdAt: {
          gte: today
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return !!latestArticle;
  }

  async getTopTopics(categoryCode: string) {
    try {
      console.log('categoryCode', categoryCode);
      switch (categoryCode) {
        case '10000000':
          return await this.crawler.getTopTopics('정치');
        case '20000000':
          return await this.crawler.getTopTopics('경제');
        case '30000000':
          return await this.crawler.getTopTopics('사회');
        case '40000000':
          return await this.crawler.getTopTopics('문화');
        case '50000000':
          return await this.crawler.getTopTopics('국제');
        case '60000000':
          return await this.crawler.getTopTopics('지역');
        case '70000000':
          return await this.crawler.getTopTopics('스포츠');
        case '80000000':
          return await this.crawler.getTopTopics('IT과학');
      }
    } catch (error) {
      console.error('Error fetching top topics:', error);
      throw error;
    }
  }

  private async storeArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const storedArticles = await Promise.all(
      articles.map(async (article) => {
        try {
          const existingArticle = await this.prisma.newsArticle.findUnique({
            where: { url: article.url }
          });

          if (existingArticle) {
            return this.prisma.newsArticle.update({
              where: { url: article.url },
              data: {
                title: article.title,
                content: article.content,
                source: article.source,
                publishedAt: article.publishedAt,
                categoryCode: article.categoryCode,
                summary: article.summary,
                updatedAt: new Date()
              }
            });
          }

          return this.prisma.newsArticle.create({
            data: {
              title: article.title,
              content: article.content,
              url: article.url,
              source: article.source,
              publishedAt: article.publishedAt,
              categoryCode: article.categoryCode,
              summary: article.summary
            }
          });
        } catch (error) {
          console.error('Error storing article:', error);
          return null;
        }
      })
    );

    return storedArticles.filter((article): article is NewsArticle => article !== null);
  }

  async fetchAndStoreNews(params: {
    query?: string;
    categoryCode?: string;
    startDate?: string;
    endDate?: string;
    topic?: {
      topic: string;
      topic_origin: string;
      topic_content: string;
      topic_keyword: string;
      news_cluster: string;
      SEARCH_QUERY: string;
      issue_category: string;
    };
  }): Promise<NewsArticle[]> {
    try {
      return await this.crawler.searchNews(params);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async getLatestNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      return await this.prisma.newsArticle.findMany({
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw error;
    }
  }

  async getNewsByCategory(
    categoryCode: string,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<NewsArticle[]> {
    try {
      // Check if we need to fetch new articles for this category
      const shouldFetch = await this.hasFetchedToday(categoryCode);

      if (!shouldFetch) {
        // Fetch and store new articles
        const articles = await this.crawler.searchNews({
          categoryCode,
          startDate: new Date().toISOString().split('T')[0], // Today
          endDate: new Date().toISOString().split('T')[0]   // Today
        });

        await this.storeArticles(articles);
      }

      // Return articles from database
      const where: any = {
        categoryCode: categoryCode
      };

      if (startDate || endDate) {
        where.publishedAt = {};
        if (startDate) {
          where.publishedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.publishedAt.lte = new Date(endDate);
        }
      }

      return await this.prisma.newsArticle.findMany({
        where,
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error(`Error fetching news for category ${categoryCode}:`, error);
      throw error;
    }
  }
}