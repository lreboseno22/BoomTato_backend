import Player from "../models/Player.js";

/**
 * @desc Register/Create a new player
 * @route POST /api/players/register
 */
export const registerPlayer = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await Player.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const player = new Player({ username, password });
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc Log in a player
 * @route POST /api/players/login
 */
export const loginPlayer = async (req, res) => {
  try {
    const { username, password } = req.body;
    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(404).json({ message: "Player not Found" });
    }

    // Validate password (Note: not hashed — for demo purposes)
    if (player.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Retrieve all players
 * @route GET /api/players
 */
export const getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Retrieve a single player by ID
 * @route GET /api/players/:id
 */
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update player details
 * @route PUT /api/players/:id
 */
export const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document (player body)
    );
    if (!updatedPlayer)
      return res.status(404).json({ message: "Player not Found" });
    res.json(updatedPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc Delete a player by ID
 * @route DELETE /api/players/:id
 */
export const deletePlayer = async (req, res) => {
  try {
    const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
    if (!deletedPlayer)
      return res.status(404).json({ message: "Player not Found" });
    res.json({ message: "Player deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
