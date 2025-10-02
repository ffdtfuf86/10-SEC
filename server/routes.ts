import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/attempt", async (req, res) => {
    try {
      const { playerName, time, attempts } = req.body;

      if (!playerName || typeof time !== 'number' || typeof attempts !== 'number') {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const isPerfect = time === 10.00;

      if (!isPerfect) {
        return res.json({
          isPerfect: false,
          rank: null,
          topPlayer: await storage.getTopPlayer(),
        });
      }

      const player = await storage.createOrUpdatePlayer(playerName, attempts);
      const rank = await storage.getPlayerRank(player.id);
      const topPlayer = await storage.getTopPlayer();

      res.json({
        isPerfect: true,
        rank,
        topPlayer,
        player,
      });
    } catch (error) {
      console.error("Error processing attempt:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      const topPlayer = await storage.getTopPlayer();
      
      res.json({
        players,
        topPlayer,
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
