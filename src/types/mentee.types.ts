export interface Mentee {
  id: string;
  recommend_mentee_id: string; // 추천 멘티 아이디 (본인)
  recommended_mentee_id: string; // 추천 멘티 아이디 (입력했으면 입력한 멘티 아이디)
  user_id: string; // 유저 아이디 (닉네임. 예: 수학요정)
  name: string; // 이름
  title: string; // 한 줄 소개 (학력, 전공 등)
  interested: string[]; // 관심 분야
  goal: string; // 목표
  created_at: Date;
  updated_at: Date;
}

export interface MenteeCreateInput {
  recommended_mentee_id?: string; // 추천 멘티 아이디 (입력했으면 입력한 멘티 아이디)
  user_id: string;
  name: string;
  title: string;
  interested: string[];
  goal: string;
}

export interface MenteeUpdateInput {
  name?: string;
  title?: string;
  interested?: string[];
  goal?: string;
}

export interface MentoringRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  mentoring_fee: number; // 멘토링 요금
  message: string;
  created_at: Date;
  updated_at: Date;
}

export interface MentoringRequestCreateInput {
  mentor_id: string;
  mentee_id: string;
  mentoring_fee: number;
  message: string;
} 