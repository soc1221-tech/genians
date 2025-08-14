import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDK 초기화
let app;
let db;
let auth;

try {
  if (getApps().length === 0) {
    // 환경 변수에서 Firebase 설정을 가져옴
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
        undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // 필수 Firebase 설정이 있는지 확인
    if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
      app = initializeApp({
        credential: cert(serviceAccount as any),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      db = getFirestore(app);
      auth = getAuth(app);
      console.log("Firebase initialized successfully");
    } else {
      console.log("Firebase credentials not provided, running in mock mode");
      app = null;
      db = null;
      auth = null;
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.log("Firebase initialization failed, running in mock mode:", error);
  app = null;
  db = null;
  auth = null;
}

// Firestore 데이터베이스 인스턴스
export { db, auth };

// 기본 admin 계정 정보
export const DEFAULT_ADMIN = {
  id: "admin-001",
  name: "Admin User",
  email: "admin@leaveflow.com",
  password: "admin123",
  role: "admin" as const,
  totalLeave: 25,
  remainingLeave: 25,
  createdAt: new Date(),
};

export default app; 