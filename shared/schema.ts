import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {

  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  totalAttempts: integer("total_attempts").notNull().default(0),
  perfectAttempts: integer("perfect_attempts").notNull().default(0),
  firstPerfectAttempt: integer("first_perfect_attempt"),
  bestTime: real("best_time"),
});

export const attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  time: real("time").notNull(),
  isPerfect: integer("is_perfect").notNull().default(0),
  attemptNumber: integer("attempt_number").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
