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

    const initialState = {
        players: players.reduce((acc, id) => {
            acc[id] = { x: 0, y: 0 }; // starting position
            return acc;
        }, {}),
    };

    gameStates.set(gameId, initialState);
    console.log(`State Initialized new game: ${gameId}`);
    return initialState;
}

// Move Player and broadcast the movement update
export function movePlayer(gameId, playerId, direction){
    const state = gameStates.get(gameId);
    if(!state || !state.players[playerId]) return null;

    const speed = 5;
    const player = state.players[playerId];

    switch(direction){
        case "left":
            player.x -= speed;
            break;
        case "right":
            player.x += speed;
            break;
        case "up":
            player.y -= speed;
            break;
        case "down":
            player.y += speed;
            break;
    }

    gameStates.set(gameId, state);
    return state;
}

// Get the current state of a game
export function getGameState(gameId){
    return gameStates.get(gameId);
}