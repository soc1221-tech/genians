import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  totalLeave: number;
  remainingLeave: number;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Firestore에서 사용자 정보 가져오기
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              id: firebaseUser.uid,
              ...userData
            });
          } else {
            // 기본 admin 계정 확인
            if (firebaseUser.email === "admin@leaveflow.com") {
              setUser({
                id: "admin-001",
                name: "Admin User",
                email: "admin@leaveflow.com",
                role: "admin",
                totalLeave: 25,
                remainingLeave: 25,
                createdAt: new Date(),
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // 기본 admin 계정 fallback
          if (firebaseUser.email === "admin@leaveflow.com") {
            setUser({
              id: "admin-001",
              name: "Admin User",
              email: "admin@leaveflow.com",
              role: "admin",
              totalLeave: 25,
              remainingLeave: 25,
              createdAt: new Date(),
            });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Firebase Auth로 로그인
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 기본 admin 계정인 경우 Firestore에 사용자 정보 생성
      if (email === "admin@leaveflow.com" && !userCredential.user.emailVerified) {
        const adminUser = {
          id: userCredential.user.uid,
          name: "Admin User",
          email: "admin@leaveflow.com",
          role: "admin" as const,
          totalLeave: 25,
          remainingLeave: 25,
          createdAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
