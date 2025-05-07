# C2C.com Backend

C2C.com 웹사이트의 백엔드 서버 레포지토리입니다. 금융 커뮤니티 플랫폼으로서 사용자들 간의 소통, 멘토링, 뉴스 공유를 지원합니다.

## 주요 기능

- 🤖 AI 챗봇 (ChatGPT API 연동)
- 📝 커뮤니티 게시판
- 📰 자동 뉴스 크롤링 & AI 요약
- 👥 멘토링 매칭 시스템
- 💬 실시간 메시징

## 기술 스택

### 백엔드

- Node.js
- Express.js
- TypeScript
- PostgreSQL (Supabase)
- Socket.io (실시간 통신)

### AI/외부 서비스

- OpenAI API (챗봇/뉴스 요약)
- Supabase (인증/스토리지/DB)

### 배포/인프라

- Render (백엔드 호스팅)
- Neon (PostgreSQL 호스팅)
- UptimeRobot (서버 모니터링)
- Sentry (에러 트래킹)

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- PostgreSQL
- npm 또는 yarn
- OpenAI API 키
- Supabase 계정

### 설치

1. 레포지토리 클론

```bash
git clone https://github.com/your-username/C2C.com-BE.git
cd C2C.com-BE
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
   `.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 변수들을 설정합니다:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=your_postgres_connection_string

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET=your_jwt_secret
```

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

## 배포

이 프로젝트는 Render에서 호스팅됩니다. 자동 배포가 설정되어 있어 main 브랜치에 푸시하면 자동으로 배포됩니다.

## API 문서

API 문서는 Swagger를 통해 제공됩니다. 서버가 실행 중일 때 다음 URL에서 확인할 수 있습니다:

```
http://localhost:3000/api-docs
```

## 프로젝트 구조

```
src/
├── config/         # 설정 파일
│   ├── database.ts
│   ├── openai.ts
│   └── supabase.ts
├── controllers/    # 라우트 컨트롤러
│   ├── auth.controller.ts
│   ├── chat.controller.ts
│   ├── news.controller.ts
│   ├── post.controller.ts
│   └── mentor.controller.ts
├── middleware/     # 미들웨어
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── models/         # 데이터베이스 모델
│   ├── user.model.ts
│   ├── post.model.ts
│   ├── chat.model.ts
│   └── mentor.model.ts
├── routes/         # API 라우트
│   ├── auth.routes.ts
│   ├── chat.routes.ts
│   ├── news.routes.ts
│   ├── post.routes.ts
│   └── mentor.routes.ts
├── services/       # 비즈니스 로직
│   ├── chat.service.ts
│   ├── news.service.ts
│   ├── post.service.ts
│   └── mentor.service.ts
├── types/          # TypeScript 타입 정의
│   ├── user.types.ts
│   ├── post.types.ts
│   └── mentor.types.ts
├── utils/          # 유틸리티 함수
│   ├── logger.ts
│   └── helpers.ts
└── app.ts          # 앱 진입점
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
