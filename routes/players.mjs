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

// Create player
router.post("/register", registerPlayer);

// Login player
router.post("/login", loginPlayer);

// Get all players
router.get("/", getPlayers);

// Get player by id
router.get("/:id", getPlayerById);

// Update player by id
router.put("/:id", updatePlayer);

// DELETE a player by ID
router.delete("/:id", deletePlayer);

export default router;
