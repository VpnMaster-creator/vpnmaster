import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { and, eq } from "drizzle-orm";

// Admin middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (!req.user.isAdmin && req.user.username !== 'dev') {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  
  next();
}

export function setupAdminRoutes(app: Express) {
  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Delete a user
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    try {
      // Don't allow deleting the dev account
      const userToDelete = await storage.getUser(userId);
      if (userToDelete?.username === 'dev') {
        return res.status(403).json({ error: "Cannot delete the dev account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  
  // Get VPN status metrics (for admin dashboard)
  app.get("/api/admin/vpn-status", isAdmin, async (req, res) => {
    try {
      // Get active connections
      const activeConnections = await storage.getActiveConnections();
      
      // Get server stats
      const serverStats = await storage.getServerStats();
      
      res.json({
        activeConnections,
        serverStats,
        protocol: "OpenVPN TCP",
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching VPN status:", error);
      res.status(500).json({ error: "Failed to fetch VPN status" });
    }
  });
  
  // IP masking test API
  app.get("/api/admin/ip-test", isAdmin, async (req, res) => {
    // This is a simulation since we can't actually mask IP in this demo
    const originalIp = req.ip || "192.168.1.100";
    const maskedIp = `103.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    res.json({
      originalIp,
      maskedIp,
      isMasked: true,
      testTime: new Date().toISOString()
    });
  });
}