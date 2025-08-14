import { users, leaveRequests, type User, type InsertUser, type LeaveRequest, type InsertLeaveRequest } from "../shared/schema.js";
import { db, DEFAULT_ADMIN } from "./firebase.js";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Firestore } from 'firebase/firestore';
import session from "express-session";
import MemoryStore from "memorystore";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLeaveBalance(userId: string, remainingLeave: number): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  getUserLeaveRequests(userId: string): Promise<LeaveRequest[]>;
  getAllLeaveRequests(): Promise<(LeaveRequest & { user: User })[]>;
  getLeaveRequestById(id: string): Promise<LeaveRequest | undefined>;
  updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  deleteLeaveRequest(id: string): Promise<void>;

  sessionStore: session.Store;
}

export class FirebaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Firebase를 사용하므로 메모리 세션 스토어 사용
    const MemorySessionStore = MemoryStore(session);
    this.sessionStore = new MemorySessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      // 기본 admin 계정 확인
      if (id === DEFAULT_ADMIN.id) {
        return DEFAULT_ADMIN;
      }

      // Firebase가 사용 불가능한 경우 기본 admin만 반환
      if (!db) {
        console.log("Firebase not available, returning default admin only");
        return undefined;
      }

      // Firestore에서 사용자 조회
      const userDoc = await getDoc(doc(db as Firestore, 'users', id));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return undefined;
    } catch (error) {
      console.log("Firebase getUser error:", error);
      // 기본 admin 계정 fallback
      if (id === DEFAULT_ADMIN.id) {
        return DEFAULT_ADMIN;
      }
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // 기본 admin 계정 확인
      if (email === DEFAULT_ADMIN.email) {
        return DEFAULT_ADMIN;
      }

      // Firebase가 사용 불가능한 경우 기본 admin만 반환
      if (!db) {
        console.log("Firebase not available, returning default admin only");
        return undefined;
      }

      // Firestore에서 이메일로 사용자 조회
      const usersRef = collection(db as Firestore, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.log("Firebase getUserByEmail error:", error);
      // 기본 admin 계정 fallback
      if (email === DEFAULT_ADMIN.email) {
        return DEFAULT_ADMIN;
      }
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Firebase가 사용 불가능한 경우 mock 사용자 반환
      if (!db) {
        console.log("Firebase not available, returning mock user");
        return {
          id: `mock-${Date.now()}`,
          name: insertUser.name,
          email: insertUser.email,
          password: insertUser.password,
          role: insertUser.role || "employee",
          totalLeave: insertUser.totalLeave || 15,
          remainingLeave: insertUser.totalLeave || 15,
          createdAt: new Date(),
        };
      }

      // Firestore에 사용자 추가
      const userData = {
        ...insertUser,
        remainingLeave: insertUser.totalLeave || 15,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db as Firestore, 'users'), userData);
      return {
        id: docRef.id,
        ...userData,
      } as User;
    } catch (error) {
      console.log("Firebase createUser error:", error);
      // 에러 발생 시 mock 사용자 반환
      return {
        id: `mock-${Date.now()}`,
        name: insertUser.name,
        email: insertUser.email,
        password: insertUser.password,
        role: insertUser.role || "employee",
        totalLeave: insertUser.totalLeave || 15,
        remainingLeave: insertUser.totalLeave || 15,
        createdAt: new Date(),
      };
    }
  }

  async updateUserLeaveBalance(userId: string, remainingLeave: number): Promise<void> {
    try {
      if (userId === DEFAULT_ADMIN.id) {
        // 기본 admin 계정은 업데이트하지 않음
        return;
      }

      if (!db) {
        console.log("Firebase not available, skipping leave balance update");
        return;
      }

      const userRef = doc(db as Firestore, 'users', userId);
      await updateDoc(userRef, { remainingLeave });
    } catch (error) {
      console.log("Firebase updateUserLeaveBalance error:", error);
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      if (userId === DEFAULT_ADMIN.id) {
        // 기본 admin 계정은 업데이트하지 않음
        return;
      }

      if (!db) {
        console.log("Firebase not available, skipping password update");
        return;
      }

      const userRef = doc(db as Firestore, 'users', userId);
      await updateDoc(userRef, { password: hashedPassword });
    } catch (error) {
      console.log("Firebase updateUserPassword error:", error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (!db) {
        console.log("Firebase not available, returning empty user list");
        return [];
      }

      // Firestore에서 모든 employee 사용자 조회
      const usersRef = collection(db as Firestore, 'users');
      const q = query(usersRef, where('role', '==', 'employee'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.log("Firebase getAllUsers error:", error);
      return [];
    }
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    try {
      if (!db) {
        console.log("Firebase not available, returning mock leave request");
        return {
          id: `mock-leave-${Date.now()}`,
          userId: request.userId,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason,
          status: "approved",
          days: request.days,
          createdAt: new Date(),
        };
      }

      // Firestore에 leave request 추가
      const leaveRequestData = {
        ...request,
        status: "approved",
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db as Firestore, 'leaveRequests'), leaveRequestData);
      return {
        id: docRef.id,
        ...leaveRequestData,
      } as LeaveRequest;
    } catch (error) {
      console.log("Firebase createLeaveRequest error:", error);
      // 에러 발생 시 mock leave request 반환
      return {
        id: `mock-leave-${Date.now()}`,
        userId: request.userId,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: "approved",
        days: request.days,
        createdAt: new Date(),
      };
    }
  }

  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    try {
      if (!db) {
        console.log("Firebase not available, returning empty leave requests");
        return [];
      }

      // Firestore에서 사용자의 leave requests 조회
      const leaveRequestsRef = collection(db as Firestore, 'leaveRequests');
      const q = query(
        leaveRequestsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
    } catch (error) {
      console.log("Firebase getUserLeaveRequests error:", error);
      return [];
    }
  }

  async getAllLeaveRequests(): Promise<(LeaveRequest & { user: User })[]> {
    try {
      if (!db) {
        console.log("Firebase not available, returning empty leave requests");
        return [];
      }

      // Firestore에서 모든 leave requests 조회
      const leaveRequestsRef = collection(db as Firestore, 'leaveRequests');
      const q = query(leaveRequestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const leaveRequests = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];

      // 각 leave request에 사용자 정보 추가
      const leaveRequestsWithUsers = await Promise.all(
        leaveRequests.map(async (request) => {
          const user = await this.getUser(request.userId);
          return {
            ...request,
            user: user || DEFAULT_ADMIN,
          };
        })
      );

      return leaveRequestsWithUsers;
    } catch (error) {
      console.log("Firebase getAllLeaveRequests error:", error);
      return [];
    }
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | undefined> {
    try {
      if (!db) {
        console.log("Firebase not available, returning undefined leave request");
        return undefined;
      }

      // Firestore에서 특정 leave request 조회
      const leaveRequestDoc = await getDoc(doc(db as Firestore, 'leaveRequests', id));
      if (leaveRequestDoc.exists()) {
        return { id: leaveRequestDoc.id, ...leaveRequestDoc.data() } as LeaveRequest;
      }
      return undefined;
    } catch (error) {
      console.log("Firebase getLeaveRequestById error:", error);
      return undefined;
    }
  }

  async updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    try {
      if (!db) {
        console.log("Firebase not available, returning mock updated leave request");
        return {
          id,
          userId: request.userId || "unknown",
          startDate: request.startDate || new Date().toISOString().split('T')[0],
          endDate: request.endDate || new Date().toISOString().split('T')[0],
          reason: request.reason || "Unknown",
          status: "approved",
          days: request.days || 1,
          createdAt: new Date(),
        };
      }

      // Firestore에서 leave request 업데이트
      const leaveRequestRef = doc(db as Firestore, 'leaveRequests', id);
      const updateData = {
        ...request,
        updatedAt: new Date(),
      };
      
      await updateDoc(leaveRequestRef, updateData);
      
      // 업데이트된 문서 반환
      const updatedDoc = await getDoc(leaveRequestRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as LeaveRequest;
    } catch (error) {
      console.log("Firebase updateLeaveRequest error:", error);
      // 에러 발생 시 mock 업데이트된 request 반환
      return {
        id,
        userId: request.userId || "unknown",
        startDate: request.startDate || new Date().toISOString().split('T')[0],
        endDate: request.endDate || new Date().toISOString().split('T')[0],
        reason: request.reason || "Unknown",
        status: "approved",
        days: request.days || 1,
        createdAt: new Date(),
      };
    }
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    try {
      if (!db) {
        console.log("Firebase not available, skipping leave request deletion");
        return;
      }

      // Firestore에서 leave request 삭제
      const leaveRequestRef = doc(db as Firestore, 'leaveRequests', id);
      await deleteDoc(leaveRequestRef);
    } catch (error) {
      console.log("Firebase deleteLeaveRequest error:", error);
    }
  }
}

export const storage = new FirebaseStorage();
