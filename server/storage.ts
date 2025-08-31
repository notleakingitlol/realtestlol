import { type User, type InsertUser, type Scan, type InsertScan, type Vulnerability, type InsertVulnerability } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined>;
  getScans(): Promise<Scan[]>;
  
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  getVulnerabilitiesByScanId(scanId: string): Promise<Vulnerability[]>;
  getVulnerabilities(): Promise<Vulnerability[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<string, Scan>;
  private vulnerabilities: Map<string, Vulnerability>;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.vulnerabilities = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      ...insertScan,
      id,
      status: "pending",
      progress: 0,
      startedAt: new Date(),
      completedAt: null,
      metadata: {},
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;
    
    const updatedScan = { ...scan, ...updates };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  async getScans(): Promise<Scan[]> {
    return Array.from(this.scans.values()).sort(
      (a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0)
    );
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vulnerability: Vulnerability = {
      ...insertVulnerability,
      id,
      detectedAt: new Date(),
    };
    this.vulnerabilities.set(id, vulnerability);
    return vulnerability;
  }

  async getVulnerabilitiesByScanId(scanId: string): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values())
      .filter(v => v.scanId === scanId)
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      });
  }

  async getVulnerabilities(): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values());
  }
}

export const storage = new MemStorage();
