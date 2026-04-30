/**
 * GameManager- Dingleton's game manager. Manages the games and their states.
 */

class GameManager {
    constructor() {
        //Map para busqueda rapida por  ID de juego
        this.games = new Map();
        this.TIEMPO_ESPERA =30000; //30 segundos de espera para iniciar el juego
    }

    //Por si queremos que se guarde o actualice la partida

    save(gameId, gameData) {
        this.games.set(gameId, gameData);
    return true;
}

    //Obtener la partida por ID
    get(gameId) {
        return this.games.get(gameId);
    }

    //Elimina una partida cuando se acaba
    delete(gameId) {
        return this.games.delete(gameId);
    }

    //Obtiene todas las partidas activas
    getAll() {
        return Array.from(this.games.values());
    }

    //Actualiza solo una parte del estado(como lo seria reducir la vida del tanke)

    updateTankHealth(gameId, playerId, damage) {
        const game = this.get(gameId);
        if (!game) return false;
        const player = game.jugadores.find(p => p.id === playerId);
        if (!player) return false;
        player.Tank.health -= damage;
        if (player.Tank.health < 0) player.Tank.health = 0;
        this.save(gameId, game);
        return true;
    }

    removePlayer(gameId, playerId) {
        const game = this.get(gameId);
        if (!game) return null;
        //filtra el jugador que se va a eliminar, dejando solo los que no coinciden con el ID del jugador a eliminar
        game.jugadores = game.jugadores.filter(p => p.id !== playerId);
       
       //Si hay menos del minimo de jugadores y habia cuenta atras se cancela
        if (game.jugadores.length < 2 && game.countdown) {
            clearTimeout(game.countdown);//detiene el coundown
            game.countdown = null;//Limpia la referencia
            game.estado = 'espera';//vuelve añ estado de espera
        }

        //Si la partida queda vacia se elimina
        if (game.jugadores.length === 0) {
            this.delete(gameId);
            return null;
        }

        this.save(gameId, game);
        return game;

    }

    //Añadir jugador y gestionar el inicio del juego

    addPlayer(gameID,player){
        const game = this.get(gameID);
        if (!game) return null;
        game.jugadores.push(player);

    

    //Inicio automatico
    if(game.jugadores.length>=game.minJugadores && game.estado === 'espera'){
        this.iniciarCuentaAtras(gameId);
}
        this.save(gameId, game);
        return game;
    
}

iniciarCuentaAtras(gameId){
    const game = this.get(gameId);
    if (!game||game.timer) return; 
    game.estado = 'cuenta atras';

    console.log('Iniciando cuenta atras para la partida ${gameId}');

    //guarda la referencia del timer para poder cancelarlo si es necesario
    game.countdown = setTimeout(() =>{
        const game = this.get(gameId);
        if (!game) return;
        game.estado = 'activa';
        game.countdown = null;
        this.save(gameId, game);
        console.log('Partida ${gameId} iniciada');
    }, this.TIEMPO_ESPERA);
}
    //Iniciio forzado drealizado por el host
    forceStart(gameId, playerID){
        const game = this.get(gameId);

        //Solo se puede empezar si tiene 2 jugadores justos y el jugador que lo inicia es el host
        if (!game || game.jugadores.length < 2 || game.jugadores[0].id !== playerID){
        this.startGame(gameId);
        return true;
    }
    return false;
}

startGame(gameId){
    const game = this.get(gameId);
    if(game.timer){
        clearTimeout(game.countdown);
        game.countdown = null;
    }
    game.estado = 'activa';
    game.fechaInicio = new Date();
    this.save(gameId, game);

    console.log('Partida ${gameId} iniciada por el host');

    //esto dispara el evento a los sockets para que actualicen el estado del juego en el cliente
}
}

const gameManager=new GameManager();
export default gameManager;