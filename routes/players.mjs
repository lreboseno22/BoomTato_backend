import express from "express";
import Player from "../models/Player.js";

const router = express.Router();

// Routes

// CREATE / POST a player

// Register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const existing = await Player.findOne({ username });
        if(existing){
            return res.status(400).json({ message: "Username already taken" });
        }
        const player = new Player({ username, password });
        const newPlayer = await player.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const player = await Player.findOne({ username });
        if(!player){
            return res.status(404).json({ message: "Player not Found" });
        }

        if(player.password !== password){
            return res.status(401).json({ message: "Incorrect password" });
        }
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

// READ / GET all players
router.get("/", async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single player by ID
router.get("/:id", async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if(!player) return res.status(404).json({ message: "Player not found" });
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE / PUT a player by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id,req.body, { new: true }); // will return the updated player body
        if(!updatedPlayer) return res.status(404).json({ message: "Player not Found" });
        res.json(updatedPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a player by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
        if(!deletedPlayer) return res.status(404).json({ message: "Player not Found" });
        res.json({ message: "Player deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;