import Game from "../models/Game.js";

export const createGame = async (req, res) => {
  try {
    const { name, host } = req.body;
    const existingGame = await Game.findOne({
      host,
      status: { $in: ["waiting", "in progress"] },
    });

    if (existingGame) {
      return res
        .status(400)
        .json({ message: "You already have an active game." });
    }

    const newGame = new Game({
      name,
      host,
      players: [host],
      status: "waiting",
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWaitingGames = async (req, res) => {
  try {
    const waitingGames = await Game.find({ status: "waiting" })
      .populate("host", "username")
      .sort({ createdAt: -1 }); // new first

    if (waitingGames.length === 0) {
      return res
        .status(200)
        .json({ message: "No open games avilable right now" });
    }

    res.json(waitingGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("players", "username")
      .populate("host", "username");

    if (!game) return res.status(404).json({ message: "Game not Found" });

    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatedGame = async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedGame)
      return res.status(404).json({ message: "Game not Found" });

    res.json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const startGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) return res.status(404).json({ message: "Game not Found" });
    if (game.status !== "waiting")
      return res
        .status(400)
        .json({ message: "Game already started or finished" });

    // require at least 2 players
    if (game.players.length < 2)
      return res
        .status(400)
        .json({ message: "Need at least 2 players to start" });
    game.status = "in-progress";
    await game.save();
    res.json({ message: "Game started", game });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const endGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not Found" });

    game.status = "finished";
    await game.save();
    res.json({ message: "Game ended", game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not Found" });

    // only join if game's status is waiting for players
    if (game.status !== "waiting") {
      return res.status(400).json({ message: "Game is not joinable" });
    }

    // add player to players list
    game.players.push(playerId);

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const leaveGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not Found" });

    game.players = game.players.filter(
      (player) => player.toString() !== playerId
    );

    if (game.players.length < 2) {
      game.status = "waiting";
    }

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);

    if (!deletedGame)
      return res.status(404).json({ message: "Game not Found" });

    res.json({ message: "Game deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
