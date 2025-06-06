import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';
import { Mentor, MentorCreateInput, MentorUpdateInput } from '../types/mentor.types';
import { UserService } from './user.service';

export class MentorService {
  private prisma: PrismaClient = prisma;
  private userService: UserService;

  constructor() {
    this.prisma = prisma;
    this.userService = new UserService();
  }

  // 멘토 생성
  async createMentor(data: MentorCreateInput): Promise<Mentor> {
    // 트랜잭션으로 멘토 생성과 사용자 역할 업데이트를 함께 처리
    return this.prisma.$transaction(async (tx: any) => {
      // 1. 사용자 역할을 'mentor'로 업데이트
      await this.userService.updateUserRole(data.user_id, 'mentor');

      // 2. 멘토 프로필 생성
      const mentorData = {
        ...data,
        recommend_mentor_id: data.user_id, // 본인을 추천 멘토로 설정
        star_rating: data.star_rating ?? 0,
        mentor_point: data.mentor_point ?? 0,
        is_verified: data.is_verified ?? false,
        hourly_rate: data.hourly_rate ?? 0
      };

      return tx.mentor.create({
        data: mentorData
      });
    });
  }

  // 멘토 ID로 조회
  async findMentorById(id: string): Promise<Mentor | null> {
    return this.prisma.mentor.findUnique({
      where: { id }
    });
  }

  // 유저 ID로 멘토 조회
  async findMentorByUserId(userId: string): Promise<Mentor | null> {
    return this.prisma.mentor.findUnique({
      where: { user_id: userId }
    });
  }

  // 멘토 정보 업데이트
  async updateMentor(id: string, data: MentorUpdateInput): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id },
      data
    });
  }

  // 추천인 코드 등록
  async registerRecommendation(mentorId: string, recommendedMentorId: string): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id: mentorId },
      data: {
        recommended_mentor_id: recommendedMentorId,
      },
    });
  }

  // 멘토 인증 상태 업데이트
  async updateVerificationStatus(id: string, isVerified: boolean): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id },
      data: {
        is_verified: isVerified,
      },
    });
  }

  // 멘토 포인트 업데이트
  async updateMentorPoint(id: string, points: number): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id },
      data: {
        mentor_point: points,
      },
    });
  }

  // 별점 업데이트
  async updateStarRating(id: string, rating: number): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id },
      data: {
        star_rating: rating,
      },
    });
  }

  // 전문 분야 업데이트
  async updateExpertise(id: string, expertise: string[]): Promise<Mentor> {
    return this.prisma.mentor.update({
      where: { id },
      data: {
        expertise,
      },
    });
  }

  // 모든 멘토 조회 (페이지네이션)
  async findAllMentors(page: number = 1, limit: number = 10): Promise<{ mentors: Mentor[]; total: number }> {
    const skip = (page - 1) * limit;
    const [mentors, total] = await Promise.all([
      this.prisma.mentor.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.mentor.count()
    ]);

    return { mentors, total };
  }

  // 전문 분야로 멘토 검색
  async findMentorsByExpertise(expertise: string): Promise<Mentor[]> {
    return this.prisma.mentor.findMany({
      where: {
        expertise: {
          has: expertise
        }
      }
    });
  }

  // 인증된 멘토만 조회
  async findVerifiedMentors(): Promise<Mentor[]> {
    return this.prisma.mentor.findMany({
      where: {
        is_verified: true,
      },
    });
  }
} 