import { type User, type InsertUser, type Player, type InsertPlayer, users, players } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, asc, isNotNull } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createOrUpdatePlayer(name: string, attempts: number, message?: string): Promise<Player>;
  getTopPlayer(): Promise<Player | null>;
  getPlayerRank(playerId: string): Promise<number>;
  getAllPlayers(): Promise<Player[]>;
  updatePlayerMessage(playerId: string, message: string): Promise<Player>;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createOrUpdatePlayer(name: string, attempts: number, message?: string): Promise<Player> {
    const existingPlayer = await db.select().from(players).where(eq(players.name, name)).limit(1);
    
    if (existingPlayer.length > 0) {
      const player = existingPlayer[0];
      const newFirstPerfectAttempt = !player.firstPerfectAttempt || attempts < player.firstPerfectAttempt 
        ? attempts 
        : player.firstPerfectAttempt;
      
      const updated = await db
        .update(players)
        .set({
          firstPerfectAttempt: newFirstPerfectAttempt,
          perfectAttempts: (player.perfectAttempts || 0) + 1,
          totalAttempts: (player.totalAttempts || 0) + attempts,
          bestTime: 10.00,
          message: message || player.message || "No one can beat me",
        })
        .where(eq(players.id, player.id))
        .returning();
      return updated[0];
    }

    const result = await db.insert(players).values({
      name,
      totalAttempts: attempts,
      perfectAttempts: 1,
      firstPerfectAttempt: attempts,
      bestTime: 10.00,
      message: message || "No one can beat me",
    }).returning();
    
    return result[0];
  }

  async getTopPlayer(): Promise<Player | null> {
    const result = await db
      .select()
      .from(players)
      .where(isNotNull(players.firstPerfectAttempt))
      .orderBy(asc(players.firstPerfectAttempt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async getPlayerRank(playerId: string): Promise<number> {
    const allPlayers = await db
      .select()
      .from(players)
      .orderBy(asc(players.firstPerfectAttempt));

    const rank = allPlayers.findIndex(p => p.id === playerId);
    return rank === -1 ? allPlayers.length + 1 : rank + 1;
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .orderBy(asc(players.firstPerfectAttempt));
  }

  async updatePlayerMessage(playerId: string, message: string): Promise<Player> {
    const updated = await db
      .update(players)
      .set({ message })
      .where(eq(players.id, playerId))
      .returning();
    return updated[0];
  }
}

export const storage = new DbStorage();
