# C2C.com Backend

C2C.com 웹사이트의 백엔드 서버 레포지토리입니다.

## 기술 스택

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- MongoDB
- npm 또는 yarn

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
PORT=3000
MONGODB_URI=your_mongodb_connection_string
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
├── controllers/    # 라우트 컨트롤러
├── middleware/     # 미들웨어
├── models/         # 데이터베이스 모델
├── routes/         # API 라우트
├── services/       # 비즈니스 로직
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
