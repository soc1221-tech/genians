# 🚀 Firebase Setup Guide for LeaveFlow

이 가이드는 LeaveFlow 애플리케이션을 Firebase를 사용하도록 설정하는 방법을 설명합니다.

## 📋 Prerequisites

1. **Firebase Account**: [firebase.google.com](https://firebase.google.com)에서 계정 생성
2. **Node.js 18+**: Node.js가 설치되어 있어야 함
3. **Git**: 버전 관리를 위한 Git

## 🏗️ Step 1: Firebase 프로젝트 생성

1. **Firebase Console로 이동**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **"프로젝트 추가" 클릭**
3. **프로젝트 세부정보 입력**:
   - **프로젝트 이름**: `leaveflow` (또는 원하는 이름)
   - **Google Analytics**: 선택사항 (권장하지 않음)
4. **"프로젝트 만들기" 클릭**

## 🔑 Step 2: Firebase 서비스 설정

### Authentication 설정
1. **Authentication → 시작하기** 클릭
2. **이메일/비밀번호** 제공업체 활성화
3. **사용자 추가**에서 admin 계정 생성:
   - 이메일: `admin@leaveflow.com`
   - 비밀번호: `admin123`

### Firestore Database 설정
1. **Firestore Database → 데이터베이스 만들기** 클릭
2. **테스트 모드에서 시작** 선택 (개발용)
3. **위치 선택**: 사용자와 가까운 지역 선택

## 🗄️ Step 3: 서비스 계정 키 생성

1. **프로젝트 설정** → **서비스 계정** 탭
2. **Firebase Admin SDK** 섹션에서 **새 비공개 키 생성** 클릭
3. **JSON 파일 다운로드** (이 파일을 안전하게 보관)

## 🌐 Step 4: 환경 변수 설정

### 서버 환경 변수 (.env)
```env
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=production
```

### 클라이언트 환경 변수 (client/.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 🔧 Step 5: Firebase 보안 규칙 설정

### Firestore 보안 규칙
Firestore Database → 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin은 모든 데이터에 접근 가능
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🚀 Step 6: Vercel 배포

### 환경 변수 설정
1. **Vercel Dashboard**에서 프로젝트 선택
2. **Settings** → **Environment Variables** 탭
3. **서버 환경 변수** 추가 (위의 .env 내용)
4. **클라이언트 환경 변수** 추가 (VITE_ 접두사 포함)

### 배포
```bash
# 프로젝트 루트에서
vercel --prod
```

## 🧪 Step 7: 테스트

1. **애플리케이션 접속**
2. **Admin 계정으로 로그인**:
   - 이메일: `admin@leaveflow.com`
   - 비밀번호: `admin123`
3. **관리자 대시보드 접근 확인**

## 🔐 보안 고려사항

1. **서비스 계정 키**: 절대 공개 저장소에 커밋하지 마세요
2. **환경 변수**: Vercel에서 안전하게 관리
3. **Firebase 규칙**: 적절한 보안 규칙 설정
4. **Admin 계정**: 프로덕션에서는 강력한 비밀번호 사용

## 🆘 문제 해결

### 일반적인 오류

1. **"Firebase not initialized" 오류**:
   - 환경 변수가 올바르게 설정되었는지 확인
   - 서비스 계정 키 형식 확인

2. **"Permission denied" 오류**:
   - Firestore 보안 규칙 확인
   - 사용자 인증 상태 확인

3. **"Invalid API key" 오류**:
   - 클라이언트 환경 변수 확인
   - Firebase 프로젝트 설정 확인

### 로그 확인
- **Firebase Console** → **Functions** → **Logs**
- **Vercel Dashboard** → **Functions** → **Logs**

## 📊 모니터링

- **Firebase Console** → **Authentication**: 사용자 로그인 상태
- **Firebase Console** → **Firestore**: 데이터베이스 사용량
- **Vercel Dashboard**: 애플리케이션 성능 및 오류

---

**🎉 축하합니다! LeaveFlow가 Firebase를 사용하여 완벽하게 설정되었습니다!**

Firebase의 강력한 기능을 활용하여 확장 가능하고 안전한 애플리케이션을 운영할 수 있습니다. 