import { users, leaveRequests, type User, type InsertUser, type LeaveRequest, type InsertLeaveRequest } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db.js";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool as any,
      createTableIfMissing: true
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        remainingLeave: insertUser.totalLeave || 15,
      })
      .returning();
    return user;
  }

  async updateUserLeaveBalance(userId: string, remainingLeave: number): Promise<void> {
    await db
      .update(users)
      .set({ remainingLeave })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "employee"));
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [leaveRequest] = await db
      .insert(leaveRequests)
      .values(request)
      .returning();
    return leaveRequest;
  }

  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.userId, userId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getAllLeaveRequests(): Promise<(LeaveRequest & { user: User })[]> {
    const result = await db
      .select()
      .from(leaveRequests)
      .leftJoin(users, eq(leaveRequests.userId, users.id))
      .orderBy(desc(leaveRequests.createdAt));

    return result.map(row => ({
      ...row.leave_requests,
      user: row.users!,
    }));
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | undefined> {
    const [request] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return request || undefined;
  }

  async updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [updatedRequest] = await db
      .update(leaveRequests)
      .set(request)
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
  }
}

export const storage = new DatabaseStorage();
