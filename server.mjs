import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import playerRoutes from "./routes/players.mjs"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use("/api/players", playerRoutes);

// Route
app.get("/", (req, res) => {
    res.send("BoomTato backend running...");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));