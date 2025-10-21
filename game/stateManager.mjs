// Manages real-time game state in memory

// Initialize a global Map object to store all currently active game states
const gameStates = new Map();

let ioRef = null;
 export function setIO(ioInstance){
    ioRef = ioInstance
 }


// Initialize a new game state when a match starts
// Each player starts with a default starting position for now its x=0 & y=0
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

    const potatoHolder = players.length > 0 ? players[Math.floor(Math.random() * players.length)] : null;

    const initialState = {
        players: players.reduce((acc, id, index) => {
            acc[id] = { ...positions[index], hasPotato: id === potatoHolder }; // players will spawn at different positions
            return acc;
        }, {}),
        potatoHolder, // track who currently has the potato
        potatoTimer: 0,
        lastUpdateTime: Date.now(),
        phase: "waiting",
    };

    gameStates.set(gameId, initialState);
    console.log(`State Initialized new game: ${gameId}, Potato holder: ${potatoHolder}`);
    return initialState;
}

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const PLAYER_SIZE = 32;

// check collisions with the map boundary and other players
function checkCollision(x, y){
    // Boundary
    if(x < 0 || y < 0 || x + PLAYER_SIZE > MAP_WIDTH || y + PLAYER_SIZE > MAP_HEIGHT)
        return true;
    return false;
}

// allow for player overlapping/touch to pass the potato (so its more like tag)
function checkPlayerCollision(p1, p2){
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy); //within 1 player width 
    return distance < PLAYER_SIZE;
}

// Move Player and broadcast the movement update
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

    // only update state is no collision
    if(!checkCollision(newX, newY, state, playerId)){
        player.x = newX;
        player.y = newY;
    }

    // check is there is a potato holder and if the player has a 'hasPotato' property
    if(state.potatoHolder === playerId && state.players[playerId].hasPotato){
        for(const [otherId, other] of Object.entries(state.players)) {
            if(otherId === playerId) continue;
            if(checkPlayerCollision(player, other)){
                // pass potato
                state.players[playerId].hasPotato = false;
                state.players[otherId].hasPotato = true;
                state.potatoHolder = otherId;
                console.log(`[SERVER] Potato passed from ${playerId} to ${otherId}`);

                // Reset timer after pass
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

// Get the current state of a game
export function getGameState(gameId){
    return gameStates.get(gameId);
}

const POTATO_LIMIT = 10000;
const TICK_RATE = 1000;

setInterval(() => {
    for(const [gameId, state] of gameStates.entries()) {
        if(state.phase !== "playing" || !state.potatoHolder) continue; // no potato holder = skip

        // update timer if someone has the potato
        if(state.potatoTimer === undefined) state.potatoTimer = 0;
        if(!state.lastUpdateTime) state.lastUpdateTime = Date.now();
        
        state.potatoTimer += TICK_RATE;

        const remaining = Math.max(0, POTATO_LIMIT - state.potatoTimer);
        const secondsLeft = Math.ceil(remaining / 1000);

        console.log(`[TIMER] Player: ${state.potatoHolder} has ${secondsLeft}s left`);

        // handle explosion
        if(state.potatoTimer >= POTATO_LIMIT) {
            console.log(`[BOOM] Player ${state.potatoHolder} exploded`);

            const loser = state.potatoHolder;
            const winner = Object.keys(state.players).find(id => id !== loser);

            state.potatoHolder = null; // after potato explodes there is no more potato 
            state.potatoTimer = 0; //reset
            state.lastUpdateTime = Date.now();

            state.phase = "ended";

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

        gameStates.set(gameId, state);
    }
}, TICK_RATE);

export function setGamePhase(gameId, phase) {
    const state = gameStates.get(gameId);
    if(!state) return null;

    state.phase = phase;

    if(phase === "playing"){
        // ensure there is a potato holder
        if(state.potatoHolder){
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