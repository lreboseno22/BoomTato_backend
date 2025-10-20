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

// Create a game
router.post("/", createGame);

// Get all games
router.get("/", getGames);

// Get all games that are in "waiting" status
router.get("/waiting", getWaitingGames);

// Get game by id
router.get("/:id", getGameById);

// Update game by id
router.put("/:id", updatedGame);

// Start game
router.put("/:id/start", startGame);

// End game
router.put("/:id/end", endGame);

// Join game
router.patch("/:id/join", joinGame);

// Leave game
router.patch("/:id/leave", leaveGame);

// Delete game
router.delete("/:id", deleteGame);

export default router;
