import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

// Create Game
router.post("/", async (req, res) => {
    try {
        const { name, host } = req.body;

        // Check if player/host already has a game open
        const existingGame = await Game.findOne({
            host,
            status: { $in: ["waiting", "in progress"] } // only if the game's status is in progress or waiting
        });

        // If the player does have a game that isn't finihsed then throw error
        if(existingGame){
            return res.status(400).json({
                message: "You already have an active game. Finish it or cancle it first!"
            })
        }

        const newGame = new Game({ 
            name, 
            host, 
            players: [host],
            status: "waiting"
        });

        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get/Read Game
router.get("/", async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get/Read Game by id
router.get("/:id", async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if(!game) return res.status(404).json({ message: "Game not Found" });
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// EDIT GAME by id
router.put("/:id", async (req, res) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        if(!updatedGame) return res.status(404).json({ message: "Game not Found" });
        res.json(updatedGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// END GAME 
router.put("/:id/end", async (req, res) => {
    try {
        const { id } = req.params;
        const game = await Game.findById(id);
        if(!game) return res.status(404).json({ message: "Game not Found" });

        game.status = "finished";
        await game.save();
        res.json({ message: "Game ended", game });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


// DELETE GAME by id
router.delete("/:id", async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if(!deletedGame) return res.status(404).json({ message: "Game not Found" });
        res.json({ message: "Game deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

export default router;