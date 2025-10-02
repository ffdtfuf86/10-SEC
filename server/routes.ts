import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  function filterInappropriateContent(message: string): boolean {
    const inappropriateWords = [
      'fuck', 'shit', 'bitch', 'ass', 'damn', 'bastard', 'cunt', 'dick', 'pussy', 'cock',
      'sex', 'porn', 'nude', 'xxx', 'rape', 'kill', 'die', 'nigger', 'faggot', 'whore'
    ];
    
    const lowerMessage = message.toLowerCase();
    return inappropriateWords.some(word => lowerMessage.includes(word));
  }

  app.post("/api/attempt", async (req, res) => {
    try {
      const { playerName, time, attempts, message } = req.body;

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

      const currentBest = await storage.getTopPlayer();
      const isNewRecord = !currentBest || (currentBest.firstPerfectAttempt && attempts < currentBest.firstPerfectAttempt);

      if (message && filterInappropriateContent(message)) {
        return res.status(400).json({ error: "Message contains inappropriate content" });
      }

      const player = await storage.createOrUpdatePlayer(playerName, attempts, message);
      const rank = await storage.getPlayerRank(player.id);
      const topPlayer = await storage.getTopPlayer();

      res.json({
        isPerfect: true,
        rank,
        topPlayer,
        player,
        isNewRecord,
      });
    } catch (error) {
      console.error("Error processing attempt:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/update-message", async (req, res) => {
    try {
      const { playerName, message } = req.body;

      if (!playerName || !message) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      if (filterInappropriateContent(message)) {
        return res.status(400).json({ error: "Message contains inappropriate content" });
      }

      const topPlayer = await storage.getTopPlayer();
      
      if (!topPlayer || topPlayer.name !== playerName) {
        return res.status(403).json({ error: "Only the current record holder can update their message" });
      }

      topPlayer.message = message;
      
      res.json({ success: true, player: topPlayer });
    } catch (error) {
      console.error("Error updating message:", error);
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
