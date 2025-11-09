import mongoose from "mongoose";

/**
 * Game Schema
 * 
 * Represents an active or completed multiplayer game session.
 * Each game has a host (creator) and a list of participating players.
 * The status field tracks the game lifecycle:
 *  - "waiting" → lobby state (before the game starts)
 *  - "in-progress" → active game session
 *  - "finished" → completed game
 */

const gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    status: { type: String, default: "waiting" },
    createdAt: { type: Date, default: Date.now },
})

const Game = mongoose.model("Game", gameSchema);

export default Game;