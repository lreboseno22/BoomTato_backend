import mongoose from "mongoose";

/**
 * Player Schema
 * 
 * Represents a registered player in the game system.
 * Each player has a username, password, optional socketId (for live sessions),
 * and an accumulated score across games.
 *
 * NOTE: For simplicity and demo purposes, passwords are stored in plain text.
 */

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    score: { type: Number, default: 0 },
    socketId: { type: String, default: null },
}, { timestamps: true });

const Player = mongoose.model("Player", playerSchema);

export default Player;