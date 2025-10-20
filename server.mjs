import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import playerRoutes from "./routes/players.mjs";
import gameRoutes from "./routes/games.mjs";
import { logger } from "./middleware/logger.mjs";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
});

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // join
    socket.on("joinGameRoom", (gameId) => {
        socket.join(gameId);
        console.log(`Player ${socket.id} joined room ${gameId}`);
    })

    // host starts game
    socket.on("startGame", (gameId) => {
        console.log(`Game ${gameId} started - notifying room ${gameId}`)
        io.to(gameId).emit("gameStarted", gameId); // notify all players in the game room
    });

    // leave
    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    })
})

app.use("/api/players", playerRoutes);
app.use("/api/games", gameRoutes);

// Route
app.get("/", (req, res) => {
    res.send("BoomTato backend running...");
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Route not Found");
})

// Global Error Handler
app.use(function(err, req, res, next){
    res.status(500).send(err.message);
})

// Start server
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));