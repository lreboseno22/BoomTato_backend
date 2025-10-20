import {
  initGameState,
  movePlayer,
  getGameState,
} from "../game/stateManager.mjs";
import Game from "../models/Game.js";

export default function initGameSocket(io) {
  const connectedPlayers = new Map();

  io.on("connection", (socket) => {
    console.log(`[SERVER] Player connected: ${socket.id}`);

    // Handle player identification
    socket.on("registerPlayer", (playerId) => {
      connectedPlayers.set(socket.id, { playerId });
      console.log(
        `[SERVER] Registerd player ${playerId} for socket ${socket.id}`
      );
    });

    // Player joins a game room
    socket.on("joinGameRoom", async (gameId) => {
      socket.join(gameId);

      const info = connectedPlayers.get(socket.id);
      console.log(
        `[SERVER] Socket ${socket.id} (${info?.playerId}) joined room ${gameId}`
      );

      // Ensure a game state exists
      if (!getGameState(gameId)) {
        const game = await Game.findById(gameId).populate("players", "_id");
        const playerIds = game?.players?.map((p) => p._id.toString()) || [];
        initGameState(gameId, playerIds);
      }

      io.to(gameId).emit("playerJoined", { socketId: socket.id, gameId });
    });

    // Player leaves a game room
    socket.on("leaveGameRoom", (gameId) => {
      socket.leave(gameId);
      console.log(`Player ${socket.id} left room ${gameId}`);

      io.to(gameId).emit("playerLeft", {
        socketId: socket.id,
        gameId,
      });
    });

    // Host starts game
    socket.on("startGame", async (gameId) => {
      try {
        const game = await Game.findById(gameId).populate("players", "_id");
        if (!game) {
          console.error("Game not Found");
          return;
        }

        const playerIds = game.players.map((p) => p._id.toString());
        const initialState = initGameState(gameId, playerIds);

        io.to(gameId).emit("gameStarted", { gameId, initialState });
      } catch (err) {
        console.error("Error initializing game state", err);
      }
    });

    // Listen for player movement
    socket.on("playerMove", ({ gameId, playerId, direction }) => {
      const updatedState = movePlayer(gameId, playerId, direction);
    //   console.log(
    //     `[SERVER] Move received from ${playerId} (${socket.id}) in game ${gameId}: ${direction}`
    //   );

    //   console.log(`Movement from ${playerId}: ${direction}`);

      if (updatedState) {
        io.to(gameId).emit("stateUpdated", updatedState);
      }
    });

    // Provide the current game state to a client on request
    socket.on("requestCurrentState", (gameId, callback) => {
      const state = getGameState(gameId);
      console.log(
        `[SERVER] Sending current state to socket ${socket.id} for game ${gameId}`
      );
      if (callback) callback(state);
    });

    // Handle Disconect
    socket.on("disconnect", () => {
      const playerInfo = connectedPlayers.get(socket.id);

      console.log(
        `[SERVER] Disconnected socket ${socket.id}, playerInfo:`,
        playerInfo
      );
      connectedPlayers.delete(socket.id);
    });
  });
}
