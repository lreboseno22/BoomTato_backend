import express from "express";
import {
  createGame,
  deleteGame,
  endGame,
  getGameById,
  getGames,
  getWaitingGames,
  joinGame,
  leaveGame,
  startGame,
  updatedGame,
} from "../controllers/gameController.mjs";

const router = express.Router();

/**
 * Game Routes
 * Base URL: /api/games
 */

// Create a game
router.post("/", createGame);

// Retrieve all games
router.get("/", getGames);

// Retrieve only games waiting for players
router.get("/waiting", getWaitingGames);

// Retrieve a single game by ID
router.get("/:id", getGameById);

// Update a game's data
router.put("/:id", updatedGame);

// Start a game
router.put("/:id/start", startGame);

// End a game
router.put("/:id/end", endGame);

// Join a game
router.patch("/:id/join", joinGame);

// Leave a game
router.patch("/:id/leave", leaveGame);

// Delete a game
router.delete("/:id", deleteGame);

export default router;
