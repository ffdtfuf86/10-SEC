import { type User, type InsertUser, type Player, type InsertPlayer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createOrUpdatePlayer(name: string, attempts: number): Promise<Player>;
  getTopPlayer(): Promise<Player | null>;
  getPlayerRank(playerId: string): Promise<number>;
  getAllPlayers(): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    
    const founderId = randomUUID();
    this.players.set(founderId, {
      id: founderId,
      name: "App Founder",
      totalAttempts: 19,
      perfectAttempts: 1,
      firstPerfectAttempt: 19,
      bestTime: 10.00,
    });
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

  async createOrUpdatePlayer(name: string, attempts: number): Promise<Player> {
    const currentBest = await this.getTopPlayer();
    
    if (currentBest && currentBest.firstPerfectAttempt && attempts >= currentBest.firstPerfectAttempt) {
      return currentBest;
    }

    this.players.clear();

    const id = randomUUID();
    const player: Player = {
      id,
      name,
      totalAttempts: attempts,
      perfectAttempts: 1,
      firstPerfectAttempt: attempts,
      bestTime: 10.00,
    };
    this.players.set(id, player);
    return player;
  }

  async getTopPlayer(): Promise<Player | null> {
    const allPlayers = Array.from(this.players.values());
    if (allPlayers.length === 0) return null;

    return allPlayers.reduce((top, current) => {
      if (!current.firstPerfectAttempt) return top;
      if (!top.firstPerfectAttempt) return current;
      return current.firstPerfectAttempt < top.firstPerfectAttempt ? current : top;
    });
  }

  async getPlayerRank(playerId: string): Promise<number> {
    const allPlayers = Array.from(this.players.values())
      .filter(p => p.firstPerfectAttempt !== null && p.firstPerfectAttempt !== undefined)
      .sort((a, b) => (a.firstPerfectAttempt || 0) - (b.firstPerfectAttempt || 0));

    const rank = allPlayers.findIndex(p => p.id === playerId);
    return rank === -1 ? allPlayers.length + 1 : rank + 1;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(p => p.firstPerfectAttempt !== null && p.firstPerfectAttempt !== undefined)
      .sort((a, b) => (a.firstPerfectAttempt || 0) - (b.firstPerfectAttempt || 0));
  }
}

export const storage = new MemStorage();
