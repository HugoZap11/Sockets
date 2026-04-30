import gameManager from './gameManager.js';

export default (io, socket) =>{

    const handleCreateGame=(payload)=>{
        //El socket.user viene del middleware de JWT que ya se hizo

        const gameId=`game-${Date.now()}`; //Genera un ID unico basado en la fecha actual
        console.log("gameManager: handleCreateGame ->"+gameId);
        const newGame ={
            id:gameId,
            estado:'espera',
            jugadores:[{
                id:socket.user.id,
                nombre: socket.user.nombre,
                socket: socket.id,
            }],
            mensajes:[`Juego creado por ${socket.user.nombre} con id ${gameId}`],
            fechaInicio:new Date()
        };
        socket.join(gameId); //El socket se une a la sala del juego
        gameManager.save(gameId, newGame); //Guarda el juego en el gameManager
        
        io.to(gameId).emit('gameCreated', newGame); //Emite el evento a todos los sockets en la sala del juego

        socket.emit('gameCreated', {id:gameId}); //Emite el evento al socket que creó el juego

        io.emit('partidas', gameManager.getAll()); //Emite el evento a todos los sockets conectados con la lista de partidas actualizada    


    };

    const handleShoot=(payload)=>{
        const{ gameId,targetTankId}=payload;
        console.log(`Disparo a ${targetTankId} en el juego ${gameId}`);
        const game=gameManager.get(gameId);
        //Logica de validacion del disparo, por ejemplo, verificar si el tanque objetivo está en el juego y si el disparo es válido

};

const handleStartGame=(payload)=>{
    const{ gameId, targetId}=payload;
    const game = gameManager.get(gameId);

    if(!game){
        socket.emit('error', {message:'Juego no encontrado'});
        return;
    }

    game.estado='en progreso';
    gameManager.save(gameId, game); //Actualiza el estado del juego en el gameManager
    socket.join(gameId); //El socket se une a la sala del juego
    io.to(gameId).emit('gameStarted', game); //Emite el evento a todos los sockets en la sala del juego

};

const handleJoinGame=(payload)=>{
    const{ gameId}=payload;
    const game=gameManager.get(gameId);
    if(!game){
        socket.emit('error', {message:'Juego no encontrado'});
        return;
    }

    //verifica si el usuario ya está en el juego
    const jugadorEnJuego=game.jugadores.some(jugador=>jugador.id===socket.user.id);
    if(jugadorEnJuego) return;

    const nuevoJugador={
        id:socket.user.id,
        nombre: socket.user.nombre,
        socket: socket.id,
    };

    game,jugadores.push(nuevoJugador);
    gameManager.save(gameId, game);
    socket.join(gameId); //El socket se une a la sala del juego
    io.to(gameId).emit('playerJoined', game); //Emite el evento a todos los sockets en la sala del juego
};

    socket.on('createGame', handleCreateGame);
    socket.on('shoot', handleShoot);
    socket.on('startGame', handleStartGame);
    socket.on('joinGame', handleJoinGame);
};