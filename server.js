const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
    currentPlayer: 'Ruperto',
    score: {'Ruperto': 100000, 'Juan': 100000, 'Mauricio': 100000},
    diamondStates: [
        {available: true, emoji: '💎'},
        {available: true, emoji: '💎'},
        {available: true, emoji: '☀️'},
        {available: true, emoji: '☀️'}
    ],
    goldBarStates: [
        {available: true, emoji: '💰'},
        {available: true, emoji: '💰'},
        {available: true, emoji: '🥇'},
        {available: true, emoji: '🥇'}
    ],
    rubyStates: [
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🍀'},
        {available: true, emoji: '🍀'}
    ],
    trophyStates: [
        {available: true, emoji: '💚'},
        {available: true, emoji: '💚'},
        {available: true, emoji: '🏆'},
        {available: true, emoji: '🏆'}
    ],
    takenRowsByPlayer: {Ruperto: [], Juan: [], Mauricio: []},
    takenCount: 0,
    timeLeft: 10,
};
// Función para inicializar un nuevo tablero
const initializeNewBoard = () => {
    return {
        diamondStates: [
            {available: true, emoji: '💎'}, {available: true, emoji: '💎'},
            {available: true, emoji: '☀️'}, {available: true, emoji: '☀️'}
        ],
        goldBarStates: [
            {available: true, emoji: '💰'}, {available: true, emoji: '💰'},
            {available: true, emoji: '🥇'}, {available: true, emoji: '🥇'}
        ],
        rubyStates: [
            {available: true, emoji: '🔴'}, {available: true, emoji: '🔴'},
            {available: true, emoji: '🍀'}, {available: true, emoji: '🍀'}
        ],
        trophyStates: [
            {available: true, emoji: '💚'}, {available: true, emoji: '💚'},
            {available: true, emoji: '🏆'}, {available: true, emoji: '🏆'}
        ]
    };
};

// This line should come after initializing `app`
app.use(express.static('public'));
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('initialState', gameState);

    socket.on('updateState', (updatedState) => {
        gameState = updatedState;
        io.emit('stateChanged', gameState);
        socket.on('requestReset', () => {
            // Reiniciar el estado del juego
            const newBoard = initializeNewBoard();
            gameState = {
                currentPlayer: 'Ruperto',
                score: {...gameState.score}, // Mantener los puntajes actuales
                ...newBoard,
                takenRowsByPlayer: Object.fromEntries(Object.keys(gameState.score).map(player => [player, []])),
                takenCount: 0,
                timeLeft: 10,
                disableBoard: false
            };
    
            // Emitir el nuevo estado a todos los clientes
            io.emit('gameReset', gameState);
        });
    });

    // Manejar el evento de registro de un nuevo jugador
    socket.on('registerPlayer', (username) => {
        
        gameState.score[username] = 100000; // Inicializar el puntaje del nuevo jugador
        gameState.takenRowsByPlayer[username] = []; // Inicializar las filas tomadas por el nuevo jugador
        io.emit('updatePlayersList', Object.keys(gameState.score)); // Emitir la lista actualizada de jugadores a todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});