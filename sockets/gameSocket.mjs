import { initGameState, movePlayer, getGameState } from "../game/stateManager.mjs";
import Game from "../models/Game.js";

export default function initGameSocket(io) {

    const connectedPlayers = new Map();

    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);

        // Handle player identification
        socket.on("registerPlayer", (playerId) => {
            connectedPlayers.set(socket.id, { playerId });
            console.log(`Player ${playerId} registered with socket ${socket.id}`);
        });

        // Player joins a game room
        socket.on("joinGameRoom", (gameId) => {
            socket.join(gameId);
            console.log(`Player ${socket.id} joined room ${gameId}`);

            // Notify everyone in that room
            io.to(gameId).emit("playerJoined", {
                socketId: socket.id,
                gameId,
            });
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
                if(!game){
                    console.error("Game not Found")
                    return;
                }

                const playerIds = game.players.map(p => p._id.toString());
                const initialState = initGameState(gameId, playerIds);

                io.to(gameId).emit("gameStarted", { gameId, initialState });
            } catch (err) {
                console.error("Error initializing game state", err);
            }
        });

        // Listen for player movement
        socket.on("playerMove", ({ gameId, playerId, direction }) => {
            const updatedState = movePlayer(gameId, playerId, direction);
            
            if(updatedState){
                io.to(gameId).emit("stateUpdated", updatedState);
            }
        })

        // Handle Disconect
        socket.on("disconnect", () => {
            const playerInfo = connectedPlayers.get(socket.id);
            if(playerInfo){
                io.to(playerInfo.gameId).emit("playerDisconnected", playerInfo.playerId);
                console.log(`Player ${playerInfo.playerId} disconnected (${socket.id})`);
                connectedPlayers.delete(socket.id);
            } else {
                console.log(`Socket ${socket.id} disconnected`);
            }
        });
    })
}