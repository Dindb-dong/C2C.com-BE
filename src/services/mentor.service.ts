import { PrismaClient } from '@prisma/client';
import { Mentor, MentorCreateInput, MentorUpdateInput } from '../types/mentor.types';

const prisma = new PrismaClient();

export class MentorService {
  // 멘토 생성
  async createMentor(input: MentorCreateInput): Promise<Mentor> {
    return prisma.mentor.create({
      data: {
        ...input,
        star_rating: input.star_rating || 0,
        mentor_point: input.mentor_point || 0,
        is_verified: input.is_verified || false,
        recommend_mentor_id: input.recommended_mentor_id || input.user_id, // 추천인이 없으면 본인 ID를 사용
      },
    });
  }

  // 멘토 ID로 조회
  async findById(id: string): Promise<Mentor | null> {
    return prisma.mentor.findUnique({
      where: { id },
    });
  }

  // 유저 ID로 멘토 조회
  async findByUserId(userId: string): Promise<Mentor | null> {
    return prisma.mentor.findUnique({
      where: { user_id: userId },
    });
  }

  // 멘토 정보 업데이트
  async updateMentor(id: string, input: MentorUpdateInput): Promise<Mentor> {
    return prisma.mentor.update({
      where: { id },
      data: input,
    });
  }

  // 추천인 코드 등록
  async registerRecommendation(mentorId: string, recommendedMentorId: string): Promise<Mentor> {
    return prisma.mentor.update({
      where: { id: mentorId },
      data: {
        recommended_mentor_id: recommendedMentorId,
      },
    });
  }

  // 멘토 인증 상태 업데이트
  async updateVerificationStatus(id: string, isVerified: boolean): Promise<Mentor> {
    return prisma.mentor.update({
      where: { id },
      data: {
        is_verified: isVerified,
      },
    });
  }

  // 멘토 포인트 업데이트
  async updateMentorPoint(id: string, points: number): Promise<Mentor> {
    return prisma.mentor.update({
      where: { id },
      data: {
        mentor_point: points,
      },
    });
  }

  // 별점 업데이트
  async updateStarRating(id: string, rating: number): Promise<Mentor> {
    return prisma.mentor.update({
      where: { id },
      data: {
        star_rating: rating,
      },
    });
  }

  // 전문 분야 업데이트
  async updateExpertise(id: string, expertise: string[]): Promise<Mentor> {
    return prisma.mentor.update({
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
      prisma.mentor.findMany({
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.mentor.count(),
    ]);

    return { mentors, total };
  }

  // 전문 분야로 멘토 검색
  async searchByExpertise(expertise: string): Promise<Mentor[]> {
    return prisma.mentor.findMany({
      where: {
        expertise: {
          has: expertise,
        },
      },
    });
  }

  // 인증된 멘토만 조회
  async findVerifiedMentors(): Promise<Mentor[]> {
    return prisma.mentor.findMany({
      where: {
        is_verified: true,
      },
    });
  }
} 