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

// Load enviornment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Connection to MongoDB
connectDB();

// Routes
app.use("/api/players", playerRoutes);
app.use("/api/games", gameRoutes);

// Root Route
app.get("/", (req, res) => {
    res.send("BoomTato backend running...");
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Route not Found");
});

app.use(errorHandler);

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
});

// Initialize game sockets
initGameSocket(io);

// Start server
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));