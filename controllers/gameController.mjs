import Game from "../models/Game.js";

/**
 * 
 * @desc Create a new game
 * @route POST /api/games
 */
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

/**
 * 
 * @desc Get all games
 * @route GET /api/games
 */
export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 
 * @desc Get all waiting games
 * @route GET /api/games/waiting
 */
export const getWaitingGames = async (req, res) => {
  try {
    const waitingGames = await Game.find({ status: "waiting" })
      .populate("host", "username")
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(waitingGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 
 * @desc Get single game by ID 
 * @route GET /api/games/:id
 */
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

/**
 * 
 * @desc Update a game by ID
 * @route PUT /api/games/:id
 */
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

/**
 * 
 * @desc Start a game (must have >= 2 players)
 * @route PUT /api/games/:id/start
 */
export const startGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) return res.status(404).json({ message: "Game not Found" });
    if (game.status !== "waiting")
      return res
        .status(400)
        .json({ message: "Game already started or finished" });

    // Require at least 2 players to start
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

/**
 * @desc End a game and mark as finished
 * @route PUT /api/games/:id/end
 */
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

/**
 * @desc Join an existing waiting game
 * @route PATCH /api/games/:id/join
 */
export const joinGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not Found" });

    // Allow joining only if game is in "waiting" state
    if (game.status !== "waiting") {
      return res.status(400).json({ message: "Game is not joinable" });
    }

    // Prevent duplicate players
    if (game.players.includes(playerId))
      return res.status(400).json({ message: "Player already joined" });

    game.players.push(playerId);
    await game.save();

    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Leave a game (reverts to waiting if <2 players remain)
 * @route PATCH /api/games/:id/leave
 */
export const leaveGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not Found" });

    // Filter out player who left
    game.players = game.players.filter(
      (player) => player.toString() !== playerId
    );

    // If fewer than 2 players remain, revert status
    if (game.players.length < 2) {
      game.status = "waiting";
    }

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a game permanently
 * @route DELETE /api/games/:id
 */
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
