import {
  initGameState,
  movePlayer,
  getGameState,
  setGamePhase
} from "../game/stateManager.mjs";
import Game from "../models/Game.js";

/**
 * Game Socket Events
 * 
 * This module manages all real-time socket events for BOOMTato.
 * Handles player connections, lobby updates, room joins/leaves, game start, and in-game movement synchronization.
 */

/**
 * Initializes all Socket.IO event listeners related to the game.
 * @param {Server} io - The Socket.IO server instance
 */

export default function initGameSocket(io) {
  // Map to keeo track of connected players by socket ID
  const connectedPlayers = new Map();

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
  });

  io.on("connection", (socket) => {
    console.log(`[SERVER] Player connected: ${socket.id}`);

    // Player Registration
    socket.on("registerPlayer", (playerId) => {
      connectedPlayers.set(socket.id, { playerId });
      console.log(
        `[SERVER] Registerd player ${playerId} for socket ${socket.id}`
      );
    });

    // Game Creation
    socket.on("createGame", async (gameData) => {
      try {
        const newGame = await Game.create({
          ...gameData,
          players: [gameData.host],
        });

        // Notify all clients that a new game lobby is available
        io.emit("lobbyUpdate", newGame);

        // Send confirmation back to the host who created it
        socket.emit("gameCreated", newGame);
      } catch (err){
        console.error("Error creating game:", err);
      }
    })

    // Join Game Room
    socket.on("joinGameRoom", async (gameId) => {
      socket.join(gameId);

      const info = connectedPlayers.get(socket.id);
      console.log(
        `[SERVER] Socket ${socket.id} (${info?.playerId}) joined room ${gameId}`
      );

      // If the new game state hasn't been initialized yet, do it now
      if (!getGameState(gameId)) {
        const game = await Game.findById(gameId).populate("players", "_id username");
        const playerIds = game?.players?.map((p) => p._id.toString()) || [];
        initGameState(gameId, playerIds);
      }

      // Send current game state to all players in the room
      const state = getGameState(gameId);
      io.to(gameId).emit("playerJoined", {
        socketId: socket.id,
        gameId,
        gameState: state,
      })
    });

    // Confirm player join (DB sync)
    socket.on("playerHasJoined", async (gameId) => {
    try {
      const updatedGame = await Game.findById(gameId).populate("players", "_id username");
      if (!updatedGame) return;

      console.log(`[SOCKET] Broadcasting playerJoined for game ${gameId}`);
      io.to(gameId).emit("playerJoined", {
        gameId,
        gameState: updatedGame,
      });
    } catch (err) {
      console.error("Error emitting playerJoined:", err);
    }
  });

    // Player Leaves Room
    socket.on("leaveGameRoom", (gameId) => {
      socket.leave(gameId);
      console.log(`Player ${socket.id} left room ${gameId}`);

      // Notify other clients in the room
      io.to(gameId).emit("playerLeft", {
        socketId: socket.id,
        gameId,
      });
    });

    // Start game (Host Action)
    socket.on("startGame", async (gameId) => {
      try {
        const game = await Game.findById(gameId).populate("players", "_id");
        if (!game) {
          console.error("Game not Found");
          return;
        }

        const playerIds = game.players.map((p) => p._id.toString());
        let gameState = initGameState(gameId, playerIds);

        // Switch phase to "playing"
        gameState = setGamePhase(gameId, "playing");

        // Notify all clients that the game has started
        io.to(gameId).emit("gameStarted", { gameId, gameState });
      } catch (err) {
        console.error("Error initializing game state", err);
      }
    });

    // Player Movement
    socket.on("playerMove", ({ gameId, playerId, direction }) => {
      // Update the player's position in the game state
      const updatedState = movePlayer(gameId, playerId, direction);

      // Broadcast updated state to all players in the same room
      if (updatedState) {
        io.to(gameId).emit("stateUpdated", updatedState);
      }
    });

    // Request Current State (on reconnect)
    socket.on("requestCurrentState", (gameId, callback) => {
      const state = getGameState(gameId);
      console.log(
        `[SERVER] Sending current state to socket ${socket.id} for game ${gameId}`
      );

      // Return state directly to requester via callback
      if (callback) callback(state);
    });

    // Handle Disconect
    socket.on("disconnect", () => {
      const playerInfo = connectedPlayers.get(socket.id);

      console.log(
        `[SERVER] Disconnected socket ${socket.id}, playerInfo:`,
        playerInfo
      );

      // Clean up player from map
      connectedPlayers.delete(socket.id);
    });
  });
}
