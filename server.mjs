import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import playerRoutes from "./routes/players.mjs";
import gameRoutes from "./routes/games.mjs";
import { logger } from "./middleware/logger.mjs";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.mjs";
import initGameSocket from "./sockets/gameSocket.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
import { setIO } from "./game/stateManager.mjs";

// Load enviornment variables from .env
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET","POST","PUT","PATCH","DELETE"]
})); // Enable CORS to allow requests from frontend
app.use(express.json()); // Parse incoming JSON payloads
app.use(logger); // Custom request logger middleware for debugging

// Connection to Database
connectDB();

// REST API Routes

// test route for deployment
app.get("/test", (req, res) => {
  console.log("[TEST ROUTE] Hit /test endpoint");
  res.json({ status: "ok" });
});

// Player-related routes
app.use("/api/players", playerRoutes);

// Game-related routes
app.use("/api/games", gameRoutes);

// Root route for quick health check
app.get("/", (req, res) => {
    res.send("BoomTato backend running...");
});

// Error Handling

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Route not Found");
});

// Centralized error handler middleware
app.use(errorHandler);

// Socket.IO Setup
const server = http.createServer(app); // creates an HTTP server to integrate Socket.IO

// Initialize Socket.IO instance
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
});

// Make the Socket.IO instance globally accessible via the state manager
setIO(io);

// Initialize all game-related socket event handlers
initGameSocket(io);

// Server Startup
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));