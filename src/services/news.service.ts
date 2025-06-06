import { PrismaClient, NewsArticle } from '@prisma/client';
import { BigKindsSessionCrawler } from '../crawlers/bigkindsSession';
import type { TopicSummary } from '@prisma/client';
import prisma from '../prisma';

type TopicSummaryInput = Omit<TopicSummary, 'id'>;

export class NewsService {
  private prisma: PrismaClient = prisma;
  private crawler: BigKindsSessionCrawler;

  constructor(crawler: BigKindsSessionCrawler) {
    this.prisma = prisma;
    this.crawler = crawler;
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

  async getTopTopics(categoryCode: string, noSearch: boolean) {
    try {
      console.log('categoryCode', categoryCode);
      let category: string;
      switch (categoryCode) {
        case '001000000':
          category = '정치';
          break;
        case '002000000':
          category = '경제';
          break;
        case '003000000':
          category = '사회';
          break;
        case '004000000':
          category = '문화';
          break;
        case '005000000':
          category = '국제';
          break;
        case '006000000':
          category = '지역';
          break;
        case '007000000':
          category = '스포츠';
          break;
        case '008000000':
          category = 'IT과학';
          break;
        default:
          throw new Error('Invalid category code');
      }

      const { topicSummary, articles } = await this.crawler.getTopTopics(category, categoryCode, noSearch);

      // 뉴스 저장x
      if (articles.length > 0 && !noSearch) {
        await this.storeNewsFromCrawler(articles);
        await this.storeTopicSummary(topicSummary);
      }

      return { topicSummary, articles };
    } catch (error) {
      console.error('Error fetching top topics:', error);
      throw error;
    }
  }

  private async storeArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const storedArticles = await Promise.all(
      articles.map(async (article) => {
        try {
          return await this.prisma.newsArticle.upsert({
            where: { url: article.url },
            update: {
              title: article.title,
              content: article.content,
              source: article.source,
              publishedAt: article.publishedAt,
              categoryCode: article.categoryCode,
              summary: article.summary,
              updatedAt: new Date(),
              topic: article.topic
            },
            create: {
              title: article.title,
              content: article.content,
              url: article.url,
              source: article.source,
              publishedAt: article.publishedAt,
              categoryCode: article.categoryCode,
              summary: article.summary,
              topic: article.topic
            }
          });
        } catch (error) {
          console.error('Error storing article:', error);
          return null;
        }
      })
    );

    return storedArticles.filter((article: NewsArticle | null): article is NewsArticle => article !== null);
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
          categoryCode: categoryCode,
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

  async storeTopicSummary(topicSummaries: TopicSummaryInput[]): Promise<TopicSummary[]> {
    const results: TopicSummary[] = [];
    for (const summary of topicSummaries) {
      const upserted = await this.prisma.topicSummary.upsert({
        where: { title: summary.title }, // or use another unique field
        update: {
          content: summary.content,
          categoryCode: summary.categoryCode,
          updatedAt: new Date(),
          createdAt: new Date()
        },
        create: {
          title: summary.title,
          content: summary.content,
          categoryCode: summary.categoryCode,
          updatedAt: new Date(),
          createdAt: new Date()
        }
      });
      results.push(upserted);
    }
    return results;
  }

  async storeNewsFromCrawler(articles: NewsArticle[]): Promise<NewsArticle[]> {
    return this.storeArticles(articles);
  }
}