export interface Mentor {
  id: string;
  recommend_mentor_id: string; // 추천 멘토 아이디 (본인)
  recommended_mentor_id: string | null; // null 허용으로 변경
  user_id: string; // 유저 아이디 (닉네임. 예: 수학요정)
  name: string; // 이름
  title: string; // 한 줄 소개 (학력, 전공 등)
  description: string; // 멘토 소개
  expertise: string[]; // 멘토 전문 분야
  star_rating: number; // 별점
  mentor_point: number; // 멘토 포인트 (아이디어톤)
  is_verified: boolean; // 멘토 인증 여부 (학위 증명서 등)
  created_at: Date;
  updated_at: Date;
}

export interface MentorCreateInput {
  user_id: string;
  name: string;
  title: string;
  description: string;
  career: string;
  skills: string[];
  hourly_rate: number;
  expertise: string[];
  recommend_mentor_id?: string;//추천 멘토 아이디 (입력했으면 입력한 멘토 아이디)
  recommended_mentor_id?: string | null;
  star_rating?: number;
  mentor_point?: number;
  is_verified?: boolean;
}

export interface MentorUpdateInput {
  name?: string;
  title?: string;
  description?: string;
  career?: string;
  skills?: string[];
  hourly_rate?: number;
  expertise?: string[];
  recommended_mentor_id?: string | null;
  star_rating?: number;
  mentor_point?: number;
  is_verified?: boolean;
}

export interface MentoringRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: Date;
  updated_at: Date;
}

export interface MentoringRequestCreateInput {
  mentor_id: string;
  mentee_id: string;
  mentoring_fee: number; // 멘토링 요금
  message: string;
} 