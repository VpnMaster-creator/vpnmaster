import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { setupVPNProxy, setupVPNWebSockets } from "./vpn-proxy";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up admin routes
  setupAdminRoutes(app);
  
  // Set up VPN proxy functionality
  setupVPNProxy(app);

  // Get all servers
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  // Get specific server
  app.get("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid server ID" });
      }
      
      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  // Get user connection history
  app.get("/api/connection-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const history = await storage.getConnectionHistory(req.user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch connection history" });
    }
  });

  // Start a VPN connection
  app.post("/api/connect", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        serverId: z.number(),
        ipAddress: z.string()
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const { serverId, ipAddress } = result.data;
      
      // Check if server exists
      const server = await storage.getServer(serverId);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      // Create connection history record
      const connection = await storage.addConnectionHistory({
        userId: req.user.id,
        serverId,
        ipAddress,
        connectedAt: new Date(),
        dataUsed: 0
      });
      
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to establish connection" });
    }
  });

  // End a VPN connection
  app.post("/api/disconnect", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        connectionId: z.number(),
        dataUsed: z.number()
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const { connectionId, dataUsed } = result.data;
      const disconnectedAt = new Date();
      
      // Fetch the connection to calculate duration
      const history = await storage.getConnectionHistory(req.user.id);
      const connection = history.find(c => c.id === connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Calculate duration in seconds
      const connectedAtTime = new Date(connection.connectedAt).getTime();
      const disconnectedAtTime = disconnectedAt.getTime();
      const durationInSeconds = Math.floor((disconnectedAtTime - connectedAtTime) / 1000);
      
      // Update the connection record
      const updatedConnection = await storage.updateConnectionHistory(
        connectionId,
        disconnectedAt,
        durationInSeconds,
        dataUsed
      );
      
      if (!updatedConnection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSockets for real-time VPN stats
  setupVPNWebSockets(httpServer);
  
  return httpServer;
}