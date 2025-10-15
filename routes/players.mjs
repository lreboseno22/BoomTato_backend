import express from "express";
import Player from "../models/Player.js";

const router = express.Router();

// Routes

// CREATE / POST
router.post("/", async (req, res) => {
    const { username, score } = req.body;
    const player = new Player({ username, score })
    try {
        const newPlayer = await player.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// READ / GET

// UPDATE / PUT

// DELETE

export default router;