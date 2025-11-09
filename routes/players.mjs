import express from "express";
import {
  deletePlayer,
  getPlayerById,
  getPlayers,
  loginPlayer,
  registerPlayer,
  updatePlayer,
} from "../controllers/playerController.mjs";

const router = express.Router();

/**
 * Player Routes
 * Base URL: /api/players
 */

// Register/Create player
router.post("/register", registerPlayer);

// Log in existing player
router.post("/login", loginPlayer);

// Get all players
router.get("/", getPlayers);

// Get a specific player by ID
router.get("/:id", getPlayerById);

// Update player by ID
router.put("/:id", updatePlayer);

// DELETE a player by ID
router.delete("/:id", deletePlayer);

export default router;
