// Manages real-time game state in memory

// Initialize a global Map object to store all currently active game states
const gameStates = new Map();

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

    const initialState = {
        players: players.reduce((acc, id, index) => {
            acc[id] = { ...positions[index] }; // players will spawn at different positions
            return acc;
        }, {}),
    };

    gameStates.set(gameId, initialState);
    console.log(`State Initialized new game: ${gameId}`);
    return initialState;
}

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const PLAYER_SIZE = 32;

function checkCollision(x, y, state, playerId){
    // Boundary
    if(x < 0 || y < 0 || x + PLAYER_SIZE > MAP_WIDTH || y + PLAYER_SIZE > MAP_HEIGHT)
        return true;

    for(const [id, pos] of Object.entries(state.players)){
        if(id === playerId) continue;
        if(
            x < pos.x + PLAYER_SIZE &&
            x + PLAYER_SIZE > pos.x &&
            y < pos.y + PLAYER_SIZE &&
            y + PLAYER_SIZE > pos.y
        ){
            return true;
        }
    }
    return false;
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
        gameStates.set(gameId, state);
    }

    return state;
}

// Get the current state of a game
export function getGameState(gameId){
    return gameStates.get(gameId);
}