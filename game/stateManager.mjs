
/**
 * StateManager.mjs
 * 
 * Handles real-time game state management for BOOMTato.
 * This modeule tracks all live games, manages in-memory state updates, 
 * movement logic, collision checks, potato passing and game phases.
 * 
 * It operates independently from the database to ensure real-time performance.
 */

// Global & SetUp

// All active game states stored in memory
const gameStates = new Map();

// Reference to the Socket.IO instance (set in server.mjs)
let ioRef = null;

/**
 * Store a reference to the Socket.IO instance.
 * Allows emitting events from within the state manager.
 */
 export function setIO(ioInstance){
    ioRef = ioInstance
 }

// Game State Initialization

/**
 * Initialize a new game state when a match starts.
 * Each player spawns at a default position, and one random player
 * is assigned the “potato” at the start.
 */
export function initGameState(gameId, players) {
    if(!Array.isArray(players)){
        console.warn("players is not an array")
        players = [];
    }

    const MAP_WIDTH = 800;

    const positions = [
        { x: 50, y: 50 },
        { x: MAP_WIDTH -82, y: 50 },
    ];

    // Randomly choose the starting potato holder
    const potatoHolder = players.length > 0 ? players[Math.floor(Math.random() * players.length)] : null;

    const initialState = {
        players: players.reduce((acc, id, index) => {
            acc[id] = { ...positions[index], hasPotato: id === potatoHolder }; // players will spawn at different positions
            return acc;
        }, {}),
        potatoHolder,
        potatoTimer: 0,
        lastUpdateTime: Date.now(),
        phase: "waiting", // can be "waiting", "playing", "ended", "results"
    };

    gameStates.set(gameId, initialState);
    console.log(`State Initialized new game: ${gameId}, Potato holder: ${potatoHolder}`);
    return initialState;
}

// Movement and Collision Logic

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const PLAYER_SIZE = 32;

// Boundary collision check to prevent leaving map edges
function checkCollision(x, y){
    // Boundary
    if(x < 0 || y < 0 || x + PLAYER_SIZE > MAP_WIDTH || y + PLAYER_SIZE > MAP_HEIGHT)
        return true;
    return false;
}

/**
 * Detects player-to-player collision for potato passing.
 * Returns true if players overlap within one player’s width.
 */
function checkPlayerCollision(p1, p2){
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy); //within 1 player width 
    return distance < PLAYER_SIZE;
}

// Moves a player in a given direction and handles potato passing logic
export function movePlayer(gameId, playerId, direction){
    const state = gameStates.get(gameId);
    if(!state || !state.players[playerId]) return null;

    const speed = 2;
    const player = state.players[playerId];

    let newX = player.x;
    let newY = player.y;

    switch(direction){
        case "left":
            newX -= speed;
            break;
        case "right":
            newX += speed;
            break;
        case "up":
            newY -= speed;
            break;
        case "down":
            newY += speed;
            break;
    }

    // Prevent movement through map edges
    if(!checkCollision(newX, newY, state, playerId)){
        player.x = newX;
        player.y = newY;
    }

    // Handles potato passing via collision detection
    if(state.potatoHolder === playerId && state.players[playerId].hasPotato){
        for(const [otherId, other] of Object.entries(state.players)) {
            if(otherId === playerId) continue;

            if(checkPlayerCollision(player, other)){
                // Pass the potato
                state.players[playerId].hasPotato = false;
                state.players[otherId].hasPotato = true;
                state.potatoHolder = otherId;
                console.log(`[SERVER] Potato passed from ${playerId} to ${otherId}`);

                // Reset timer when potato is passed
                state.potatoTimer = 0;
                state.lastUpdateTime = Date.now();
                console.log(`[TIMER RESET] Potato timer restarted after pass to ${otherId}`);

                break;
            }
        }
    }

    gameStates.set(gameId, state);
    return state;
}


// Game State Accessor

// Retrieve current state of a specific game
export function getGameState(gameId){
    return gameStates.get(gameId);
}

// Game Loop: Potato Timer and Explosion Logic

const POTATO_LIMIT = 10000; // 10 seconds
const TICK_RATE = 1000; // 1 second interval

// Interval loop to handle potato countdown, explosion and broadcast updates
setInterval(() => {
    for(const [gameId, state] of gameStates.entries()) {
        if(state.phase !== "playing" || !state.potatoHolder) continue; // no potato holder = skip

        // Ensure timer fields are initalized
        if(state.potatoTimer === undefined) state.potatoTimer = 0;
        if(!state.lastUpdateTime) state.lastUpdateTime = Date.now();
        
        state.potatoTimer += TICK_RATE;

        const remaining = Math.max(0, POTATO_LIMIT - state.potatoTimer);
        const secondsLeft = Math.ceil(remaining / 1000);

        console.log(`[TIMER] Player: ${state.potatoHolder} has ${secondsLeft}s left`);

        // Handle potato explosion
        if(state.potatoTimer >= POTATO_LIMIT) {
            console.log(`[BOOM] Player ${state.potatoHolder} exploded`);

            const loser = state.potatoHolder;
            const winner = Object.keys(state.players).find(id => id !== loser);

            // Notify all players after explosion
            if(ioRef){
                ioRef.to(gameId).emit("playerExploded", { loserId: loser });
            }
    
            // Reset game state after explosion
            state.potatoHolder = null; // after potato explodes there is no more potato 
            state.potatoTimer = 0; //reset
            state.lastUpdateTime = Date.now();

            state.phase = "ended";

            // Notify all players that the game ended
            if(ioRef){
                ioRef.to(gameId).emit("gameEnded", {
                    gameId,
                    winner,
                    loser,
                    state,
                });
            }

            gameStates.set(gameId, state);
            continue;
        }

        // Emit timer countdown update
        if(ioRef){
            ioRef.to(gameId).emit("timerUpdate", {
                potatoTimer: state.potatoTimer,
                potatoHolder: state.potatoHolder,
            });
        }

        gameStates.set(gameId, state);
    }
}, TICK_RATE);


// Game Phase Management

/**
 * Sets the current phase of the game (waiting, playing, ended, results).
 * Handles state transitions and initializes potato holder when needed.
 */
export function setGamePhase(gameId, phase) {
    const state = gameStates.get(gameId);
    if(!state) return null;

    state.phase = phase;

    if(phase === "playing"){
        const playerIds = Object.keys(state.players);
            if(playerIds.length > 0) {
                const randomPlayer = playerIds[Math.floor(Math.random() * playerIds.length)];
                state.potatoHolder = randomPlayer;
                state.players[randomPlayer].hasPotato = true;
                state.potatoTimer = 0;
                state.lastUpdateTime = Date.now();
                console.log(`[STATE]: Game ${gameId} started, potato assigned to ${randomPlayer}`);
        }
    }

    if(phase === "ended"){
        state.potatoHolder = null;
        console.log(`[STATE] Game ${gameId} ended`);
    }

    if(phase === "results"){
        console.log(`[STATE] Game ${gameId} showing results`);
    }

    gameStates.set(gameId, state);
    return state;
}