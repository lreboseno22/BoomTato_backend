# BOOMTATO 

**BOOMTATO** is a **2-player full-stack multiplayer game** built with **React**, **Express**, **MongoDB**, and **Kaboom.js**, using **Socket.IO** for real-time gameplay communication.  

Players can register, log in, create or join games, and compete to **pass the explosive potato** before it blows up!

---

## Features
- **Real-Time Multiplayer:** Built with **Socket.IO to sync player actions across clients.
- **Game Lobby System:**
    - Players can **create** **join** and **leave** game rooms.
    - The game starts once two players are connected.
- **Kaboom.js Gameplay:**
    - The **Kaboom Canvas renders the interactive game enviornment.
    - Objective: **Pass the potato** before the timer runs out!
- **MongoDB Persistence:** Stores users, games, and their states.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Kaboom.js |
| Backend | Express.js, Node.js |
| Database | MongoDB |
| Realtime | Socket.IO |

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

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/lreboseno22/BoomTato_backend
```

### 2. Install Dependencies

```bash
npm install
```

## BOOMTato Frontend

Here: https://github.com/lreboseno22/BoomTato_frontend 

## FUTURE FEATURES
Implement password hashing (bcrypt) for secure authentication
Add JWT token generation for session-based login
Validate incoming request bodies with a schema validator (e.g., Joi or Zod)