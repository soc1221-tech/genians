# LeaveFlow - Annual Leave Management System

Supabase를 사용하는 연차 관리 시스템입니다. React, TypeScript, Express, Supabase로 구축되었습니다.

## 🚀 Features

- **Supabase Authentication**: 안전한 사용자 인증 시스템
- **PostgreSQL Database**: 강력한 관계형 데이터베이스
- **Leave Management**: 연차 요청, 승인, 추적
- **Admin Dashboard**: 팀 연차 상태 종합 개요
- **Employee Dashboard**: 개인 연차 추적 및 요청
- **Real-time Updates**: 실시간 데이터 동기화
- **Responsive Design**: 모바일 친화적 인터페이스

## 🏗️ Project Structure

```
LeaveFlow/
├── client/                 # Frontend React application
│   ├── src/               # React source code
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Backend Express API
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication logic
│   ├── storage.ts        # Supabase operations
│   ├── db.ts             # Database configuration
│   └── package.json      # Backend dependencies
├── shared/                # Shared schemas and types
├── vercel.json           # Vercel deployment configuration
└── README.md             # This file
```

## 🚀 Supabase Setup

### Prerequisites

1. **Supabase Account**: [supabase.com](https://supabase.com)에서 계정 생성
2. **Node.js 18+**: Node.js가 설치되어 있어야 함
3. **Vercel Account**: [vercel.com](https://vercel.com)에서 계정 생성

### Quick Setup

1. **Supabase 프로젝트 생성**:
   - [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
   - Authentication과 Database 활성화

2. **환경 변수 설정**:
   - `.env` 파일에 Supabase 설정 추가

3. **Vercel에 배포**:
   ```bash
   vercel --prod
   ```

자세한 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참조하세요.

## 🔑 Test Accounts

### Admin Account
- **Email**: `admin@leaveflow.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Permissions**: 모든 기능에 대한 전체 접근 권한

### Employee Accounts
- **Email**: `employee@leaveflow.com`
- **Password**: `employee123`
- **Role**: Employee
- **Permissions**: 기본 연차 관리

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ 
- Supabase 프로젝트
- npm 또는 yarn

### Setup

1. **저장소 클론**:
   ```bash
   git clone <your-repo-url>
   cd LeaveFlow
   ```

2. **의존성 설치**:
   ```bash
   npm run install:all
   ```

3. **환경 변수 설정**:
   - `.env` 파일에 Supabase 설정 추가

4. **개발 서버 시작**:
   ```bash
   npm run dev
   ```

## 📱 Usage

### Admin Features

- 모든 직원과 연차 잔액 확인
- 연차 요청 승인/거부
- 팀 연차 통계 모니터링
- 직원 계정 관리

### Employee Features

- 연차 요청 제출
- 개인 연차 이력 확인
- 남은 연차 잔액 확인
- 개인 정보 업데이트

## 🔧 API Endpoints

- `POST /api/login` - 사용자 인증
- `POST /api/leave/request` - 연차 요청 제출
- `GET /api/leave/mine` - 사용자의 연차 요청 조회
- `GET /api/leave/all` - 모든 연차 요청 조회 (admin only)
- `PUT /api/leave/:id` - 연차 요청 업데이트
- `DELETE /api/leave/:id` - 연차 요청 삭제
- `GET /api/admin/employees` - 모든 직원 조회 (admin only)
- `GET /api/admin/stats` - 관리자 통계

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Passport.js
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Session-based with bcrypt
- **Deployment**: Vercel (Frontend + Backend)

## 🌐 Deployment to Vercel

### Environment Variables

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

**Server Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`
- `SESSION_SECRET`

**Client Environment Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Deployment Steps

1. **Vercel CLI 설치**:
   ```bash
   npm i -g vercel
   ```

2. **Vercel에 배포**:
   ```bash
   vercel
   ```

3. **환경 변수 설정**:
   - Vercel 대시보드에서 환경 변수 추가

4. **프로덕션 배포**:
   ```bash
   vercel --prod
   ```

## 🔐 Security Features

- Supabase Authentication으로 안전한 사용자 인증
- PostgreSQL Row Level Security (RLS)로 데이터 접근 제어
- 환경 변수를 통한 민감한 정보 보호
- 세션 기반 인증으로 보안 강화

## 📝 License

MIT License - LICENSE 파일 참조

## 🤝 Contributing

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 적용
4. 테스트 추가 (해당하는 경우)
5. Pull Request 제출

## 🆘 Support

문제가 발생한 경우:

1. 콘솔에서 오류 메시지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Supabase 프로젝트 설정 확인
4. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참조
5. Vercel 배포 로그 확인

---

**Note**: 이 애플리케이션은 Supabase의 강력한 기능을 활용하여 구축되었습니다. 프로덕션 환경에서는 추가적인 보안 기능과 모니터링을 고려하세요. 