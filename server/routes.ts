import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { VulnerabilityScanner } from "./services/scanner.js";
import { insertScanSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const scanner = new VulnerabilityScanner();

  // Create a new scan
  app.post("/api/scans", async (req, res) => {
    try {
      const validatedData = insertScanSchema.parse(req.body);
      
      // Create scan record
      const scan = await storage.createScan(validatedData);
      
      // Start scanning in background
      scanInBackground(scan.id, validatedData);
      
      res.json(scan);
    } catch (error) {
      console.error("Error creating scan:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid scan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create scan" });
      }
    }
  });

  // Get scan by ID
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // Get all scans
  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getScans();
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Get vulnerabilities for a scan
  app.get("/api/scans/:id/vulnerabilities", async (req, res) => {
    try {
      const vulnerabilities = await storage.getVulnerabilitiesByScanId(req.params.id);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ message: "Failed to fetch vulnerabilities" });
    }
  });

  // Background scanning function
  async function scanInBackground(scanId: string, scanData: { url: string; scanTypes: string[] }) {
    try {
      console.log(`Starting scan for ${scanData.url} with types:`, scanData.scanTypes);
      
      // Update scan status to scanning
      await storage.updateScan(scanId, { 
        status: "scanning", 
        progress: 10 
      });

      // Perform the actual scan
      console.log("Calling scanner.scanWebsite...");
      const result = await scanner.scanWebsite(scanData);
      console.log("Scan completed, vulnerabilities found:", result.vulnerabilities.length);

      // Update progress
      await storage.updateScan(scanId, { 
        progress: 70,
        metadata: result.metadata 
      });

      // Store vulnerabilities
      for (const vuln of result.vulnerabilities) {
        await storage.createVulnerability({ ...vuln, scanId });
      }

      // Mark scan as completed
      await storage.updateScan(scanId, { 
        status: "completed", 
        progress: 100,
        completedAt: new Date()
      });

      console.log(`Scan ${scanId} completed successfully`);

    } catch (error) {
      console.error("Background scan error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      await storage.updateScan(scanId, { 
        status: "failed", 
        progress: 0 
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
