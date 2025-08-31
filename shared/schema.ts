import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, scanning, completed, failed
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  scanTypes: jsonb("scan_types").$type<string[]>().notNull().default(['sql', 'js', 'http']),
  metadata: jsonb("metadata").$type<{
    scannedFiles?: number;
    scannedLines?: number;
    totalFiles?: number;
  }>().default({}),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull().references(() => scans.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // critical, high, medium, low
  type: text("type").notNull(), // sql, js, http
  file: text("file").notNull(),
  line: integer("line"),
  vulnerableCode: text("vulnerable_code"),
  attackVector: text("attack_vector"),
  exploitationScenario: jsonb("exploitation_scenario").$type<string[]>().default([]),
  recommendedFix: text("recommended_fix"),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).pick({
  url: true,
  scanTypes: true,
}).extend({
  scanTypes: z.array(z.string()).min(1, "At least one scan type is required"),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  detectedAt: true,
}).extend({
  line: z.number().nullable().optional(),
  vulnerableCode: z.string().nullable().optional(),
  attackVector: z.string().nullable().optional(),
  exploitationScenario: z.array(z.string()).nullable().optional(),
  recommendedFix: z.string().nullable().optional(),
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
