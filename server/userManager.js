//implementa la clase UserManager para gestionar los usuarios conectados a través de Socket.io, permitiendo agregar, eliminar y obtener información de los usuarios activos en el sistema, gestionar
//sesiones de usuarios,tokens y flujos de OpenID Conect

class UserManager{
    constructor(){
        this.users = new Map(); // Almacena los usuarios activos con su ID de socket como clave
    }
    
    /**
     * 
     * guarda usuario asociado a token
     * @param {string} token - El token JWT del usuario
     * @param {object} userData - Los datos del usuario decodificados del token
     * @returns {string} El ID de socket asociado al usuario
     */
    loginUser(key, userData){
        for(let[key, value] of this.users.entries()){
            if(value.id === userData){
               this.sessions.delete(key); // Elimina la sesión anterior si el usuario ya estaba conectado
               break;
            }
    }
    this.sessions.set(token,{
        ...userData, //carpeta o archivo con los datos del usuario decodificados del token
        loginAt: new Date()
    });
}

/**
 * Obtiene la informacion de un usuario si el token es valido
 * @param {string} token - El token JWT del usuario
 * @returns {object|null} Los datos del usuario si el token es válido, o null si no lo es
 */
getUser(token){
    return this.sessions.get(token) || null;
}
 
/**Elimina la sesion  por logout
 * 
 * @param {string} token - El token JWT del usuario
 */
logoutUser(token){
    this.sessions.delete(token);
}

/**
 * Verifica si un token es válido y devuelve los datos del usuario asociado
 */
isValidToken(token){
    return this.sessions.has(token);
}

/**
 * Ver la gente conectada
 */
getActiveUsers(){
    return this.sessions.size;
}
}
//Exportamos una unica instancia (Singleton) para que sea la misma en toda la aplicación
const userManager = new UserManager();
module.exports = userManager;


     



