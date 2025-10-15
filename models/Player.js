import mongoose from "mongoose";

// Player Schema
const playerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    score: { type: Number, default: 0 },
    // socketId would go here as well 
}, { timestamps: true });

const Player = mongoose.model("Player", playerSchema);

export default Player;