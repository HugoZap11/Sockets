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
            mensajes:[`Bienvenido ${socket.user.nombre} a la partida ${gameId}`],
            fechaInicio:new Date()
        };

    }

}