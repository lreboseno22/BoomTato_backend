import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    status: { type: String, default: "waiting" }, // status for the game // waiting (just hosted), in progress (game started), finished (game ended)
    createdAt: { type: Date, default: Date.now },
})

const Game = mongoose.model("Game", gameSchema);

export default Game;