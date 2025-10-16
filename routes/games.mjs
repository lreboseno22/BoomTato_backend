import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

// Create Game
router.post("/", async (req, res) => {
    try {
        const { name, host } = req.body;
        const newGame = await Game.create({ name, host, players: [host] });
        const savedGame = await newGame.save();

        res.status(201).json(savedGame);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;