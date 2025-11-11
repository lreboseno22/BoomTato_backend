# BOOMTATO 

**BOOMTATO** is a **2-player full-stack multiplayer game** built with **React**, **Express**, **MongoDB**, and **Kaboom.js**, using **Socket.IO** for fast, bi-directional communication between players.  

Players can register, log in, create or join game rooms, and compete to **pass the explosive potato** before it blows up!

## Videos and Demo
[![Watch the demo](https://img.youtube.com/vi/f1bvdBxaThg/0.jpg)](https://youtu.be/f1bvdBxaThg)

---

## Features
- **Real-Time Multiplayer:** Built with **Socket.IO** to synhronize player actions across all connected clients.
- **Game Lobby System:**
    - Players can **create** **join** and **leave** lobbies.
    - The host can start the game once two players are connected.
- **Kaboom.js Gameplay:**
    - Interactive 2D enviornment rendered via Kaboom.js. 
    - Objective: **Pass the potato** before it explodes!
- **MongoDB Persistence:** Stores user data, games states, and room info across sessions.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Kaboom.js, Axios |
| Backend | Express.js, Node.js |
| Database | MongoDB (Mongoose) |
| Realtime | Socket.IO |
| Deployment | Render (Backend), Vercel (Frontend) |

---

## API Routes Overview

### Game Routes (`/api/games`)

| Method | Route | Description |
|--------|--------|-------------|
| `POST` | `/` | Create a new game |
| `GET` | `/` | Get all games |
| `GET` | `/waiting` | Get all games with `"waiting"` status |
| `GET` | `/:id` | Get a game by ID |
| `PUT` | `/:id` | Update a game by ID |
| `PUT` | `/:id/start` | Start a game |
| `PUT` | `/:id/end` | End a game |
| `PATCH` | `/:id/join` | Join an existing game |
| `PATCH` | `/:id/leave` | Leave a game |
| `DELETE` | `/:id` | Delete a game |

---

### Player Routes (`/api/players`)

| Method | Route | Description |
|--------|--------|-------------|
| `POST` | `/register` | Register a new player |
| `POST` | `/login` | Log in a player |
| `GET` | `/` | Get all players |
| `GET` | `/:id` | Get player by ID |
| `PUT` | `/:id` | Update player info |
| `DELETE` | `/:id` | Delete a player |

---

## Getting Started (Local Setup)

### 1. Clone the Repository

```bash
# Backend
git clone https://github.com/lreboseno22/BoomTato_backend
cd BoomTato_backend

# Frontend
git clone https://github.com/lreboseno22/BoomTato_frontend
cd BoomTato_frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up enviornment variables
Create a .env file in the backend root:
```bash
PORT=3000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=https://your-frontend-url.com
```

### 4. Run the app locally
```bash
npm run dev
```


## BOOMTato Frontend Here!!
Repo: https://github.com/lreboseno22/BoomTato_frontend 

## Future Improvments
- Implement bcrypt for secure password hasing
- Add JWT authentication for persistent sessions
- Add input validation with Joi or Zod
- Polish UI/UX and add animations

## Developer Notes
- Built as a portfolio project to showcase real-time multiplayer functionality with modern web tech.
- All gameplay logic, WebSocket handling, and API routes were implemented from scratch.
- Designed with scalability and modualrity in mind for future expansion (score tracking, matchmaking).

## License
This project is open source