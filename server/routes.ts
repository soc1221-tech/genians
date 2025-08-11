import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { insertLeaveRequestSchema, changePasswordSchema } from "@shared/schema";
import { sendLeaveRequestNotification } from "./slack";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Admin routes
  app.get("/api/admin/employees", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllUsers();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Leave request routes
  app.post("/api/leave/request", requireAuth, async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      const days = calculateDays(validatedData.startDate, validatedData.endDate);
      
      const user = await storage.getUser((req.user as any).id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.remainingLeave < days) {
        return res.status(400).json({ 
          message: `Insufficient leave balance. You have ${user.remainingLeave} days remaining, but requested ${days} days.` 
        });
      }

      const leaveRequest = await storage.createLeaveRequest({
        ...validatedData,
        userId: (req.user as any).id,
        days,
      });

      // Update user's remaining leave balance
      const newBalance = user.remainingLeave - days;
      await storage.updateUserLeaveBalance((req.user as any).id, newBalance);

      // Send Slack notification
      await sendLeaveRequestNotification(
        user.name,
        validatedData.startDate,
        validatedData.endDate,
        validatedData.reason,
        newBalance,
        days
      );

      res.status(201).json(leaveRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });

  app.get("/api/leave/mine", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getUserLeaveRequests((req.user as any).id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.get("/api/leave/all", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllLeaveRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all leave requests" });
    }
  });

  // Dashboard stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllUsers();
      const allRequests = await storage.getAllLeaveRequests();
      
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date();
      const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const onLeaveToday = allRequests.filter(req => 
        req.status === "approved" && 
        req.startDate <= today && 
        req.endDate >= today
      ).length;

      const thisMonthRequests = allRequests.filter(req =>
        req.status === "approved" &&
        req.startDate >= firstDayOfMonth &&
        req.startDate <= lastDayOfMonth
      ).reduce((total, req) => total + req.days, 0);

      res.json({
        totalEmployees: employees.length,
        onLeaveToday,
        thisMonth: thisMonthRequests,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Change password route
  app.post("/api/change-password", requireAuth, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isCurrentPasswordValid = await comparePasswords(validatedData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await hashPassword(validatedData.newPassword);
      await storage.updateUserPassword(user.id, hashedNewPassword);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid password change data" });
    }
  });

  // Update leave request
  app.put("/api/leave/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingRequest = await storage.getLeaveRequestById(id);
      
      if (!existingRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if user owns this request or is admin
      if (existingRequest.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }

      const validatedData = insertLeaveRequestSchema.parse(req.body);
      
      // Calculate old and new days
      const oldDays = existingRequest.days;
      const newDays = calculateDays(validatedData.startDate, validatedData.endDate);
      
      // Update user's leave balance
      const user = await storage.getUser(existingRequest.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const balanceAdjustment = oldDays - newDays; // positive means giving back days
      const newBalance = user.remainingLeave + balanceAdjustment;
      
      if (newBalance < 0) {
        return res.status(400).json({ message: "Insufficient leave balance for this change" });
      }

      // Update both the request and the user's balance
      const updatedRequest = await storage.updateLeaveRequest(id, {
        ...validatedData,
        days: newDays,
      });
      
      await storage.updateUserLeaveBalance(existingRequest.userId, newBalance);

      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });

  // Delete leave request
  app.delete("/api/leave/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingRequest = await storage.getLeaveRequestById(id);
      
      if (!existingRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if user owns this request or is admin
      if (existingRequest.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this request" });
      }

      // Restore user's leave balance
      const user = await storage.getUser(existingRequest.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = user.remainingLeave + existingRequest.days;
      await storage.updateUserLeaveBalance(existingRequest.userId, newBalance);
      
      // Delete the request
      await storage.deleteLeaveRequest(id);

      res.json({ message: "Leave request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete leave request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
